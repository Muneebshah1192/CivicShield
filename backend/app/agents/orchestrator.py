import time
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.agents.intake_agent import IntakeAgent
from app.agents.vision_agent import VisionAgent
from app.agents.nlp_agent import NLPAgent
from app.agents.geo_agent import GeospatialAgent
from app.agents.fraud_agent import FakeComplaintDetectionAgent
from app.agents.fusion_agent import DuplicateFusionAgent
from app.agents.risk_agent import RiskSeverityAgent
from app.agents.routing_agent import DepartmentRoutingAgent
from app.agents.assignment_agent import WorkerAssignmentAgent
from app.agents.response_agent import ResponseRecommendationAgent
from app.agents.resolution_agent import ResolutionVerificationAgent
from app.agents.report_agent import ReportGenerationAgent

from app.models.models import Incident, IncidentEvent, AIAgentRun, AIPrediction, IncidentCluster, Department, Worker

class CivicShieldOrchestrator:
    def __init__(self):
        self.intake_agent = IntakeAgent()
        self.vision_agent = VisionAgent()
        self.nlp_agent = NLPAgent()
        self.geo_agent = GeospatialAgent()
        self.fraud_agent = FakeComplaintDetectionAgent()
        self.fusion_agent = DuplicateFusionAgent()
        self.risk_agent = RiskSeverityAgent()
        self.routing_agent = DepartmentRoutingAgent()
        self.assignment_agent = WorkerAssignmentAgent()
        self.response_agent = ResponseRecommendationAgent()
        self.resolution_agent = ResolutionVerificationAgent()
        self.report_agent = ReportGenerationAgent()

    async def process_incident(self, db: Session, incident: Incident, raw_description: str) -> Dict[str, Any]:
        """
        Executes complete multi-agent investigation pipeline for an incident.
        """
        # 1. Intake Agent
        intake_res = await self.intake_agent.run({
            "description": raw_description,
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "category": incident.user_selected_category,
            "image_url": incident.image_url
        })
        self._record_agent_run(db, incident.id, intake_res)

        # 2. Vision Agent (YOLO Damage & Depth Estimation)
        vision_res = await self.vision_agent.run(intake_res["output"], raw_description=raw_description)
        self._record_agent_run(db, incident.id, vision_res)
        detected_category = vision_res["output"]["detected_category"]

        # 3. NLP Agent
        nlp_res = await self.nlp_agent.run(intake_res["output"])
        self._record_agent_run(db, incident.id, nlp_res)

        # 4. Fake Complaint & Fraud Detection Agent
        fraud_res = await self.fraud_agent.run(intake_res["output"], vision_res["output"], nlp_res["output"])
        self._record_agent_run(db, incident.id, fraud_res)

        # Handle Auto-Rejection for Fake / Spam complaints
        if fraud_res["output"]["is_fake"]:
            incident.status = "REJECTED"
            incident.severity_level = "LOW"
            incident.risk_score = 0.0
            rejection_msg = fraud_res["output"]["rejection_reason"]
            
            evt_fake = IncidentEvent(
                incident_id=incident.id,
                event_type="INCIDENT_REJECTED_FAKE",
                title="AI Fraud Agent Auto-Rejection",
                description=rejection_msg,
                agent_name="Fraud & Fake Complaint Detection Agent",
                metadata_json=fraud_res["output"]
            )
            db.add(evt_fake)
            db.commit()
            db.refresh(incident)
            return {
                "incident_id": incident.id,
                "status": "REJECTED",
                "is_fake": True,
                "rejection_reason": rejection_msg
            }

        # 5. Geospatial Agent
        geo_res = await self.geo_agent.run(incident.latitude, incident.longitude)
        self._record_agent_run(db, incident.id, geo_res)

        # 6. Fusion Agent (Deduplication)
        fusion_res = await self.fusion_agent.run(db, incident.latitude, incident.longitude, detected_category, raw_description)
        self._record_agent_run(db, incident.id, fusion_res)

        # 7. Risk & Severity Agent
        risk_res = await self.risk_agent.run(vision_res["output"], nlp_res["output"], geo_res["output"])
        self._record_agent_run(db, incident.id, risk_res)

        # 8. Department Routing Agent
        routing_res = await self.routing_agent.run(detected_category, risk_res["output"])
        self._record_agent_run(db, incident.id, routing_res)

        # 9. Worker Assignment Agent
        assignment_res = await self.assignment_agent.run(db, routing_res["output"]["recommended_department"], incident.latitude, incident.longitude)
        self._record_agent_run(db, incident.id, assignment_res)

        # 10. Response Recommendation Agent
        response_res = await self.response_agent.run(detected_category, risk_res["output"]["severity_level"], routing_res["output"]["recommended_department"])
        self._record_agent_run(db, incident.id, response_res)

        # Update Incident in DB with AI Agent findings
        incident.category = detected_category
        incident.title = f"{detected_category} reported in {geo_res['output']['zone_name']}"
        incident.address = geo_res["output"]["address"]
        incident.zone_id = geo_res["output"]["zone_id"]
        incident.severity_level = risk_res["output"]["severity_level"]
        incident.risk_score = risk_res["output"]["risk_score"]
        incident.priority_score = risk_res["output"]["priority_score"]

        # Link Department
        dept = db.query(Department).filter(Department.name == routing_res["output"]["recommended_department"]).first()
        if dept:
            incident.department_id = dept.id

        # Auto-recommend worker assignment
        rec_worker_id = assignment_res["output"]["recommended_worker_id"]
        if rec_worker_id:
            incident.assigned_worker_id = rec_worker_id
            incident.status = "ASSIGNED"
        else:
            incident.status = "PRIORITIZED"

        # Check fusion merge
        if fusion_res["output"]["is_duplicate"]:
            fused_id = fusion_res["output"]["fused_incident_id"]
            cluster = db.query(IncidentCluster).filter(IncidentCluster.primary_incident_id == fused_id).first()
            if not cluster:
                cluster = IncidentCluster(primary_incident_id=fused_id, report_count=1, fusion_reason=fusion_res["output"]["fusion_reason"])
                db.add(cluster)
                db.commit()
                db.refresh(cluster)
            cluster.report_count += 1
            incident.cluster_id = cluster.id
            incident.status = "DUPLICATE"

        # Store AI Prediction Record
        prediction = AIPrediction(
            incident_id=incident.id,
            model_name="CivicShield Multi-Agent Graph v2.0 (YOLO + Fraud + Fusion)",
            detected_category=detected_category,
            confidence=vision_res["confidence"],
            severity_score=risk_res["output"]["risk_score"],
            hazard_tags=vision_res["output"]["hazard_tags"],
            features_json={
                "yolo_vision": vision_res["output"],
                "nlp": nlp_res["output"],
                "fraud_check": fraud_res["output"],
                "geo": geo_res["output"],
                "routing": routing_res["output"],
                "assignment": assignment_res["output"],
                "response": response_res["output"]
            }
        )
        db.add(prediction)

        # Store Incident Events
        evt1 = IncidentEvent(
            incident_id=incident.id,
            event_type="AI_ANALYSIS_COMPLETE",
            title="Multi-Agent Investigation Completed",
            description=f"YOLO detected {detected_category} ({int(vision_res['confidence']*100)}% conf). Severity: {incident.severity_level} (Score: {incident.risk_score}). Authenticity Verified.",
            agent_name="CivicShield Orchestrator",
            metadata_json={"risk_score": incident.risk_score, "severity": incident.severity_level, "depth_metrics": vision_res["output"].get("depth_metrics")}
        )
        db.add(evt1)
        db.commit()
        db.refresh(incident)

        return {
            "incident_id": incident.id,
            "status": incident.status,
            "category": incident.category,
            "severity_level": incident.severity_level,
            "risk_score": incident.risk_score,
            "department": routing_res["output"]["recommended_department"],
            "assigned_worker_id": incident.assigned_worker_id,
            "depth_metrics": vision_res["output"].get("depth_metrics"),
            "fusion": fusion_res["output"]
        }

    def _record_agent_run(self, db: Session, incident_id: str, agent_res: Dict[str, Any]):
        run = AIAgentRun(
            incident_id=incident_id,
            agent_name=agent_res["agent_name"],
            status="COMPLETED",
            input_payload={},
            output_payload=agent_res["output"],
            confidence=agent_res.get("confidence", 0.9),
            latency_ms=agent_res.get("latency_ms", 25)
        )
        db.add(run)
        db.commit()

orchestrator = CivicShieldOrchestrator()
