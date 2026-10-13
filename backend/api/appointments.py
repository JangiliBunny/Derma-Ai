from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import re
from datetime import datetime, timedelta
from models.prediction import Appointment
from models.user import UserInDB
from api.auth import get_current_user
from database import get_database
from bson import ObjectId

router = APIRouter()

MEET_REGEX = re.compile(
    r"^https?://(meet\.google\.com/[a-zA-Z0-9_-]+)(\?.*)?$",
    re.IGNORECASE
)

def is_valid_google_meet_url(url: str) -> bool:
    if not url or not isinstance(url, str):
        return False
    url = url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url
    return bool(MEET_REGEX.match(url))

def format_meet_url(url: str) -> str:
    url = url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        return f"https://{url}"
    return url

def calculate_end_time(time_str: str) -> str:
    """Calculates default 30 minute duration for a time slot string like '09:00 AM'"""
    try:
        dt = datetime.strptime(time_str.strip(), "%I:%M %p")
        end_dt = dt + timedelta(minutes=30)
        return end_dt.strftime("%I:%M %p")
    except Exception:
        try:
            dt = datetime.strptime(time_str.strip(), "%H:%M")
            end_dt = dt + timedelta(minutes=30)
            return end_dt.strftime("%H:%M")
        except Exception:
            return time_str

@router.post("/book", response_model=Appointment)
async def book_appointment(appointment_data: dict, current_user: UserInDB = Depends(get_current_user)):
    """Patient books a new appointment"""
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can book appointments")
    
    db = get_database()
    doctor_id = appointment_data.get("doctor_id")
    if not doctor_id:
        raise HTTPException(status_code=400, detail="Doctor ID is required")

    # Check if doctor exists
    try:
        doctor = await db.users.find_one({"_id": ObjectId(doctor_id), "role": "doctor"})
    except Exception:
        doctor = await db.users.find_one({"id": doctor_id, "role": "doctor"})
        
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    date_str = appointment_data.get("date")
    time_str = appointment_data.get("time")
    if not date_str or not time_str:
        raise HTTPException(status_code=400, detail="Date and time slot are required")

    actual_doctor_id = str(doctor.get("id") or doctor.get("_id"))

    # Prevent duplicate bookings for same doctor, date, and time slot
    existing = await db.appointments.find_one({
        "doctor_id": actual_doctor_id,
        "date": date_str,
        "time": time_str,
        "status": {"$in": ["Pending", "Approved"]}
    })
    if existing:
        raise HTTPException(
            status_code=400,
            detail="This time slot is already booked for this doctor. Please choose a different date or time."
        )

    end_time_str = appointment_data.get("end_time") or calculate_end_time(time_str)

    new_appointment = {
        "id": str(ObjectId()),
        "patient_id": current_user.id,
        "doctor_id": actual_doctor_id,
        "patient_name": current_user.full_name,
        "doctor_name": doctor.get("full_name", f"Dr. {doctor.get('email')}"),
        "date": date_str,
        "time": time_str,
        "end_time": end_time_str,
        "consultation_type": appointment_data.get("consultation_type", "Online"),
        "reason": appointment_data.get("reason", "Consultation"),
        "status": "Pending",
        "meet_url": None,
        "scan_image_url": appointment_data.get("scan_image_url"),
        "created_at": datetime.utcnow()
    }

    await db.appointments.insert_one(new_appointment)
    
    print(f"NOTIFICATION: New appointment request for Dr. {doctor.get('full_name')} from {current_user.full_name}")
    return new_appointment

@router.get("/my-appointments", response_model=List[Appointment])
async def get_my_appointments(current_user: UserInDB = Depends(get_current_user)):
    """Get appointments for the logged in user (Patient or Doctor)"""
    db = get_database()
    query = {}
    if current_user.role == "patient":
        query = {"patient_id": current_user.id}
    elif current_user.role == "doctor":
        query = {"doctor_id": current_user.id}
    else:
        query = {}
    
    appointments = await db.appointments.find(query).sort("created_at", -1).to_list(100)
    
    # Backfill names if missing for existing legacy records
    for app in appointments:
        if not app.get("patient_name") and app.get("patient_id"):
            patient = await db.users.find_one({"id": app["patient_id"]})
            if patient:
                app["patient_name"] = patient.get("full_name")
        if not app.get("doctor_name") and app.get("doctor_id"):
            try:
                doctor = await db.users.find_one({"_id": ObjectId(app["doctor_id"])})
            except Exception:
                doctor = await db.users.find_one({"id": app["doctor_id"]})
            if doctor:
                app["doctor_name"] = doctor.get("full_name")

    return appointments

@router.put("/{app_id}/status", response_model=Appointment)
async def update_appointment_status(app_id: str, status_data: dict, current_user: UserInDB = Depends(get_current_user)):
    """Doctor updates the status and optional Google Meet link of an appointment"""
    db = get_database()
    if current_user.role != "doctor" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only doctors can update appointment status")

    new_status = status_data.get("status")
    if new_status not in ["Approved", "Rejected", "Cancelled", "Completed", "Rescheduled"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    appointment = await db.appointments.find_one({"id": app_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.role == "doctor" and appointment.get("doctor_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to manage this appointment")

    update_fields = {"status": new_status}

    if new_status == "Approved":
        # Check slot availability to prevent duplicate approval
        conflict = await db.appointments.find_one({
            "doctor_id": appointment["doctor_id"],
            "date": appointment["date"],
            "time": appointment["time"],
            "status": "Approved",
            "id": {"$ne": app_id}
        })
        if conflict:
            raise HTTPException(status_code=400, detail="Another appointment is already approved for this exact doctor and time slot.")

        if appointment.get("consultation_type", "Online") == "Online":
            raw_meet_url = status_data.get("meet_url") or appointment.get("meet_url") or ""
            if not raw_meet_url:
                raise HTTPException(status_code=400, detail="A valid Google Meet URL is required to approve online video consultations.")
            
            if not is_valid_google_meet_url(raw_meet_url):
                raise HTTPException(status_code=400, detail="Invalid Google Meet URL. Format should be e.g. https://meet.google.com/abc-defg-hij")
            
            update_fields["meet_url"] = format_meet_url(raw_meet_url)
    elif new_status in ["Rejected", "Cancelled"]:
        # When rejecting or cancelling, clear or retain meet_url
        update_fields["meet_url"] = None

    await db.appointments.update_one(
        {"id": app_id},
        {"$set": update_fields}
    )
    
    print(f"NOTIFICATION: Appointment {app_id} status updated to {new_status} by Dr. {current_user.full_name}")

    updated_appointment = await db.appointments.find_one({"id": app_id})
    return updated_appointment

@router.post("/{app_id}/cancel", response_model=Appointment)
async def cancel_appointment(app_id: str, current_user: UserInDB = Depends(get_current_user)):
    """Patient or Doctor cancels an appointment"""
    db = get_database()
    appointment = await db.appointments.find_one({"id": app_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if current_user.id != appointment.get("patient_id") and current_user.id != appointment.get("doctor_id") and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to cancel this appointment")

    await db.appointments.update_one(
        {"id": app_id},
        {"$set": {"status": "Cancelled", "meet_url": None}}
    )

    return await db.appointments.find_one({"id": app_id})

