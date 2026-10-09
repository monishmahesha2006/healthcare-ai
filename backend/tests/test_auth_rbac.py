import pytest
from fastapi import status


def test_register_patient_and_doctor(client):
    # Register patient
    resp_pat = client.post("/api/v1/auth/register", json={
        "email": "new_patient@healthcare.ai",
        "password": "Password@123",
        "full_name": "New Registered Patient",
        "role": "patient",
        "blood_group": "B+"
    })
    assert resp_pat.status_code == status.HTTP_201_CREATED
    data_pat = resp_pat.json()
    assert data_pat["user"]["email"] == "new_patient@healthcare.ai"
    assert data_pat["user"]["role"] == "patient"
    assert "access_token" in data_pat

    # Register doctor
    resp_doc = client.post("/api/v1/auth/register", json={
        "email": "new_doctor@healthcare.ai",
        "password": "Password@123",
        "full_name": "Dr. Sarah Adams",
        "role": "doctor",
        "specialty": "Neurology"
    })
    assert resp_doc.status_code == status.HTTP_201_CREATED
    data_doc = resp_doc.json()
    assert data_doc["user"]["role"] == "doctor"
    assert data_doc["user"]["specialty"] == "Neurology"


def test_login_success_and_failure(client, seeded_users):
    # Success
    resp_ok = client.post("/api/v1/auth/login", json={
        "email": "test_patient1@healthcare.ai",
        "password": "Patient@123"
    })
    assert resp_ok.status_code == status.HTTP_200_OK
    assert "access_token" in resp_ok.json()

    # Wrong password (generic message)
    resp_bad = client.post("/api/v1/auth/login", json={
        "email": "test_patient1@healthcare.ai",
        "password": "WrongPassword123!"
    })
    assert resp_bad.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Incorrect email or password" in resp_bad.json()["detail"]

    # Non-existent email (generic message, avoids account enumeration)
    resp_no_user = client.post("/api/v1/auth/login", json={
        "email": "nonexistent@healthcare.ai",
        "password": "SomePassword"
    })
    assert resp_no_user.status_code == status.HTTP_401_UNAUTHORIZED


def test_rbac_patient_forbidden_from_doctor_triage(client, patient1_headers):
    # Patient attempting to access doctor triage queue
    resp = client.get("/api/v1/doctor/triage-queue", headers=patient1_headers)
    assert resp.status_code == status.HTTP_403_FORBIDDEN
    assert "Operation not permitted" in resp.json()["detail"]


def test_rbac_doctor_allowed_triage(client, doctor_headers):
    # Doctor accessing triage queue
    resp = client.get("/api/v1/doctor/triage-queue", headers=doctor_headers)
    assert resp.status_code == status.HTTP_200_OK
    assert isinstance(resp.json(), list)


def test_unauthenticated_request_rejected(client):
    resp = client.get("/api/v1/patient/summary")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED
