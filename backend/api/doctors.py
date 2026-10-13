from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models.prediction import ScanHistory, Report
from models.user import UserInDB
from api.auth import get_current_user
from database import get_database
from bson import ObjectId
import uuid
from datetime import datetime

router = APIRouter()

async def get_doctor_user(current_user: UserInDB = Depends(get_current_user)):
    if current_user.role != "doctor" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized. Doctor access required.")
    return current_user

@router.get("/", response_model=List[dict])
async def get_all_active_doctors():
    """Returns a list of registered and active doctors for patients to browse"""
    db = get_database()
    # Find all users with role 'doctor' and optionally status 'Active'
    doctors_cursor = await db.users.find({"role": "doctor"}).to_list(100)
    
    # Sanitize the output (don't send hashed passwords)
    sanitized_doctors = []
    for doc in doctors_cursor:
        doc["_id"] = str(doc["_id"])
        if "hashed_password" in doc:
            del doc["hashed_password"]
        sanitized_doctors.append(doc)
        
    return sanitized_doctors

@router.get("/{doctor_id}", response_model=dict)
async def get_doctor_by_id(doctor_id: str):
    """Returns details for a specific doctor by ID"""
    db = get_database()
    try:
        query = {"_id": ObjectId(doctor_id), "role": "doctor"}
    except Exception:
        # Fallback if id is not ObjectId but string
        query = {"id": doctor_id, "role": "doctor"}
        
    doctor = await db.users.find_one(query)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
        
    doctor["_id"] = str(doctor["_id"])
    if "hashed_password" in doctor:
        del doctor["hashed_password"]
        
    return doctor

@router.get("/scans", response_model=List[ScanHistory])
async def get_all_patient_scans(doctor: UserInDB = Depends(get_doctor_user)):
    db = get_database()
    scans = await db.scans.find().sort("created_at", -1).to_list(length=100)
    return [ScanHistory(**s) for s in scans]

@router.post("/report/{scan_id}", response_model=Report)
async def create_doctor_report(
    scan_id: str, 
    comments: str, 
    doctor: UserInDB = Depends(get_doctor_user)
):
    db = get_database()
    scan = await db.scans.find_one({"id": scan_id})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
        
    report = Report(
        id=str(uuid.uuid4()),
        scan_id=scan_id,
        patient_id=scan["patient_id"],
        doctor_id=doctor.id,
        doctor_comments=comments
    )
    
    await db.reports.insert_one(report.dict())
    return report
