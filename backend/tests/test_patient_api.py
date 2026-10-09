from fastapi import status


def test_patient_vitals_logging_and_healthengine(client, patient1_headers):
    # Log vital signs with mild tachycardia (HR: 115)
    vital_payload = {
        "heart_rate": 115.0,
        "blood_sugar": 95.0,
        "systolic_bp": 120.0,
        "diastolic_bp": 80.0,
        "temperature": 36.8,
        "spo2": 98.0,
        "notes": "Post brisk workout."
    }
    resp = client.post("/api/v1/patient/vitals", json=vital_payload, headers=patient1_headers)
    assert resp.status_code == status.HTTP_201_CREATED
    data = resp.json()
    assert data["vital"]["heart_rate"] == 115.0
    assert data["health_engine"]["score"] == 82
    assert data["health_engine"]["risk_category"] == "MODERATE"
    assert data["health_engine"]["deductions_total"] == 18

    # Query vitals history
    resp_history = client.get("/api/v1/patient/vitals", headers=patient1_headers)
    assert resp_history.status_code == status.HTTP_200_OK
    assert len(resp_history.json()) >= 1


def test_patient_medicines_lifecycle(client, patient1_headers):
    # Add medicine
    med_payload = {
        "name": "Atorvastatin Calcium",
        "dosage": "20 mg",
        "frequency": "Once daily at bedtime",
        "route": "Oral",
        "instructions": "Take consistently with water.",
        "prescribed_by": "Dr. Vance"
    }
    resp = client.post("/api/v1/patient/medicines", json=med_payload, headers=patient1_headers)
    assert resp.status_code == status.HTTP_201_CREATED
    med_data = resp.json()
    assert med_data["name"] == "Atorvastatin Calcium"
    med_id = med_data["id"]

    # List active medicines
    resp_list = client.get("/api/v1/patient/medicines", headers=patient1_headers)
    assert resp_list.status_code == status.HTTP_200_OK
    assert any(m["id"] == med_id for m in resp_list.json())

    # Update / de-activate medicine
    resp_up = client.put(f"/api/v1/patient/medicines/{med_id}", json={"is_active": False}, headers=patient1_headers)
    assert resp_up.status_code == status.HTTP_200_OK
    assert resp_up.json()["is_active"] is False


def test_patient_appointments_booking(client, patient1_headers):
    app_payload = {
        "appointment_date": "2026-11-10T10:00:00Z",
        "reason": "Cardiovascular consultation"
    }
    resp = client.post("/api/v1/patient/appointments", json=app_payload, headers=patient1_headers)
    assert resp.status_code == status.HTTP_201_CREATED
    assert resp.json()["reason"] == "Cardiovascular consultation"

    # Query appointments
    resp_apps = client.get("/api/v1/patient/appointments", headers=patient1_headers)
    assert resp_apps.status_code == status.HTTP_200_OK
    assert len(resp_apps.json()) >= 1


def test_patient_summary_endpoint(client, patient1_headers):
    resp = client.get("/api/v1/patient/summary", headers=patient1_headers)
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert "patient" in data
    assert "upcoming_appointments" in data
