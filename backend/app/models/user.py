from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="patient")  # "patient" or "doctor"
    is_active = Column(Boolean, default=True, nullable=False)

    phone = Column(String(50), nullable=True)
    date_of_birth = Column(String(50), nullable=True)
    blood_group = Column(String(10), nullable=True)
    specialty = Column(String(100), nullable=True)  # For doctors

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    vitals = relationship("VitalsRecord", back_populates="patient", cascade="all, delete-orphan", foreign_keys="VitalsRecord.patient_id")
    medicines = relationship("Medicine", back_populates="patient", cascade="all, delete-orphan", foreign_keys="Medicine.patient_id")
    reports = relationship("MedicalReport", back_populates="patient", cascade="all, delete-orphan", foreign_keys="MedicalReport.patient_id")
    patient_appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan", foreign_keys="Appointment.patient_id")
    doctor_appointments = relationship("Appointment", back_populates="doctor", foreign_keys="Appointment.doctor_id")
