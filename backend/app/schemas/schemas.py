from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "CITIZEN"
    phone: Optional[str] = None
    department_id: Optional[int] = None
    department_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Department & Worker Schemas
class DepartmentOut(BaseModel):
    id: int
    name: str
    code: str
    contact_email: Optional[str]

    class Config:
        from_attributes = True

class ZoneOut(BaseModel):
    id: int
    name: str
    code: str

    class Config:
        from_attributes = True

class WorkerOut(BaseModel):
    id: int
    user_id: int
    department_id: int
    current_zone_id: Optional[int]
    skill_tags: str
    is_available: bool
    active_job_count: int
    latitude: Optional[float]
    longitude: Optional[float]
    user: UserOut
    department: Optional[DepartmentOut]

    class Config:
        from_attributes = True

# Incident Schemas
class IncidentCreate(BaseModel):
    description: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    category: Optional[str] = None # Citizen selected optional category
    image_url: Optional[str] = None

class IncidentUpdateStatus(BaseModel):
    status: str
    assigned_worker_id: Optional[int] = None
    department_id: Optional[int] = None
    notes: Optional[str] = None

class IncidentAssignWorker(BaseModel):
    worker_id: int

class ResolutionSubmit(BaseModel):
    after_image_url: str
    worker_notes: Optional[str] = None

class CitizenFeedbackSubmit(BaseModel):
    is_satisfied: bool
    rating: Optional[int] = 5
    comments: Optional[str] = None
    reopen_reason: Optional[str] = None

class IncidentEventOut(BaseModel):
    id: int
    event_type: str
    title: str
    description: Optional[str]
    agent_name: Optional[str]
    metadata_json: Optional[Any]
    created_at: datetime

    class Config:
        from_attributes = True

class AIAgentRunOut(BaseModel):
    id: int
    agent_name: str
    status: str
    input_payload: Optional[Any]
    output_payload: Optional[Any]
    confidence: Optional[float]
    latency_ms: int
    created_at: datetime

    class Config:
        from_attributes = True

class IncidentOut(BaseModel):
    id: str
    title: str
    description: str
    category: str
    user_selected_category: Optional[str]
    latitude: float
    longitude: float
    address: Optional[str]
    zone_id: Optional[int]
    status: str
    severity_level: str
    risk_score: float
    priority_score: float
    department_id: Optional[int]
    assigned_worker_id: Optional[int]
    cluster_id: Optional[int]
    image_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    
    department: Optional[DepartmentOut] = None
    assigned_worker: Optional[WorkerOut] = None
    events: List[IncidentEventOut] = []
    agent_runs: List[AIAgentRunOut] = []

    class Config:
        from_attributes = True

# Analytics & Dashboard Schemas
class DashboardStats(BaseModel):
    total_active: int
    critical: int
    high: int
    medium: int
    low: int
    in_progress: int
    resolved_today: int
    sla_breaches: int
    reopened_count: int
    duplicate_fused_count: int
    avg_response_time_minutes: float

# Simulation Schemas
class SimulationScenarioRequest(BaseModel):
    scenario_type: str # Pothole, Flood, FallenPole, WaterLeakage, Garbage, RoadBlockage
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    zone_name: Optional[str] = None
