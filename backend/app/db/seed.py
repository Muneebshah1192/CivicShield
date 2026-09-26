import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.models.models import (
    User, Department, Zone, Worker, Incident, IncidentReport, 
    SLARule, IncidentCluster, IncidentEvent, AuditLog, ResolutionEvidence
)

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        print("Seeding CivicShield AI database with enterprise roles...")

        # 1. Departments
        departments_data = [
            {"name": "Electricity", "code": "MW-ELEC-01", "contact_email": "power@civicshield.gov"},
            {"name": "Water & Sewerage", "code": "MW-WTR-02", "contact_email": "water@civicshield.gov"},
            {"name": "Municipal Works", "code": "MW-WORKS-03", "contact_email": "works@civicshield.gov"},
            {"name": "Waste Management", "code": "MW-WASTE-04", "contact_email": "sanitation@civicshield.gov"},
            {"name": "Traffic Control", "code": "MW-TRAF-05", "contact_email": "traffic@civicshield.gov"},
            {"name": "Emergency Services", "code": "MW-EMERG-06", "contact_email": "emergency@civicshield.gov"}
        ]
        dept_objs = []
        for d in departments_data:
            dept = Department(**d)
            db.add(dept)
            dept_objs.append(dept)
        db.commit()

        # 2. Zones
        zones_data = [
            {"name": "Zone A - Central Sector", "code": "ZONE-A"},
            {"name": "Zone B - North District", "code": "ZONE-B"},
            {"name": "Zone C - South Commercial Corridor", "code": "ZONE-C"},
            {"name": "Zone D - Industrial Estate", "code": "ZONE-D"}
        ]
        zone_objs = []
        for z in zones_data:
            zone = Zone(**z)
            db.add(zone)
            zone_objs.append(zone)
        db.commit()

        # 3. SLA Rules
        sla_data = [
            {"severity_level": "CRITICAL", "response_time_minutes": 15, "resolution_time_minutes": 120},
            {"severity_level": "HIGH", "response_time_minutes": 60, "resolution_time_minutes": 360},
            {"severity_level": "MEDIUM", "response_time_minutes": 360, "resolution_time_minutes": 1440},
            {"severity_level": "LOW", "response_time_minutes": 1440, "resolution_time_minutes": 2880}
        ]
        for s in sla_data:
            db.add(SLARule(**s))
        db.commit()

        # 4. Users (Citizen, Officers, Workers, SuperAdmin)
        password_hash = get_password_hash("password123")
        users_data = [
            {"email": "citizen@civicshield.gov", "full_name": "Sarah Ahmed (Citizen)", "role": "CITIZEN", "phone": "+92-300-1111111"},
            {"email": "officer.elec@civicshield.gov", "full_name": "Eng. Tariq Mehmood (Power Lead)", "role": "OFFICER", "phone": "+92-300-2222222", "department_id": 1},
            {"email": "officer.works@civicshield.gov", "full_name": "Commander Rashid (Roads Lead)", "role": "OFFICER", "phone": "+92-300-7777777", "department_id": 3},
            {"email": "worker.ali@civicshield.gov", "full_name": "Ali Khan (Electrical Field Lead)", "role": "WORKER", "phone": "+92-300-3333333", "department_id": 1},
            {"email": "worker.usman@civicshield.gov", "full_name": "Usman Malik (Road Crew Lead)", "role": "WORKER", "phone": "+92-300-5555555", "department_id": 3},
            {"email": "superadmin@civicshield.gov", "full_name": "Director General (Super Admin)", "role": "SUPER_ADMIN", "phone": "+92-300-9999999"}
        ]
        user_objs = {}
        for u in users_data:
            user = User(
                email=u["email"],
                password_hash=password_hash,
                full_name=u["full_name"],
                role=u["role"],
                phone=u.get("phone"),
                department_id=u.get("department_id")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            user_objs[u["email"]] = user

        # 5. Workers
        workers_data = [
            {"user_email": "worker.ali@civicshield.gov", "dept_id": 1, "zone_id": 1, "skills": "High Voltage, Transformer Maintenance", "lat": 33.6950, "lng": 73.0580},
            {"user_email": "worker.usman@civicshield.gov", "dept_id": 3, "zone_id": 1, "skills": "Asphalt Patching, Heavy Equipment", "lat": 33.6844, "lng": 73.0479}
        ]
        worker_objs = []
        for w in workers_data:
            u = user_objs[w["user_email"]]
            worker = Worker(
                user_id=u.id,
                department_id=w["dept_id"],
                current_zone_id=w["zone_id"],
                skill_tags=w["skills"],
                is_available=True,
                active_job_count=1,
                latitude=w["lat"],
                longitude=w["lng"]
            )
            db.add(worker)
            worker_objs.append(worker)
        db.commit()

        # 6. Sample Initial Incidents
        sample_incidents = [
            {
                "id": "INC-1042",
                "title": "Fallen Concrete Electricity Pole near Sector B",
                "description": "High-voltage electricity pole snapped and hanging across pedestrian walkway.",
                "category": "Fallen Pole",
                "lat": 33.6950,
                "lng": 73.0580,
                "status": "IN_PROGRESS",
                "severity": "CRITICAL",
                "risk": 94.0,
                "dept_id": 1,
                "worker_id": 1,
                "image_url": "https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=600&auto=format&fit=crop"
            },
            {
                "id": "INC-1043",
                "title": "Severe Flash Road Flooding on University Expressway",
                "description": "2 feet of standing water blocking all 3 lanes near main university gate.",
                "category": "Flooded Road",
                "lat": 33.7120,
                "lng": 73.0650,
                "status": "ASSIGNED",
                "severity": "CRITICAL",
                "risk": 89.5,
                "dept_id": 2,
                "worker_id": None,
                "image_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop"
            },
            {
                "id": "INC-1044",
                "title": "Deep Pothole & Asphalt Rupture near Market Square",
                "description": "Dangerous 3-foot wide asphalt hole causing vehicle damage and traffic swerving.",
                "category": "Pothole",
                "lat": 33.6844,
                "lng": 73.0479,
                "status": "PRIORITIZED",
                "severity": "HIGH",
                "risk": 76.0,
                "dept_id": 3,
                "worker_id": 2,
                "image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop"
            },
            {
                "id": "INC-1045",
                "title": "Major Burst Main Water Pipeline",
                "description": "High pressure water pipe ruptured spilling thousands of gallons into commercial area.",
                "category": "Water Leak",
                "lat": 33.6720,
                "lng": 73.0310,
                "status": "REPORTED",
                "severity": "HIGH",
                "risk": 68.0,
                "dept_id": 2,
                "worker_id": None,
                "image_url": "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop"
            }
        ]

        for inc in sample_incidents:
            incident = Incident(
                id=inc["id"],
                title=inc["title"],
                description=inc["description"],
                category=inc["category"],
                user_selected_category=inc["category"],
                latitude=inc["lat"],
                longitude=inc["lng"],
                address=f"Sector Ward, Zone A ({inc['lat']:.4f}, {inc['lng']:.4f})",
                zone_id=1,
                status=inc["status"],
                severity_level=inc["severity"],
                risk_score=inc["risk"],
                priority_score=inc["risk"],
                department_id=inc["dept_id"],
                assigned_worker_id=inc["worker_id"],
                image_url=inc["image_url"],
                created_at=datetime.utcnow() - timedelta(minutes=random.randint(15, 120))
            )
            db.add(incident)
            db.commit()

            evt = IncidentEvent(
                incident_id=inc["id"],
                event_type="INCIDENT_CREATED",
                title="Citizen Report Created",
                description=inc["description"],
                agent_name="System Intake",
                metadata_json={"severity": inc["severity"]}
            )
            db.add(evt)

        db.commit()
        print("CivicShield AI database successfully seeded with enterprise roles!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
