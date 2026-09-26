from typing import List, Dict, Any

class HotspotPredictor:
    """
    Predictive maintenance & municipal spatial hotspot clustering engine.
    """
    def analyze_hotspots(self, incidents_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Spatial hotspot grouping per zone
        zone_counts = {}
        for inc in incidents_data:
            zone = inc.get("zone_name", "Zone A - Central Sector")
            cat = inc.get("category", "Pothole")
            if zone not in zone_counts:
                zone_counts[zone] = {"count": 0, "categories": {}, "lat": inc.get("latitude", 33.6844), "lng": inc.get("longitude", 73.0479)}
            zone_counts[zone]["count"] += 1
            zone_counts[zone]["categories"][cat] = zone_counts[zone]["categories"].get(cat, 0) + 1

        hotspots = []
        for zone, data in zone_counts.items():
            top_cat = max(data["categories"], key=data["categories"].get) if data["categories"] else "Road Damage"
            risk_pct = min(98, 40 + data["count"] * 6)
            hotspots.append({
                "zone_name": zone,
                "latitude": data["lat"],
                "longitude": data["lng"],
                "incident_count": data["count"],
                "dominant_category": top_cat,
                "predicted_risk_index": risk_pct,
                "recommendation": f"High concentration of {top_cat} reports ({data['count']} active/recent). Schedule preventive crew inspection."
            })

        return hotspots

hotspot_predictor = HotspotPredictor()
