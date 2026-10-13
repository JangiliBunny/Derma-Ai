from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = Field(..., description="Role can be 'patient', 'doctor', or 'admin'")
    # Shared / Patient profile fields
    mobile_number: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    status: Optional[str] = "Active"
    department: Optional[str] = "Dermatology"
    patient_id: Optional[str] = None
    skin_hydration: Optional[str] = None
    allergy_risk: Optional[str] = None
    medical_history: Optional[str] = None

    # Doctor profile fields
    specialization: Optional[str] = "Dermatology"
    experience: Optional[int] = None
    hospital_name: Optional[str] = None
    patients_consulted: Optional[int] = 0
    rating: Optional[float] = 0.0
    bio: Optional[str] = None
    services: Optional[List[dict]] = []  # Expected format: [{"name": str, "price": str}]
    education: Optional[str] = None
    available_days: Optional[List[str]] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    working_hours: Optional[str] = "09:00 AM - 05:00 PM"
    max_appointments_per_day: Optional[int] = 15
    online_consultation_enabled: Optional[bool] = True

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
