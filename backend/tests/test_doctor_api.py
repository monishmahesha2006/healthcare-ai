from fastapi import status


def test_doctor_patients_list(client, doctor_headers):
    resp = client.get("/api/v1/doctor/patients", headers=doctor_headers)
    assert resp.status_code == status.HTTP_200_OK
    patients = resp.json()
    assert isinstance(patients, list)
    assert len(patients) >= 2


def test_doctor_triage_queue_ordering(client, doctor_headers, patient1_headers, patient2_headers):
    # Log Low Risk vitals for Patient 1 (Score 100)
    client.post("/api/v1/patient/vitals", json={
        "heart_rate": 72.0,
        "blood_sugar": 95.0,
        "systolic_bp": 120.0,
        "diastolic_bp": 80.0,
        "temperature": 36.8,
        "spo2": 98.0
    }, headers=patient1_headers)

    # Log High Risk vitals for Patient 2 (Tachycardia + Fever + Hypoxemia -> Score < 65)
    client.post("/api/v1/patient/vitals", json={
        "heart_rate": 125.0,
        "blood_sugar": 210.0,
        "systolic_bp": 150.0,
        "diastolic_bp": 95.0,
        "temperature": 38.6,
        "spo2": 91.0
    }, headers=patient2_headers)

    # Query doctor triage queue
    resp = client.get("/api/v1/doctor/triage-queue", headers=doctor_headers)
    assert resp.status_code == status.HTTP_200_OK
    queue = resp.json()
    assert len(queue) >= 2

    # High risk patient must be prioritized ahead of low risk patient
    high_risk_entries = [entry for entry in queue if entry["risk_category"] == "HIGH"]
    low_risk_entries = [entry for entry in queue if entry["risk_category"] == "LOW"]
    assert len(high_risk_entries) >= 1
    assert queue.index(high_risk_entries[0]) < queue.index(low_risk_entries[0])


def test_doctor_appointment_status_update(client, doctor_headers, patient1_headers):
    # Book appointment as patient
    book_resp = client.post("/api/v1/patient/appointments", json={
        "appointment_date": "2026-12-01T09:00:00Z",
        "reason": "Follow-up consultation"
    }, headers=patient1_headers)
    app_id = book_resp.json()["id"]

    # Doctor confirms appointment and adds notes
    up_resp = client.put(f"/api/v1/doctor/appointments/{app_id}/status", json={
        "status": "confirmed",
        "doctor_notes": "Confirmed for room 302."
    }, headers=doctor_headers)
    assert up_resp.status_code == status.HTTP_200_OK
    assert up_resp.json()["status"] == "confirmed"
    assert up_resp.json()["doctor_notes"] == "Confirmed for room 302."
