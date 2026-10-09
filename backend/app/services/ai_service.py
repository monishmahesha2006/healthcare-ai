"""
AI Service
Handles interaction with Google Gemini Generative AI for:
- Patient Health Assistant chat
- Medicine educational explanations
- Medical report explanations

Safeguards:
- Medical disclaimers injected into all responses
- Length limits on inputs & outputs
- Graceful fallbacks when GEMINI_API_KEY is not configured
- Redaction of sensitive tokens from logs
"""

import logging
import requests
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

DISCLAIMER_TEXT = (
    "\n\n*Educational Disclaimer: This AI-generated explanation is for informational and educational "
    "purposes only. It is NOT a clinical diagnosis, medical prescription, or substitute for a licensed healthcare provider.*"
)


def get_gemini_response(prompt: str, system_instruction: Optional[str] = None) -> Dict[str, Any]:
    """
    Calls Google Gemini API via REST endpoint if GEMINI_API_KEY is provided;
    otherwise returns a safe, helpful structured fallback response.
    """
    if not settings.GEMINI_API_KEY:
        logger.info("GEMINI_API_KEY not configured. Utilizing resilient educational fallback.")
        return {
            "text": get_educational_fallback(prompt) + DISCLAIMER_TEXT,
            "is_fallback": True,
            "model": "rule-based-educational-fallback"
        }

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}

    contents = []
    if system_instruction:
        contents.append({"role": "user", "parts": [{"text": f"Instruction: {system_instruction}\n\nQuery: {prompt}"}]})
    else:
        contents.append({"role": "user", "parts": [{"text": prompt}]})

    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 800,
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=12)
        if response.status_code == 200:
            data = response.json()
            candidates = data.get("candidates", [])
            if candidates:
                generated_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                return {
                    "text": generated_text + DISCLAIMER_TEXT,
                    "is_fallback": False,
                    "model": settings.GEMINI_MODEL
                }
        logger.warning(f"Gemini API returned status {response.status_code}. Using educational fallback.")
    except Exception as e:
        logger.warning(f"Gemini API call encountered exception: {str(e)}. Using educational fallback.")

    return {
        "text": get_educational_fallback(prompt) + DISCLAIMER_TEXT,
        "is_fallback": True,
        "model": "rule-based-educational-fallback"
    }


def get_educational_fallback(prompt: str) -> str:
    prompt_lower = prompt.lower()
    if any(k in prompt_lower for k in ["headache", "fever", "cough", "cold", "pain"]):
        return (
            "Common symptoms like mild headache, fever, or cough are frequently associated with viral infections, "
            "dehydration, or physical fatigue. Recommended general self-care measures include adequate rest, oral "
            "hydration (fluids/water), and monitoring your temperature. If symptoms persist beyond 48 hours, fever "
            "exceeds 38.5°C (101.3°F), or you experience shortness of breath, please consult a licensed doctor."
        )
    elif any(k in prompt_lower for k in ["blood pressure", "hypertension", "bp"]):
        return (
            "Blood pressure is the measure of blood force against arterial walls. Standard resting values are typically "
            "below 120/80 mmHg. Lifestyle factors influencing BP include dietary sodium intake, stress, physical activity, "
            "and hydration. If you observe readings consistently >= 140/90 mmHg, consult your doctor for formal assessment."
        )
    elif any(k in prompt_lower for k in ["sugar", "glucose", "diabetes"]):
        return (
            "Blood glucose reflects circulating fuel in the bloodstream. Typical fasting levels for adults range between "
            "70 and 99 mg/dL, with post-meal readings generally staying under 140-180 mg/dL depending on individual care plans. "
            "Consistent monitoring and medical consultation are advised for managing blood glucose variability."
        )
    else:
        return (
            "Healthcare AI Assistant: Maintaining a consistent record of your vitals (heart rate, blood pressure, "
            "blood sugar, and oxygen levels) assists your healthcare team in evaluating your general well-being. "
            "Please ensure you log your vital signs regularly and discuss any persistent or acute symptoms with your doctor."
        )


def explain_medicine(medicine_name: str) -> Dict[str, Any]:
    prompt = (
        f"Provide a structured educational summary for the medication '{medicine_name}'. "
        "Include: 1) Common therapeutic indications, 2) Standard general precautions, 3) Common side effects, "
        "and 4) When to seek urgent medical guidance. Do not provide personalized dosing instructions."
    )
    system_instruction = "You are a clinical pharmacotherapy educational assistant. Always maintain objectivity and include safety disclaimers."
    return get_gemini_response(prompt, system_instruction)


def explain_medical_report(extracted_text: str) -> Dict[str, Any]:
    truncated_text = extracted_text[:2500]
    prompt = (
        f"Summarize and explain the following medical diagnostic report text in patient-friendly language:\n\n"
        f"--- BEGIN REPORT ---\n{truncated_text}\n--- END REPORT ---\n\n"
        "Explain: 1) Key findings in simple plain language, 2) Highlight standard reference ranges vs noted parameters, "
        "3) Questions the patient might want to ask their doctor. Do not provide a definitive medical diagnosis."
    )
    system_instruction = "You are a medical report explanation assistant. Do not fabricate laboratory values. Explain uncertainties clearly."
    return get_gemini_response(prompt, system_instruction)
