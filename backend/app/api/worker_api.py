from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Incident, Worker, ResolutionEvidence, IncidentEvent
from app.schemas.schemas import IncidentOut, ResolutionSubmit
from app.agents.resolution_agent import ResolutionVerificationAgent

router = APIRouter(prefix="/worker", tags=["Field Worker Portal"])

@router.get("/jobs/{worker_id}", response_model=List[IncidentOut])
def get_worker_jobs(worker_id: int, db: Session = Depends(get_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found.")

    jobs = db.query(Incident).filter(
        Incident.assigned_worker_id == worker_id,
        Incident.status.in_(["ASSIGNED", "IN_PROGRESS", "RESOLUTION_SUBMITTED", "AI_VERIFIED", "REOPENED"])
    ).order_by(Incident.priority_score.desc()).all()
    return jobs


@router.post("/jobs/{incident_id}/start")
def start_job(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")

    incident.status = "IN_PROGRESS"
    evt = IncidentEvent(
        incident_id=incident.id,
        event_type="WORKER_STARTED_TASK",
        title="Field Worker Arrived & Started Repair",
        description="Worker marked task as IN_PROGRESS.",
        agent_name="Field Worker PWA"
    )
    db.add(evt)
    db.commit()
    return {"status": "SUCCESS", "incident_status": incident.status}


@router.post("/jobs/{incident_id}/resolve")
async def resolve_job(incident_id: str, res_in: ResolutionSubmit, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")

    resolution_agent = ResolutionVerificationAgent()
    verify_res = await resolution_agent.run(
        before_image_url=incident.image_url or "",
        after_image_url=res_in.after_image_url,
        category=incident.category,
        worker_notes=res_in.worker_notes or ""
    )

    output = verify_res["output"]

    # Save resolution evidence
    evidence = ResolutionEvidence(
        incident_id=incident.id,
        worker_id=incident.assigned_worker_id or 1,
        before_image_url=incident.image_url,
        after_image_url=res_in.after_image_url,
        ai_match_score=output["ai_verification_score_percent"],
        damage_visible_after=output["damage_visible_after"],
        verification_status=output["verification_status"],
        worker_notes=res_in.worker_notes
    )
    db.add(evidence)

    incident.status = "AI_VERIFIED" if output["verification_status"] == "PASSED" else "RESOLUTION_SUBMITTED"

    evt = IncidentEvent(
        incident_id=incident.id,
        event_type="RESOLUTION_VERIFIED",
        title=f"AI Resolution Verification: {output['verification_status']}",
        description=f"Match Score: {output['ai_verification_score_percent']}%. Worker notes: {res_in.worker_notes or 'Done'}",
        agent_name="Resolution Verification Agent",
        metadata_json=output
    )
    db.add(evt)
    db.commit()
    return {"status": "SUCCESS", "verification_output": output, "incident_status": incident.status}
