from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import AIAgentRun, AIPrediction

router = APIRouter(prefix="/agents", tags=["AI Operations & Monitoring"])

@router.get("/status")
def get_agents_status():
    return [
        {"name": "Intake Agent", "type": "Input Validator & Normalizer", "status": "ACTIVE", "model": "CivicShield Rule Engine v1"},
        {"name": "Vision Agent", "type": "Computer Vision Classifier", "status": "ACTIVE", "model": "Vision ResNet/YOLO Hybrid"},
        {"name": "NLP Agent", "type": "Entity & Urgency Parser", "status": "ACTIVE", "model": "CivicShield NLP Transformer"},
        {"name": "Geospatial Agent", "type": "GIS & Critical Infrastructure Mapper", "status": "ACTIVE", "model": "OSM Spatial Mapper"},
        {"name": "Incident Fusion Agent", "type": "Spatial Deduplication & Cluster Engine", "status": "ACTIVE", "model": "Haversine Cluster Graph"},
        {"name": "Risk & Severity Agent", "type": "ML Severity & Risk Predictor", "status": "ACTIVE", "model": "XGBoost Severity Model"},
        {"name": "Department Routing Agent", "type": "Smart Department Mapper", "status": "ACTIVE", "model": "Domain Expert Rule Graph"},
        {"name": "Worker Assignment Agent", "type": "Multi-Objective Worker Dispatcher", "status": "ACTIVE", "model": "Proximity & Workload Optimizer"},
        {"name": "Response Recommendation Agent", "type": "Protocol Generator", "status": "ACTIVE", "model": "Municipal Mitigation Matrix"},
        {"name": "Resolution Verification Agent", "type": "Before/After Image Comparator", "status": "ACTIVE", "model": "Structural Similarity Index (SSIM)"},
        {"name": "Report Generation Agent", "type": "Executive Summary Synthesizer", "status": "ACTIVE", "model": "CivicShield Summary Engine"}
    ]

@router.get("/runs/{incident_id}")
def get_incident_agent_trace(incident_id: str, db: Session = Depends(get_db)):
    runs = db.query(AIAgentRun).filter(AIAgentRun.incident_id == incident_id).order_by(AIAgentRun.created_at.asc()).all()
    prediction = db.query(AIPrediction).filter(AIPrediction.incident_id == incident_id).first()

    return {
        "incident_id": incident_id,
        "runs": [
            {
                "id": r.id,
                "agent_name": r.agent_name,
                "status": r.status,
                "output": r.output_payload,
                "confidence": r.confidence,
                "latency_ms": r.latency_ms,
                "timestamp": r.created_at.isoformat()
            }
            for r in runs
        ],
        "prediction_record": prediction.features_json if prediction else None
    }
