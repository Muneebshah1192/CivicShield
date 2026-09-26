from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="CITIZEN") # CITIZEN, WORKER, OFFICER, ADMIN, SUPER_ADMIN
    phone = Column(String, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="users")
    worker_profile = relationship("Worker", back_populates="user", uselist=False)


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)
    contact_email = Column(String, nullable=True)

    users = relationship("User", back_populates="department")
    workers = relationship("Worker", back_populates="department")
    incidents = relationship("Incident", back_populates="department")


class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    code = Column(String, unique=True, nullable=False)
    boundary_geojson = Column(Text, nullable=True)

    incidents = relationship("Incident", back_populates="zone")
    workers = relationship("Worker", back_populates="current_zone")


class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    current_zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    skill_tags = Column(String, default="General Maintenance") # Comma separated
    is_available = Column(Boolean, default=True)
    active_job_count = Column(Integer, default=0)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    user = relationship("User", back_populates="worker_profile")
    department = relationship("Department", back_populates="workers")
    current_zone = relationship("Zone", back_populates="workers")
    assigned_incidents = relationship("Incident", back_populates="assigned_worker")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True) # INC-1001
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False) # Road Damage, Pothole, Flood, Fallen Pole, Transformer, Streetlight, Water Leak, Garbage, Obstruction, Traffic, Fallen Tree, Construction, Other
    user_selected_category = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String, nullable=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    
    # Workflow Status
    status = Column(String, default="REPORTED") # REPORTED, ANALYZING, VERIFIED, PRIORITIZED, ASSIGNED, IN_PROGRESS, RESOLUTION_SUBMITTED, AI_VERIFIED, RESOLVED, REOPENED, REJECTED, DUPLICATE, ESCALATED
    severity_level = Column(String, default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    risk_score = Column(Float, default=50.0) # 0-100
    priority_score = Column(Float, default=50.0) # 0-100
    
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    assigned_worker_id = Column(Integer, ForeignKey("workers.id"), nullable=True)
    cluster_id = Column(Integer, ForeignKey("incident_clusters.id"), nullable=True)
    
    image_url = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    zone = relationship("Zone", back_populates="incidents")
    department = relationship("Department", back_populates="incidents")
    assigned_worker = relationship("Worker", back_populates="assigned_incidents")
    cluster = relationship("IncidentCluster", foreign_keys=[cluster_id], back_populates="incidents")
    reports = relationship("IncidentReport", back_populates="incident", cascade="all, delete-orphan")
    events = relationship("IncidentEvent", back_populates="incident", cascade="all, delete-orphan")
    agent_runs = relationship("AIAgentRun", back_populates="incident", cascade="all, delete-orphan")
    ai_predictions = relationship("AIPrediction", back_populates="incident", cascade="all, delete-orphan")
    resolution_evidence = relationship("ResolutionEvidence", back_populates="incident", uselist=False, cascade="all, delete-orphan")
    citizen_feedback = relationship("CitizenFeedback", back_populates="incident", uselist=False, cascade="all, delete-orphan")


class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    raw_description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="reports")


class IncidentCluster(Base):
    __tablename__ = "incident_clusters"

    id = Column(Integer, primary_key=True, index=True)
    primary_incident_id = Column(String, nullable=True)
    report_count = Column(Integer, default=1)
    confidence_score = Column(Float, default=100.0)
    fusion_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incidents = relationship("Incident", foreign_keys=[Incident.cluster_id], back_populates="cluster")


class IncidentEvent(Base):
    __tablename__ = "incident_events"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    event_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    agent_name = Column(String, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="events")


class AIAgentRun(Base):
    __tablename__ = "ai_agent_runs"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    agent_name = Column(String, nullable=False)
    status = Column(String, default="COMPLETED") # RUNNING, COMPLETED, FAILED
    input_payload = Column(JSON, nullable=True)
    output_payload = Column(JSON, nullable=True)
    confidence = Column(Float, nullable=True)
    latency_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="agent_runs")


class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    model_name = Column(String, nullable=False)
    detected_category = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    severity_score = Column(Float, nullable=False)
    hazard_tags = Column(JSON, nullable=True)
    features_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="ai_predictions")


class SLARule(Base):
    __tablename__ = "sla_rules"

    id = Column(Integer, primary_key=True, index=True)
    severity_level = Column(String, unique=True, nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    response_time_minutes = Column(Integer, nullable=False)
    resolution_time_minutes = Column(Integer, nullable=False)


class ResolutionEvidence(Base):
    __tablename__ = "resolution_evidence"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False, unique=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    before_image_url = Column(String, nullable=True)
    after_image_url = Column(String, nullable=False)
    ai_match_score = Column(Float, default=0.0) # 0-100%
    damage_visible_after = Column(Boolean, default=False)
    verification_status = Column(String, default="PASSED") # PASSED, FAILED, MANUAL_REVIEW
    worker_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="resolution_evidence")


class CitizenFeedback(Base):
    __tablename__ = "citizen_feedback"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False, unique=True)
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_satisfied = Column(Boolean, nullable=False)
    rating = Column(Integer, default=5) # 1-5
    comments = Column(Text, nullable=True)
    reopen_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="citizen_feedback")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    target_type = Column(String, nullable=True)
    target_id = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    details_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
