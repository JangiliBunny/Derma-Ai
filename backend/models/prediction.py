from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PredictionResult(BaseModel):
    disease_name: str
    confidence: float
    description: str
    symptoms: List[str]
    causes: List[str]
    precautions: List[str]
    doctor_advice: str
    warning_signs: Optional[List[str]] = []
    reference_url: Optional[str] = None
    disclaimer: Optional[str] = None
    model_type: Optional[str] = None
    model_name: Optional[str] = None

class ScanHistory(BaseModel):
    id: str
    patient_id: str
    image_url: str
    image_hash: Optional[str] = None
    prediction: PredictionResult
    severity: Optional[str] = "Low"
    doctor_id: Optional[str] = None
    doctor_review: Optional[str] = "Pending"
    doctor_feedback: Optional[str] = None # Confirmed, Incorrect, Needs Testing
    doctor_diagnosis: Optional[str] = None
    treatment_plan: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Report(BaseModel):
    id: str
    scan_id: str
    patient_id: str
    doctor_id: Optional[str] = None
    doctor_comments: Optional[str] = None
    pdf_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Appointment(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    date: str  # e.g. "2026-03-10"
    time: str  # e.g. "10:30 AM"
    end_time: Optional[str] = None # e.g. "11:00 AM"
    consultation_type: str = "Online"  # "Online" or "Clinic"
    reason: str
    scan_image_url: Optional[str] = None
    status: str = "Pending"  # Pending, Approved, Rejected, Cancelled, Completed
    meet_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
