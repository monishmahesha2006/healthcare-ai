import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.core.security import get_password_hash, create_access_token
from app.models.user import User

# In-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def seeded_users(db_session):
    # Check if users already in session
    doctor = db_session.query(User).filter(User.email == "test_doctor@healthcare.ai").first()
    if not doctor:
        doctor = User(
            email="test_doctor@healthcare.ai",
            hashed_password=get_password_hash("Doctor@123"),
            full_name="Dr. Test Physician",
            role="doctor",
            specialty="Cardiology",
            is_active=True
        )
        db_session.add(doctor)

    patient1 = db_session.query(User).filter(User.email == "test_patient1@healthcare.ai").first()
    if not patient1:
        patient1 = User(
            email="test_patient1@healthcare.ai",
            hashed_password=get_password_hash("Patient@123"),
            full_name="Test Patient One",
            role="patient",
            blood_group="O+",
            is_active=True
        )
        db_session.add(patient1)

    patient2 = db_session.query(User).filter(User.email == "test_patient2@healthcare.ai").first()
    if not patient2:
        patient2 = User(
            email="test_patient2@healthcare.ai",
            hashed_password=get_password_hash("Patient@123"),
            full_name="Test Patient Two",
            role="patient",
            blood_group="A+",
            is_active=True
        )
        db_session.add(patient2)

    db_session.commit()
    return {"doctor": doctor, "patient1": patient1, "patient2": patient2}


@pytest.fixture
def doctor_headers(seeded_users):
    doctor = seeded_users["doctor"]
    token = create_access_token({"sub": str(doctor.id), "role": "doctor", "email": doctor.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def patient1_headers(seeded_users):
    patient1 = seeded_users["patient1"]
    token = create_access_token({"sub": str(patient1.id), "role": "patient", "email": patient1.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def patient2_headers(seeded_users):
    patient2 = seeded_users["patient2"]
    token = create_access_token({"sub": str(patient2.id), "role": "patient", "email": patient2.email})
    return {"Authorization": f"Bearer {token}"}
