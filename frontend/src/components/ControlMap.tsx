"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { useCivicShieldStore } from "@/lib/store";
import { AlertCircle, Clock, ShieldAlert, CheckCircle2, User, Cpu, Sparkles } from "lucide-react";

interface IncidentItem {
  id: string;
  title: string;
  category: string;
  latitude: number;
  longitude: number;
  severity_level: string;
  status: string;
  risk_score: number;
  address?: string;
  department?: { name: string };
  assigned_worker?: { user: { full_name: string } };
  image_url?: string;
}

interface ControlMapProps {
  incidents: IncidentItem[];
  hotspots?: any[];
  onSelectIncident?: (id: string) => void;
  onOpenAgentTrace?: (id: string) => void;
  onOpenWhatIf?: (id: string) => void;
}

export default function ControlMap({ incidents, hotspots = [], onSelectIncident, onOpenAgentTrace, onOpenWhatIf }: ControlMapProps) {
  const [mounted, setMounted] = useState(false);
  const { showHotspots, theme } = useCivicShieldStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-slate-900 light:bg-slate-100 border border-slate-800 light:border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 text-sm font-mono">
        Initializing Municipal Spatial Intelligence Engine...
      </div>
    );
  }

  // Create Leaflet Color Icons based on severity
  const getSeverityIcon = (severity: string, status: string) => {
    let color = "#3b82f6"; // Blue default
    if (status === "RESOLVED" || status === "AI_VERIFIED") color = "#10b981"; // Green
    else if (status === "REJECTED") color = "#64748b"; // Grey/Muted
    else if (severity === "CRITICAL") color = "#ef4444"; // Red
    else if (severity === "HIGH") color = "#f97316"; // Orange
    else if (severity === "MEDIUM") color = "#eab308"; // Yellow

    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="34" height="34" stroke="#0f172a" stroke-width="2">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `;

    return L.divIcon({
      className: severity === "CRITICAL" && status !== "RESOLVED" ? "marker-critical-pulse" : "",
      html: svgIcon,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    });
  };

  const centerLat = incidents.length > 0 ? incidents[0].latitude : 33.6844;
  const centerLng = incidents.length > 0 ? incidents[0].longitude : 73.0479;

  const tileUrl =
    theme === "light"
      ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 light:border-slate-300 shadow-2xl">
      <MapContainer center={[centerLat, centerLng]} zoom={13} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />

        {/* Predictive Hotspot Density Rings */}
        {showHotspots &&
          hotspots.map((hs, idx) => (
            <Circle
              key={idx}
              center={[hs.latitude, hs.longitude]}
              radius={850}
              pathOptions={{
                color: "#ef4444",
                fillColor: "#ef4444",
                fillOpacity: 0.28,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-xs space-y-1 p-1 font-mono">
                  <div className="font-bold text-red-500 uppercase tracking-wider">Predictive Hotspot Zone</div>
                  <div className="text-slate-100 font-semibold">{hs.zone_name}</div>
                  <div className="text-slate-400">Incident Density: {hs.incident_count} | Dominant: {hs.dominant_category}</div>
                  <div className="text-amber-400 font-medium pt-1 border-t border-slate-700">{hs.recommendation}</div>
                </div>
              </Popup>
            </Circle>
          ))}

        {/* Incident Pins */}
        {incidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.latitude, inc.longitude]}
            icon={getSeverityIcon(inc.severity_level, inc.status)}
            eventHandlers={{
              click: () => onSelectIncident && onSelectIncident(inc.id),
            }}
          >
            <Popup>
              <div className="w-64 p-1 text-slate-100 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 font-mono">
                  <span className="font-bold text-blue-400">{inc.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      inc.severity_level === "CRITICAL"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : inc.severity_level === "HIGH"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {inc.severity_level} (Risk: {inc.risk_score})
                  </span>
                </div>

                <div className="font-semibold text-slate-100 text-sm leading-tight">{inc.title}</div>
                
                <div className="text-slate-400 text-[11px] flex items-center gap-1 font-mono">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Category: {inc.category}</span>
                </div>

                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Dept:</span>
                    <span className="font-semibold text-slate-100">{inc.department?.name || "Municipal Works"}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Lead:</span>
                    <span className="font-semibold text-blue-300">{inc.assigned_worker?.user?.full_name || "Unassigned"}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Status:</span>
                    <span className="font-semibold text-emerald-400">{inc.status}</span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="pt-1 flex gap-1.5">
                  {onOpenAgentTrace && (
                    <button
                      onClick={() => onOpenAgentTrace(inc.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-2 rounded-md text-[11px] flex items-center justify-center gap-1 transition-colors"
                    >
                      <Cpu className="w-3 h-3" />
                      Agent Trace
                    </button>
                  )}
                  {onOpenWhatIf && (
                    <button
                      onClick={() => onOpenWhatIf(inc.id)}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-1 px-2 rounded-md text-[11px] flex items-center justify-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      What-If
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
