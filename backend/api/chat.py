from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime
from bson import ObjectId
import uuid

from models.user import UserInDB
from api.auth import get_current_user
from database import get_database
from services.chat_service import generate_chat_response

router = APIRouter()

@router.post("/send")
async def send_chat_message(
    payload: dict,
    current_user: UserInDB = Depends(get_current_user)
):
    """Send a user message to DermaAI Assistant and receive an intelligent response"""
    user_text = payload.get("message", "").strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    db = get_database()

    # 1. Retrieve existing chat history for this user
    history_cursor = await db.chats.find({"patient_id": current_user.id}).sort("created_at", 1).to_list(20)
    
    formatted_messages = []
    for item in history_cursor:
        formatted_messages.append({
            "role": item.get("role", "user"),
            "content": item.get("content", "")
        })

    # Append new user message
    formatted_messages.append({"role": "user", "content": user_text})

    # 2. Save user message to database
    user_msg_doc = {
        "id": str(uuid.uuid4()),
        "patient_id": current_user.id,
        "role": "user",
        "content": user_text,
        "created_at": datetime.utcnow()
    }
    await db.chats.insert_one(user_msg_doc)

    # 3. Generate AI response using Chat Service
    try:
        bot_response_text = await generate_chat_response(formatted_messages, current_user.id, db)
    except Exception as e:
        print(f"Error in chat response generation: {e}")
        bot_response_text = (
            "**Direct Answer:** I apologize, but I encountered a temporary issue processing your question.\n\n"
            "**What You Can Do:** Please try rephrasing your question or retry in a few moments. If you have an urgent medical concern, please consult a healthcare professional directly."
        )

    # 4. Save bot message to database
    bot_msg_doc = {
        "id": str(uuid.uuid4()),
        "patient_id": current_user.id,
        "role": "bot",
        "content": bot_response_text,
        "created_at": datetime.utcnow()
    }
    await db.chats.insert_one(bot_msg_doc)

    return {
        "id": bot_msg_doc["id"],
        "role": "bot",
        "content": bot_response_text,
        "created_at": bot_msg_doc["created_at"]
    }

@router.get("/history")
async def get_chat_history(current_user: UserInDB = Depends(get_current_user)):
    """Retrieve chat history for the logged in patient"""
    db = get_database()
    history = await db.chats.find({"patient_id": current_user.id}).sort("created_at", 1).to_list(100)
    
    result = []
    for item in history:
        result.append({
            "id": item.get("id") or str(item.get("_id")),
            "role": item.get("role"),
            "content": item.get("content"),
            "created_at": item.get("created_at")
        })
    return result

@router.delete("/history")
async def clear_chat_history(current_user: UserInDB = Depends(get_current_user)):
    """Clear chat history to start a new conversation"""
    db = get_database()
    await db.chats.delete_many({"patient_id": current_user.id})
    return {"message": "Chat history cleared successfully"}
