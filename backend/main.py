import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import init_db, close_db, get_client, get_db_status
from ml_pipeline.inference import get_model_status

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: Verify MongoDB reachability and initialize indexes
    await init_db()
    
    # 2. Startup: Verify configured AI model status
    status = get_model_status()
    print(f"ML Inference Engine: {status.get('model_name')} ready with {status.get('supported_classes_count')} classes.")
    
    yield
    
    # 3. Shutdown: Cleanly close MongoDB client connection pool
    await close_db()

app = FastAPI(
    title="DermAI Backend API",
    description="API for Intelligent Skin Disease Detection System",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS with explicit origins
cors_origins_raw = os.getenv("CORS_ORIGINS", "").strip()
if cors_origins_raw:
    allowed_origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]
else:
    # Default explicitly for local development if not configured
    allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

# Ensure wildcard '*' is never combined with allow_credentials=True
if "*" in allowed_origins:
    raise RuntimeError(
        "SECURITY MISCONFIGURATION: Wildcard '*' cannot be combined with allow_credentials=True in CORS_ORIGINS. "
        "Please specify explicit allowed origin URLs (e.g. 'https://dermaai.vercel.app,http://localhost:3000')."
    )

print(f"CORS initialized with allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=["*"],
)

from api.auth import router as auth_router
from api.predictions import router as predictions_router
from api.doctors import router as doctors_router
from api.appointments import router as appointments_router
from api.chat import router as chat_router

# Ensure uploads directory exists for static mounts
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(predictions_router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(doctors_router, prefix="/api/doctors", tags=["Doctors"])
app.include_router(appointments_router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])

@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "Welcome to DermAI Backend API",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.get("/api/health", tags=["Health"])
async def health_check():
    """Diagnostic health check verifying database connectivity, indexes, and model status."""
    db_ok = False
    db_error = None
    try:
        c = get_client()
        await c.admin.command("ping")
        db_ok = True
    except Exception as e:
        db_error = str(e)

    model_status = get_model_status()
    db_details = get_db_status()
    is_healthy = db_ok and (model_status.get("status") == "ready")

    return {
        "status": "healthy" if is_healthy else "degraded",
        "database": {
            "connected": db_ok,
            "error": db_error,
            "email_unique_index": db_details.get("email_unique_index"),
            "duplicate_emails": db_details.get("duplicate_emails", [])
        },
        "model": model_status
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
