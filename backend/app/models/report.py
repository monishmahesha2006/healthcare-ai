from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(255), nullable=False)
    report_type = Column(String(100), default="General Diagnostic", nullable=False) # Blood Test, MRI, X-Ray, etc.
    file_path = Column(String(500), nullable=True)
    original_filename = Column(String(255), nullable=True)

    extracted_text = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_explanation = Column(Text, nullable=True)

    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    patient = relationship("User", back_populates="reports", foreign_keys=[patient_id])
