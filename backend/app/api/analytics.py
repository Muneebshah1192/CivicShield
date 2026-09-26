from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Incident, Department, Worker, IncidentCluster, SLARule
from app.ml.hotspot_model import hotspot_predictor
from app.services.sla_service import calculate_sla_status

router = APIRouter(prefix="/analytics", tags=["Analytics & Hotspots"])

@router.get("/dashboard", response_model=Dict[str, Any])
def get_dashboard_analytics(db: Session = Depends(get_db)):
    all_incidents = db.query(Incident).all()
    
    total_active = sum(1 for i in all_incidents if i.status not in ["RESOLVED", "REJECTED"])
    critical = sum(1 for i in all_incidents if i.severity_level == "CRITICAL" and i.status not in ["RESOLVED", "REJECTED"])
    high = sum(1 for i in all_incidents if i.severity_level == "HIGH" and i.status not in ["RESOLVED", "REJECTED"])
    medium = sum(1 for i in all_incidents if i.severity_level == "MEDIUM" and i.status not in ["RESOLVED", "REJECTED"])
    low = sum(1 for i in all_incidents if i.severity_level == "LOW" and i.status not in ["RESOLVED", "REJECTED"])
    in_progress = sum(1 for i in all_incidents if i.status == "IN_PROGRESS")
    resolved_today = sum(1 for i in all_incidents if i.status in ["RESOLVED", "AI_VERIFIED"])
    reopened_count = sum(1 for i in all_incidents if i.status == "REOPENED")
    duplicate_fused_count = db.query(IncidentCluster).count()

    # Calculate SLA breaches
    sla_breaches = 0
    for inc in all_incidents:
        sla_info = calculate_sla_status(inc.created_at, inc.severity_level, inc.status)
        if sla_info["is_breached"]:
            sla_breaches += 1

    # Category Breakdown
    cat_counts = {}
    for inc in all_incidents:
        cat_counts[inc.category] = cat_counts.get(inc.category, 0) + 1

    category_distribution = [{"category": k, "count": v} for k, v in cat_counts.items()]

    # Department Performance
    departments = db.query(Department).all()
    dept_performance = []
    for d in departments:
        d_incidents = [i for i in all_incidents if i.department_id == d.id]
        d_open = sum(1 for i in d_incidents if i.status not in ["RESOLVED", "REJECTED"])
        d_critical = sum(1 for i in d_incidents if i.severity_level == "CRITICAL" and i.status not in ["RESOLVED", "REJECTED"])
        dept_performance.append({
            "department_id": d.id,
            "department_name": d.name,
            "total_assigned": len(d_incidents),
            "open_count": d_open,
            "critical_count": d_critical
        })

    return {
        "stats": {
            "total_active": total_active,
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low,
            "in_progress": in_progress,
            "resolved_today": resolved_today,
            "sla_breaches": sla_breaches,
            "reopened_count": reopened_count,
            "duplicate_fused_count": duplicate_fused_count,
            "avg_response_time_minutes": 24.5
        },
        "category_distribution": category_distribution,
        "department_performance": dept_performance
    }


@router.get("/hotspots")
def get_predictive_hotspots(db: Session = Depends(get_db)):
    all_incidents = db.query(Incident).all()
    inc_data = [
        {
            "zone_name": inc.zone.name if inc.zone else "Zone A - Central Sector",
            "category": inc.category,
            "latitude": inc.latitude,
            "longitude": inc.longitude
        }
        for inc in all_incidents
    ]
    return hotspot_predictor.analyze_hotspots(inc_data)


@router.get("/heatmap_points")
def get_heatmap_points(db: Session = Depends(get_db)):
    """
    Returns [latitude, longitude, intensity] points for Leaflet heatmap layer.
    """
    all_incidents = db.query(Incident).filter(Incident.status != "REJECTED").all()
    points = []
    for inc in all_incidents:
        intensity = 0.9 if inc.severity_level == "CRITICAL" else (0.7 if inc.severity_level == "HIGH" else 0.4)
        points.append([inc.latitude, inc.longitude, intensity])
    return points


@router.post("/whatif")
def simulate_what_if_response(incident_id: str = "", db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    incident_cat = incident.category if incident else "Flooded Road"

    return {
        "incident_category": incident_cat,
        "scenarios": [
            {
                "name": "Scenario A: Immediate Emergency Dispatch",
                "risk_reduction": "High (92% reduction)",
                "cost": "Medium ($1,200)",
                "response_time": "Fast (15-20 min)",
                "recommendation_rank": 1,
                "summary": "Deploy dedicated municipal team immediately. Eliminates public safety hazard rapidly."
            },
            {
                "name": "Scenario B: Monitor & Defer Inspection 30m",
                "risk_reduction": "Low (35% reduction)",
                "cost": "Low ($200)",
                "response_time": "Slow (45-60 min)",
                "recommendation_rank": 3,
                "summary": "Delay field crew dispatch. Higher risk of traffic congestion and public complaints."
            },
            {
                "name": "Scenario C: Road Closure + Full Crew Diversion",
                "risk_reduction": "Very High (98% reduction)",
                "cost": "High ($3,500)",
                "response_time": "Immediate",
                "recommendation_rank": 2,
                "summary": "Cordon off entire road artery. Maximizes safety but causes temporary municipal transit delay."
            }
        ]
    }
