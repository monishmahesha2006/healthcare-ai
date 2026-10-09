from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(255), nullable=False, index=True)
    dosage = Column(String(100), nullable=False)        # e.g., "500 mg", "10 ml"
    frequency = Column(String(100), nullable=False)     # e.g., "Twice daily after meals"
    route = Column(String(50), default="Oral")          # Oral, Topical, Inhalation, etc.
    instructions = Column(Text, nullable=True)
    prescribed_by = Column(String(255), nullable=True)  # Doctor name or "Self-Reported" / "Prescription OCR"
    start_date = Column(String(50), nullable=True)
    end_date = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    patient = relationship("User", back_populates="medicines", foreign_keys=[patient_id])
