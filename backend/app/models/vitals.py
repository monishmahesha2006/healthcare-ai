from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class VitalsRecord(Base):
    __tablename__ = "vitals_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    heart_rate = Column(Float, nullable=False)        # beats per minute (bpm)
    blood_sugar = Column(Float, nullable=False)       # mg/dL
    systolic_bp = Column(Float, nullable=False)       # mmHg
    diastolic_bp = Column(Float, nullable=False)      # mmHg
    temperature = Column(Float, nullable=False)       # Celsius (°C)
    spo2 = Column(Float, nullable=False)              # Oxygen saturation %

    notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    patient = relationship("User", back_populates="vitals", foreign_keys=[patient_id])
    score_log = relationship("HealthScoreLog", back_populates="vitals_record", uselist=False, cascade="all, delete-orphan")


class HealthScoreLog(Base):
    __tablename__ = "health_score_logs"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    vitals_record_id = Column(Integer, ForeignKey("vitals_records.id", ondelete="CASCADE"), nullable=False)

    score = Column(Integer, nullable=False)            # 0 - 100
    risk_category = Column(String(50), nullable=False) # LOW, MODERATE, HIGH
    deductions_summary = Column(Text, nullable=False)  # JSON or comma-separated rule list
    rule_version = Column(String(20), default="1.0.0", nullable=False)

    calculated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    vitals_record = relationship("VitalsRecord", back_populates="score_log")
