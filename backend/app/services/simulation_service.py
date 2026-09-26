import random
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Incident, IncidentReport, User
from app.agents.orchestrator import orchestrator

SIMULATION_SCENARIOS = {
    "Pothole": {
        "title": "Severe Deep Pothole on University Expressway",
        "description": "Large 4-foot wide asphalt hole near main campus gate causing multiple vehicles to swerve sharply and damaging tires.",
        "category": "Pothole",
        "lat": 33.6844,
        "lng": 73.0479,
        "image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop"
    },
    "Flood": {
        "title": "Flash Road Flooding & Drainage Submergence",
        "description": "Water overflowing storm drain by 2 feet on Central Commercial Avenue. Traffic completely stalled and vehicles stranded.",
        "category": "Flooded Road",
        "lat": 33.7120,
        "lng": 73.0650,
        "image_url": "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop"
    },
    "FallenPole": {
        "title": "Fallen Concrete Utility Pole & Live Electrical Wires",
        "description": "High-voltage electricity pole collapsed across main road. Sparking cables lying near pedestrian crosswalk.",
        "category": "Fallen Pole",
        "lat": 33.6950,
        "lng": 73.0580,
        "image_url": "https://images.unsplash.com/photo-1544725121-be3bf52e2dc8?w=600&auto=format&fit=crop"
    },
    "WaterLeakage": {
        "title": "Burst High-Pressure Water Main Pipeline",
        "description": "Water gushing 10 feet into the air from ruptured 12-inch municipal distribution pipe near Sector B market.",
        "category": "Water Leak",
        "lat": 33.6720,
        "lng": 73.0310,
        "image_url": "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop"
    },
    "Garbage": {
        "title": "Illegal Dump Accumulation Blocking Alleyway",
        "description": "Massive pile of uncollected solid waste and hazardous chemical containers spilling into residential roadway.",
        "category": "Garbage Accumulation",
        "lat": 33.6610,
        "lng": 73.0200,
        "image_url": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop"
    },
    "RoadBlockage": {
        "title": "Uprooted Storm Oak Tree Blocking Dual Carriageway",
        "description": "Huge oak tree fallen across both lanes following severe thunderstorm. Total obstruction of emergency vehicle lane.",
        "category": "Road Obstruction",
        "lat": 33.7250,
        "lng": 73.0810,
        "image_url": "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=600&auto=format&fit=crop"
    },
    "FakeSpam": {
        "title": "Suspicious Non-Actionable Spam Report",
        "description": "test test test fake prank complaint nothing is broken asdf",
        "category": "Other",
        "lat": 0.0,
        "lng": 0.0,
        "image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop"
    }
}

class SimulationService:
    async def trigger_simulation(self, db: Session, scenario_type: str) -> Dict[str, Any]:
        scenario = SIMULATION_SCENARIOS.get(scenario_type, SIMULATION_SCENARIOS["Pothole"])
        
        inc_number = random.randint(1000, 9999)
        inc_id = f"INC-{inc_number}"

        citizen = db.query(User).filter(User.role == "CITIZEN").first()
        citizen_id = citizen.id if citizen else 1

        new_incident = Incident(
            id=inc_id,
            title=scenario["title"],
            description=scenario["description"],
            category=scenario["category"],
            user_selected_category=scenario["category"],
            latitude=scenario["lat"],
            longitude=scenario["lng"],
            image_url=scenario["image_url"],
            status="REPORTED",
            severity_level="MEDIUM",
            risk_score=50.0,
            priority_score=50.0
        )
        db.add(new_incident)
        db.commit()

        report = IncidentReport(
            incident_id=inc_id,
            citizen_id=citizen_id,
            raw_description=scenario["description"],
            latitude=scenario["lat"],
            longitude=scenario["lng"],
            image_url=scenario["image_url"]
        )
        db.add(report)
        db.commit()

        pipeline_res = await orchestrator.process_incident(db, new_incident, scenario["description"])
        
        return {
            "simulation_scenario": scenario_type,
            "incident_id": inc_id,
            "pipeline_result": pipeline_res
        }

simulation_service = SimulationService()
