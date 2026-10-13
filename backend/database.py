import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import pymongo

client = None
database = None

db_status = {
    "connected": False,
    "email_unique_index": "pending",
    "duplicate_emails": []
}

def get_db_status():
    return db_status

def get_client() -> AsyncIOMotorClient:
    global client
    if client is None:
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        client = AsyncIOMotorClient(
            mongodb_url,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
    return client

def get_database():
    global database
    if database is None:
        c = get_client()
        database = c.dermai_db
    return database

async def init_db():
    """
    Initializes and verifies the MongoDB connection.
    - Pings the database cluster to ensure reachability (fails fast if unreachable).
    - Inspects users collection for duplicate normalized emails before index creation.
    - Halts unique index migration if duplicates are found, reporting them safely.
    - Creates indexes for scans, appointments, and chats.
    """
    global db_status
    db = get_database()
    c = get_client()

    # 1. Connectivity Ping (mandatory startup failure if unreachable)
    try:
        print("Checking MongoDB connectivity...")
        await c.admin.command("ping")
        db_status["connected"] = True
        print("MongoDB connection verified successfully.")
    except Exception as e:
        db_status["connected"] = False
        raise RuntimeError(
            f"DATABASE CONNECTION FAILURE: Unable to connect to MongoDB cluster. "
            f"Please verify your MONGODB_URL setting and network access. Details: {e}"
        )

    # 2. Check for duplicate emails before creating unique index on users.email
    duplicate_pipeline = [
        {"$group": {"_id": {"$toLower": "$email"}, "count": {"$sum": 1}, "docs": {"$push": "$email"}}},
        {"$match": {"count": {"$gt": 1}}}
    ]
    duplicates = await db.users.aggregate(duplicate_pipeline).to_list(length=100)
    if duplicates:
        dup_summary = [f"'{d['_id']}' ({d['count']} occurrences: {d['docs']})" for d in duplicates]
        print(f"\n[MIGRATION HALTED] Pre-migration check found duplicate user emails in db.users:")
        for s in dup_summary:
            print(f"  - {s}")
        print("[MIGRATION HALTED] Unique index on 'users.email' was NOT created to preserve existing user records.")
        print("[ACTION REQUIRED] Manually resolve duplicate records before the unique email index can be applied.\n")
        db_status["email_unique_index"] = "blocked_by_duplicates"
        db_status["duplicate_emails"] = dup_summary
    else:
        try:
            await db.users.create_index("email", unique=True, name="uniq_user_email")
            db_status["email_unique_index"] = "created"
            print("Index verified: db.users -> uniq_user_email")
        except Exception as e:
            db_status["email_unique_index"] = f"error: {e}"
            print(f"Warning creating users index: {e}")

    # Scans: patient_id and created_at
    try:
        await db.scans.create_index("patient_id", name="idx_scans_patient_id")
        await db.scans.create_index([("patient_id", 1), ("image_hash", 1)], name="idx_scans_patient_hash")
        await db.scans.create_index([("created_at", pymongo.DESCENDING)], name="idx_scans_created_at")
        print("Indexes verified: db.scans")
    except Exception as e:
        print(f"Warning creating scans indexes: {e}")

    # Appointments: patient_id, doctor_id, compound slot
    try:
        await db.appointments.create_index("patient_id", name="idx_appointments_patient")
        await db.appointments.create_index("doctor_id", name="idx_appointments_doctor")
        await db.appointments.create_index(
            [("doctor_id", 1), ("date", 1), ("time", 1)],
            name="idx_appointments_slot"
        )
        print("Indexes verified: db.appointments")
    except Exception as e:
        print(f"Warning creating appointments indexes: {e}")

    # Chats: patient_id and created_at
    try:
        await db.chats.create_index(
            [("patient_id", 1), ("created_at", pymongo.ASCENDING)],
            name="idx_chats_patient_created"
        )
        print("Indexes verified: db.chats")
    except Exception as e:
        print(f"Warning creating chats indexes: {e}")

async def close_db():
    """Cleanly closes the MongoDB connection pool."""
    global client, database
    if client is not None:
        print("Closing MongoDB connection pool...")
        client.close()
        client = None
        database = None
