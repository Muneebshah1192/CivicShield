import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.models import Incident, IncidentReport, IncidentEvent, User, Worker, ResolutionEvidence, CitizenFeedback, AIAgentRun
from app.schemas.schemas import IncidentCreate, IncidentOut, IncidentAssignWorker, CitizenFeedbackSubmit
from app.agents.orchestrator import orchestrator
from app.agents.resolution_agent import ResolutionVerificationAgent
from app.agents.report_agent import ReportGenerationAgent
from app.agents.bot_agent import tracking_bot_agent

router = APIRouter(prefix="/incidents", tags=["Incidents"])

class ChatQueryRequest(BaseModel):
    query: str

@router.post("/chat")
async def chat_with_assistant(req: ChatQueryRequest, db: Session = Depends(get_db)):
    """
    Conversational AI Tracking Assistant endpoint.
    Answers queries like 'Where is INC-1044?' or 'How do I report a pothole?'
    """
    res = await tracking_bot_agent.handle_query(db, req.query)
    return res

@router.post("", response_model=IncidentOut)
async def create_incident(incident_in: IncidentCreate, db: Session = Depends(get_db)):
    inc_number = random.randint(1000, 9999)
    inc_id = f"INC-{inc_number}"

    category = incident_in.category or "Road Damage"

    new_incident = Incident(
        id=inc_id,
        title=f"{category} reported by citizen",
        description=incident_in.description,
        category=category,
        user_selected_category=incident_in.category,
        latitude=incident_in.latitude,
        longitude=incident_in.longitude,
        address=incident_in.address or f"Coordinates ({incident_in.latitude:.4f}, {incident_in.longitude:.4f})",
        image_url=incident_in.image_url or "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop",
        status="REPORTED",
        severity_level="MEDIUM",
        risk_score=50.0,
        priority_score=50.0
    )
    db.add(new_incident)
    db.commit()

    # Save Citizen Report Record
    citizen_report = IncidentReport(
        incident_id=inc_id,
        raw_description=incident_in.description,
        latitude=incident_in.latitude,
        longitude=incident_in.longitude,
        address=incident_in.address,
        image_url=new_incident.image_url
    )
    db.add(citizen_report)
    db.commit()

    # Trigger Multi-Agent Orchestrator Pipeline
    await orchestrator.process_incident(db, new_incident, incident_in.description)

    db.refresh(new_incident)
    return new_incident


@router.get("", response_model=List[IncidentOut])
def list_incidents(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity_level == severity)
    if department_id:
        query = query.filter(Incident.department_id == department_id)
    if category:
        query = query.filter(Incident.category == category)
    
    return query.order_by(Incident.created_at.desc()).all()


@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident_details(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return incident


@router.post("/{incident_id}/assign", response_model=IncidentOut)
def assign_worker(incident_id: str, assign_in: IncidentAssignWorker, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")

    worker = db.query(Worker).filter(Worker.id == assign_in.worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found.")

    incident.assigned_worker_id = worker.id
    incident.status = "ASSIGNED"
    worker.active_job_count += 1

    evt = IncidentEvent(
        incident_id=incident.id,
        event_type="WORKER_ASSIGNED",
        title="Worker Assigned",
        description=f"Assigned to field worker ID #{worker.id}.",
        agent_name="Department Officer",
        metadata_json={"worker_id": worker.id}
    )
    db.add(evt)
    db.commit()
    db.refresh(incident)
    return incident


@router.post("/{incident_id}/feedback")
def submit_citizen_feedback(incident_id: str, feedback_in: CitizenFeedbackSubmit, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")

    feedback = CitizenFeedback(
        incident_id=incident.id,
        citizen_id=feedback_in.citizen_id if hasattr(feedback_in, 'citizen_id') else 1,
        is_satisfied=feedback_in.is_satisfied,
        rating=feedback_in.rating or 5,
        comments=feedback_in.comments,
        reopen_reason=feedback_in.reopen_reason
    )
    db.add(feedback)

    if not feedback_in.is_satisfied:
        incident.status = "REOPENED"
        evt = IncidentEvent(
            incident_id=incident.id,
            event_type="INCIDENT_REOPENED",
            title="Citizen Reopened Complaint",
            description=f"Citizen rejected resolution. Reason: {feedback_in.reopen_reason or 'Issue still visible'}",
            agent_name="Citizen Feedback Loop",
            metadata_json={"reopen_reason": feedback_in.reopen_reason}
        )
        db.add(evt)
    else:
        incident.status = "RESOLVED"
        evt = IncidentEvent(
            incident_id=incident.id,
            event_type="INCIDENT_RESOLVED_FINAL",
            title="Incident Closed & Verified",
            description="Citizen confirmed resolution.",
            agent_name="Citizen Confirmation"
        )
        db.add(evt)

    db.commit()
    return {"status": "SUCCESS", "incident_status": incident.status}


@router.get("/{incident_id}/report")
async def generate_incident_report_text(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")

    runs = db.query(AIAgentRun).filter(AIAgentRun.incident_id == incident_id).all()
    inc_dict = {
        "id": incident.id,
        "title": incident.title,
        "category": incident.category,
        "status": incident.status,
        "severity_level": incident.severity_level,
        "risk_score": incident.risk_score,
        "department_name": incident.department.name if incident.department else "Municipal Works"
    }

    report_agent = ReportGenerationAgent()
    res = await report_agent.run(inc_dict, runs)
    return res["output"]
