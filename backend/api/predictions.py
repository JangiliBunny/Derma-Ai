from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from models.prediction import PredictionResult, ScanHistory
from models.user import UserInDB
from api.auth import get_current_user
from api.auth import get_current_user
from ml_pipeline.inference import run_inference
from services.pdf_generator import generate_pdf_report
from database import get_database
import uuid
import os

router = APIRouter()

UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/analyze", response_model=ScanHistory)
async def analyze_skin_image(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        contents = await file.read()
        
        import hashlib
        image_hash = hashlib.sha256(contents).hexdigest()
        
        db = get_database()
        
        # Check for existing prediction
        existing_scan = await db.scans.find_one({
            "patient_id": current_user.id,
            "image_hash": image_hash
        })
        
        if existing_scan:
            return ScanHistory(**existing_scan)
        
        # Save image locally
        file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Run ML Inference
        prediction_data = await run_inference(contents)
        prediction = PredictionResult(**prediction_data)
        
        # Create scan history record
        scan_id = str(uuid.uuid4())
        scan_history = ScanHistory(
            id=scan_id,
            patient_id=current_user.id,
            image_url=file_path,
            image_hash=image_hash,
            prediction=prediction
        )
        
        # Save to database
        await db.scans.insert_one(scan_history.dict())
        
        return scan_history
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=list[ScanHistory])
async def get_patient_history(current_user: UserInDB = Depends(get_current_user)):
    db = get_database()
    scans = await db.scans.find({"patient_id": current_user.id}).to_list(length=100)
    return [ScanHistory(**s) for s in scans]

@router.get("/{scan_id}/download")
async def download_scan_report(scan_id: str, current_user: UserInDB = Depends(get_current_user)):
    try:
        db = get_database()
        from bson import ObjectId
        query = {"id": scan_id}
        if len(scan_id) == 24:
            try:
                query = {"$or": [{"id": scan_id}, {"_id": ObjectId(scan_id)}]}
            except Exception:
                pass
                
        scan = await db.scans.find_one(query)
        # If it still didn't find it, and we are searching by ObjectId maybe it doesn't have an `id` field?
        if not scan and len(scan_id) == 24:
            try:
                scan = await db.scans.find_one({"_id": ObjectId(scan_id)})
            except Exception:
                pass

        if not scan:
            # Let's see what is being queried via print for debugging
            print(f"DEBUG DOWNLOAD: scan_id = {scan_id}, query = {query}")
            raise HTTPException(status_code=404, detail=f"Scan not found for id {scan_id}")
            
        # Security check to ensure user owns scan or is a doctor
        patient_id = scan.get("patient_id")
        if patient_id != current_user.id and current_user.role == "patient":
            raise HTTPException(status_code=403, detail="Unauthorized")
            
        # Fetch patient profile from DB if possible
        patient_record = await db.users.find_one({"id": patient_id})
        patient_data = patient_record if patient_record else current_user.dict()

        # Fetch assigned doctor profile if present
        doctor_data = None
        doctor_id = scan.get("doctor_id")
        if doctor_id:
            doctor_record = await db.users.find_one({"id": doctor_id})
            if not doctor_record and len(doctor_id) == 24:
                try:
                    doctor_record = await db.users.find_one({"_id": ObjectId(doctor_id)})
                except Exception:
                    pass
            if doctor_record:
                doctor_data = doctor_record

        pred = scan.get("prediction", {})
        disease_name = pred.get("disease_name", "Unknown") if isinstance(pred, dict) else "Unknown"
        confidence = pred.get("confidence", 0.0) if isinstance(pred, dict) else 0.0
        
        pdf_path = generate_pdf_report(
            patient_name=patient_data.get("full_name", current_user.full_name), 
            disease_name=disease_name,
            confidence=confidence,
            comments=scan.get("doctor_diagnosis") or "Awaiting professional review",
            patient_data=patient_data,
            scan_data=scan,
            doctor_data=doctor_data
        )
        
        response = FileResponse(
            path=pdf_path, 
            filename=f"dermai_report_{scan_id}.pdf", 
            media_type="application/pdf"
        )
        # Ensure CORS headers on FileResponse
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Expose-Headers"] = "Content-Disposition"
        return response
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
