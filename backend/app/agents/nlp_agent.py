import time
from typing import Dict, Any

class NLPAgent:
    name = "NLP Agent"

    async def run(self, intake_output: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        desc = intake_output.get("normalized_description", "")
        desc_lower = desc.lower()

        urgency_keywords = ["danger", "emergency", "immediately", "accident", "crash", "explosion", "smoke", "sparking", "flooding", "blocked", "trapped", "severe"]
        public_safety_keywords = ["hospital", "school", "university", "main road", "highway", "heavy traffic", "children", "pedestrian"]

        found_urgency = [w for w in urgency_keywords if w in desc_lower]
        found_safety = [w for w in public_safety_keywords if w in desc_lower]

        urgency_score = min(1.0, len(found_urgency) * 0.25 + (0.5 if len(found_safety) > 0 else 0.0))
        
        output = {
            "extracted_entities": {
                "urgency_cues": found_urgency,
                "location_context_cues": found_safety,
            },
            "sentiment": "URGENT" if urgency_score > 0.6 else "CONCERNED",
            "urgency_score": round(urgency_score, 2),
            "hazard_flag": len(found_urgency) > 0 or len(found_safety) > 0,
            "parsed_summary": f"Citizen report highlights {', '.join(found_urgency) if found_urgency else 'infrastructure issue'} near {', '.join(found_safety) if found_safety else 'city sector'}."
        }

        latency = int((time.time() - start_time) * 1000)
        return {
            "agent_name": self.name,
            "confidence": 0.91,
            "latency_ms": max(latency, 28),
            "output": output
        }
