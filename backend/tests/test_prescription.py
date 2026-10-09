import io
from fastapi import status
from app.services.prescription_service import parse_prescription_text


def test_parse_prescription_text_heuristic():
    raw_text = (
        "Rx:\n"
        "1. Amoxicillin 500mg twice daily for 7 days\n"
        "2. Ibuprofen 400mg as needed for pain\n"
        "3. Omeprazole 20mg once daily before breakfast"
    )
    meds = parse_prescription_text(raw_text)
    assert len(meds) == 3
    names = [m.name for m in meds]
    assert any("Amoxicillin" in n for n in names)
    assert any("Ibuprofen" in n for n in names)
    assert any("Omeprazole" in n for n in names)
    for m in meds:
        assert m.is_verified is False


def test_prescription_upload_and_verification_workflow(client, patient1_headers):
    # 1. Upload mock prescription image
    file_bytes = b"Mock image binary content simulating prescription document"
    files = {"file": ("prescription_sample.jpg", io.BytesIO(file_bytes), "image/jpeg")}

    resp = client.post("/api/v1/prescription/upload", files=files, headers=patient1_headers)
    assert resp.status_code == status.HTTP_200_OK
    upload_data = resp.json()
    assert upload_data["requires_human_verification"] is True
    assert "medications" in upload_data
    assert len(upload_data["medications"]) >= 1

    # 2. Patient verifies and commits candidate medication
    candidate_med = upload_data["medications"][0]
    candidate_med["is_verified"] = True

    save_payload = {
        "medications": [candidate_med],
        "source_notes": "Verified against physical prescription paper"
    }
    resp_save = client.post("/api/v1/prescription/verify-save", json=save_payload, headers=patient1_headers)
    assert resp_save.status_code == status.HTTP_200_OK
    assert resp_save.json()["count"] == 1

    # 3. Verify it is now present in patient's active medication list
    resp_meds = client.get("/api/v1/patient/medicines", headers=patient1_headers)
    assert resp_meds.status_code == status.HTTP_200_OK
    med_names = [m["name"] for m in resp_meds.json()]
    assert candidate_med["name"] in med_names
