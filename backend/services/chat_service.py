import os
import re
from typing import List, Dict, Any, Optional

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

SYSTEM_PROMPT = """You are DermaAI Assistant, an AI-powered skin-health information assistant. Your role is to answer general dermatology questions in clear, simple language, help users understand skin conditions and common medical terminology, explain the limitations of AI skin screening, and guide users toward appropriate professional medical care.

Guidelines & Medical Safety Rules:
1. Answer the patient's main question directly first in 1-2 clear sentences.
2. Use simple, understandable language and avoid dense medical jargon without explanation.
3. Structure your response clearly using markdown sections when applicable:
   **Direct Answer:** Concise direct response addressing the user's specific question.
   **Explanation:** Simple breakdown of the skin health concept or condition.
   **What You Can Do:** Safe, practical home care, skincare tips, or tracking advice.
   **When to Seek Medical Care:** Red flags, warning signs, and dermatologist consultation advice.
4. MEDICAL SAFETY MANDATES:
   - NEVER provide a definitive diagnosis or claim to diagnose from text or images.
   - NEVER prescribe medication, recommend specific prescription dosages, or advise stopping prescribed treatments.
   - NEVER claim a lesion or AI result is 100% benign, harmless, or cancer-free.
   - If symptoms suggest an emergency (e.g. rapidly spreading infection, high fever, severe swelling, skin sloughing), advise immediate emergency care.
   - Clarify that DermaAI AI predictions are preliminary screening tools, NOT medical diagnoses, and cannot replace a qualified dermatologist's in-person examination.
5. If the patient has screening results attached in context, explain what the predicted condition means generally and what confidence score represents, while emphasizing the need for professional confirmation.
"""

async def generate_chat_response(messages: List[Dict[str, str]], patient_id: str, db: Any) -> str:
    """Generates an accurate, safe, patient-friendly AI response using Gemini API or medical fallback engine"""
    
    # 1. Fetch patient's latest screening result from DB
    latest_scan = None
    if db is not None and patient_id:
        try:
            scans = await db.scans.find({"patient_id": patient_id}).sort("created_at", -1).to_list(1)
            if scans:
                latest_scan = scans[0]
        except Exception as e:
            print(f"Error fetching patient scans for chat context: {e}")

    # Build context string
    scan_context = ""
    if latest_scan and latest_scan.get("prediction"):
        pred = latest_scan["prediction"]
        disease = pred.get("disease_name", "Unknown")
        conf = round(pred.get("confidence", 0), 1)
        sev = latest_scan.get("severity", "Medium")
        scan_context = f"\n[Patient's Latest AI Scan: Prediced Condition: {disease}, Confidence: {conf}%, Severity: {sev}]\n"

    last_user_message = messages[-1]["content"] if messages else ""
    
    # 2. Check if GEMINI_API_KEY is configured
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    
    if api_key and HAS_GENAI:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            # Format chat history for Gemini
            prompt_content = f"{SYSTEM_PROMPT}\n{scan_context}\nConversation History:\n"
            for msg in messages[-6:]:
                role_label = "Patient" if msg["role"] == "user" else "DermaAI Assistant"
                prompt_content += f"{role_label}: {msg['content']}\n"
            prompt_content += "\nDermaAI Assistant:"

            response = model.generate_content(prompt_content)
            if response and response.text:
                return response.text.strip()
        except Exception as err:
            print(f"Gemini API error: {err}. Falling back to medical response engine.")

    # 3. Comprehensive Medical Fallback Engine (Safety-first, structured responses)
    return get_fallback_medical_response(last_user_message, latest_scan)


def get_fallback_medical_response(query: str, latest_scan: Optional[Dict[str, Any]] = None) -> str:
    q = query.lower().strip()

    # Emergency symptoms check
    if any(k in q for k in ["emergency", "difficulty breathing", "high fever", "swelling face", "severe pain", "spreading fast", "pus bleeding"]):
        return (
            "**Direct Answer:** If you are experiencing rapid swelling, high fever, severe pain, or rapidly spreading redness, please seek emergency medical attention immediately.\n\n"
            "**When to Seek Medical Care:** These symptoms can indicate a serious acute infection or severe allergic reaction requiring urgent in-person evaluation by an emergency physician or doctor."
        )

    # AI Screening report query
    if any(k in q for k in ["screening", "scan", "my result", "confidence", "report", "ai prediction"]):
        if latest_scan and latest_scan.get("prediction"):
            pred = latest_scan["prediction"]
            disease = pred.get("disease_name", "Skin condition")
            conf = round(pred.get("confidence", 0), 1)
            return (
                f"**Direct Answer:** Your latest DermaAI screening indicates a potential match for **{disease}** with a confidence score of **{conf}%**.\n\n"
                "**Explanation:** Model confidence represents statistical similarity between your image features and our dataset of diagnosed cases. It is **not** a probability that you have the disease, nor is it a confirmed medical diagnosis.\n\n"
                "**What You Can Do:** Review the symptoms and precautions provided in your scan report, and keep track of any changes in appearance or feel.\n\n"
                "**When to Seek Medical Care:** Schedule a consultation with a certified dermatologist for a thorough physical examination, as only a qualified physician can provide an official diagnosis."
            )
        else:
            return (
                "**Direct Answer:** You do not have an active AI scan report uploaded yet.\n\n"
                "**Explanation:** DermaAI allows you to upload an image of a skin lesion or concern to generate an instant preliminary AI screening report.\n\n"
                "**What You Can Do:** Visit the **New Scan** section to upload a clear photo of your skin concern for an initial screening assessment."
            )

    # Acne
    if "acne" in q or "pimple" in q or "breakout" in q or "blackhead" in q:
        return (
            "**Direct Answer:** Acne is a common skin condition occurring when hair follicles become clogged with sebum oil and dead skin cells.\n\n"
            "**Explanation:** Factors including hormonal fluctuations, stress, bacteria (*C. acnes*), and genetics contribute to breakouts ranging from mild comedones (blackheads/whiteheads) to inflamed papules and cysts.\n\n"
            "**What You Can Do:** Use a gentle, non-comedogenic cleanser twice daily. Over-the-counter ingredients like salicylic acid (unclogs pores) and benzoyl peroxide (reduces bacteria) can help mild acne.\n\n"
            "**When to Seek Medical Care:** Consult a dermatologist if you experience deep, painful cysts or if OTC products do not improve your skin after 6–8 weeks, as prescription treatments may be required to prevent scarring."
        )

    # Eczema / Dermatitis
    if "eczema" in q or "dermatitis" in q or "itchy" in q or "dry skin" in q:
        return (
            "**Direct Answer:** Eczema (atopic dermatitis) causes dry, itchy, inflamed, and irritated patches of skin.\n\n"
            "**Explanation:** Eczema stems from a compromised skin barrier and overactive immune response triggered by allergens, harsh soaps, stress, or dry climates.\n\n"
            "**What You Can Do:** Apply thick, fragrance-free moisturizers immediately after bathing to lock in hydration. Avoid harsh soaps, hot showers, and synthetic fabrics.\n\n"
            "**When to Seek Medical Care:** See a doctor if itching interferes with your sleep, if skin cracks and oozes fluid, or if you suspect a bacterial skin infection."
        )

    # Melanoma / Mole / Cancer warning
    if "melanoma" in q or "mole" in q or "cancer" in q or "spot" in q or "growth" in q:
        return (
            "**Direct Answer:** Melanoma is a serious form of skin cancer that develops in pigment-producing melanocyte cells.\n\n"
            "**Explanation:** Dermatologists evaluate moles using the **ABCDE criteria**:\n"
            "- **A**symmetry (one half doesn't match the other)\n"
            "- **B**order irregularity (ragged or blurred edges)\n"
            "- **C**olor variation (multiple shades of brown, black, or red)\n"
            "- **D**iameter (larger than 6mm / pencil eraser)\n"
            "- **E**volving (changing in size, shape, or color over time)\n\n"
            "**What You Can Do:** Perform monthly self-examinations of your skin in good lighting and note any new or evolving spots.\n\n"
            "**When to Seek Medical Care:** Have any mole that is changing, bleeding, itching, or asymmetrical evaluated promptly by a dermatologist."
        )

    # Psoriasis
    if "psoriasis" in q or "scale" in q or "plaque" in q:
        return (
            "**Direct Answer:** Psoriasis is an autoimmune skin condition that accelerates skin cell buildup, creating thick, silvery scaly patches.\n\n"
            "**Explanation:** The rapid turnover of skin cells leads to redness and scaling, commonly on elbows, knees, scalp, and torso.\n\n"
            "**What You Can Do:** Keep skin moisturized and avoid known triggers like smoking, alcohol, and skin injury.\n\n"
            "**When to Seek Medical Care:** Consult a dermatologist to explore targeted therapies such as topical corticosteroids, phototherapy, or systemic biological treatments."
        )

    # Dandruff / Seborrheic Dermatitis
    if "dandruff" in q or "scalp" in q:
        return (
            "**Direct Answer:** Dandruff is a mild form of seborrheic dermatitis that causes flaking and mild scalp itching.\n\n"
            "**Explanation:** It is often linked to an overgrowth of *Malassezia* yeast and excess scalp oil production.\n\n"
            "**What You Can Do:** Use anti-dandruff shampoos containing zinc pyrithione, ketoconazole, or selenium sulfide 2–3 times weekly.\n\n"
            "**When to Seek Medical Care:** Consult a physician if flaking persists despite anti-dandruff shampoo or if the scalp becomes severely red and painful."
        )

    # General / Default response
    return (
        "**Direct Answer:** Thank you for your question regarding your skin health.\n\n"
        "**Explanation:** Skin health is influenced by genetics, environment, hygiene, and overall wellness. While DermaAI provides general dermatological information and preliminary AI screening, every individual's skin is unique.\n\n"
        "**What You Can Do:** Maintain a consistent skincare routine with gentle cleansing, daily SPF 30+ sun protection, and proper hydration.\n\n"
        "**When to Seek Medical Care:** For personalized medical guidance, diagnosis, or evaluation of specific skin symptoms, we recommend booking a consultation with a certified dermatologist."
    )
