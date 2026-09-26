const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function fetchIncidents(params?: { status?: string; category?: string; severity?: string }) {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/incidents?${query}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch incidents");
  return res.json();
}

export async function fetchIncidentDetails(id: string) {
  const res = await fetch(`${API_BASE}/incidents/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch incident details");
  return res.json();
}

export async function createIncident(data: { description: string; latitude: number; longitude: number; category?: string; image_url?: string }) {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create incident");
  return res.json();
}

export async function assignWorker(incidentId: string, workerId: number) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ worker_id: workerId }),
  });
  if (!res.ok) throw new Error("Failed to assign worker");
  return res.json();
}

export async function submitCitizenFeedback(incidentId: string, isSatisfied: boolean, reopenReason?: string) {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_satisfied: isSatisfied, reopen_reason: reopenReason }),
  });
  if (!res.ok) throw new Error("Failed to submit feedback");
  return res.json();
}

export async function fetchDashboardAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/dashboard`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export async function fetchHotspots() {
  const res = await fetch(`${API_BASE}/analytics/hotspots`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch hotspots");
  return res.json();
}

export async function triggerSimulationScenario(scenarioType: string) {
  const res = await fetch(`${API_BASE}/simulation/trigger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario_type: scenarioType }),
  });
  if (!res.ok) throw new Error("Failed to trigger simulation");
  return res.json();
}

export async function fetchAgentTrace(incidentId: string) {
  const res = await fetch(`${API_BASE}/agents/runs/${incidentId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch agent trace");
  return res.json();
}

export async function fetchWorkerJobs(workerId: number = 1) {
  const res = await fetch(`${API_BASE}/worker/jobs/${workerId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch worker jobs");
  return res.json();
}

export async function resolveWorkerJob(incidentId: string, afterImageUrl: string, notes?: string) {
  const res = await fetch(`${API_BASE}/worker/jobs/${incidentId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ after_image_url: afterImageUrl, worker_notes: notes }),
  });
  if (!res.ok) throw new Error("Failed to resolve job");
  return res.json();
}

export async function fetchWhatIfSimulation(incidentId: string) {
  const res = await fetch(`${API_BASE}/analytics/whatif?incident_id=${incidentId}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to run what-if scenario");
  return res.json();
}
