from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.chat import ChatMessage
from app.schemas.ai import ChatQuery, ChatResponse, MedicineExplainQuery, ReportExplainQuery
from app.services.ai_service import get_gemini_response, explain_medicine, explain_medical_report

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(
    query: ChatQuery,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Interacts with the AI Healthcare Assistant.
    Enforces medical safeguards, logs user message, and returns structured advice.
    """
    # 1. Log user message
    user_msg = ChatMessage(
        user_id=current_user.id,
        role="user",
        content=query.message.strip(),
        created_at=datetime.now(timezone.utc)
    )
    db.add(user_msg)
    db.commit()

    # 2. Get AI response
    system_instruction = (
        "You are an empathetic, clinical healthcare educational assistant. "
        "Explain medical terms simply. Clarify that you do not offer medical diagnosis or prescription. "
        "Recommend consulting a physician for specific health symptoms."
    )
    res = get_gemini_response(query.message.strip(), system_instruction=system_instruction)

    # 3. Log assistant response
    ai_msg = ChatMessage(
        user_id=current_user.id,
        role="assistant",
        content=res.get("text", ""),
        created_at=datetime.now(timezone.utc)
    )
    db.add(ai_msg)
    db.commit()

    return ChatResponse(
        response=res.get("text", ""),
        is_fallback=res.get("is_fallback", False),
        model=res.get("model", "educational-fallback"),
        timestamp=datetime.now(timezone.utc).isoformat()
    )


@router.post("/explain-medicine")
def explain_medication(
    query: MedicineExplainQuery,
    current_user: User = Depends(get_current_user)
):
    """Provides plain-language educational breakdown of a medication."""
    res = explain_medicine(query.medicine_name.strip())
    return {
        "medicine_name": query.medicine_name.strip(),
        "explanation": res.get("text"),
        "is_fallback": res.get("is_fallback", False)
    }


@router.post("/explain-report")
def explain_report(
    query: ReportExplainQuery,
    current_user: User = Depends(get_current_user)
):
    """Explains raw diagnostic laboratory or radiology report text."""
    res = explain_medical_report(query.text)
    return {
        "title": query.title,
        "explanation": res.get("text"),
        "is_fallback": res.get("is_fallback", False)
    }
