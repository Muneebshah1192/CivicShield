import time
from typing import Dict, Any

class RiskSeverityAgent:
    name = "Risk & Severity Agent"

    async def run(self, vision_data: Dict[str, Any], nlp_data: Dict[str, Any], geo_data: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()

        vision_severity_map = {"LOW": 30, "MEDIUM": 55, "HIGH": 80, "CRITICAL": 95}
        vision_hint = vision_data.get("severity_hint", "MEDIUM")
        severity_component = vision_severity_map.get(vision_hint, 55)

        urgency_score = nlp_data.get("urgency_score", 0.5)
        public_safety_component = urgency_score * 100.0

        location_impact_component = 85.0 if geo_data.get("is_main_artery") else 45.0
        infra_component = 90.0 if geo_data.get("near_critical_infra") else 35.0
        frequency_component = min(100.0, geo_data.get("historical_incident_density_30d", 10) * 5.0)

        # Weighted Formula Calculation
        # Severity (35%), Public Safety Risk (30%), Location Impact (15%), Frequency (10%), Infrastructure (10%)
        risk_score = (
            (severity_component * 0.35) +
            (public_safety_component * 0.30) +
            (location_impact_component * 0.15) +
            (frequency_component * 0.10) +
            (infra_component * 0.10)
        )
        risk_score = round(min(100.0, max(10.0, risk_score)), 1)

        if risk_score >= 80.0:
            severity_level = "CRITICAL"
        elif risk_score >= 60.0:
            severity_level = "HIGH"
        elif risk_score >= 40.0:
            severity_level = "MEDIUM"
        else:
            severity_level = "LOW"

        contributing_factors = []
        if public_safety_component > 60:
            contributing_factors.append("High public safety hazard identified in text & visual cues")
        if location_impact_component > 70:
            contributing_factors.append("Incident located on primary city transit artery")
        if infra_component > 70:
            contributing_factors.append(f"Proximity to critical infrastructure ({geo_data.get('critical_infra_name')})")
        if frequency_component > 50:
            contributing_factors.append("High historical incident recurrence in this ward")

        output = {
            "risk_score": risk_score,
            "severity_level": severity_level,
            "priority_score": round(risk_score, 1),
            "breakdown": {
                "visual_severity_weight": 35,
                "public_safety_weight": 30,
                "location_impact_weight": 15,
                "frequency_weight": 10,
                "infrastructure_weight": 10
            },
            "contributing_factors": contributing_factors
        }

        latency = int((time.time() - start_time) * 1000)
        return {
            "agent_name": self.name,
            "confidence": 0.93,
            "latency_ms": max(latency, 25),
            "output": output
        }
