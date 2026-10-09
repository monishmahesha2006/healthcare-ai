from fastapi import status


def test_ai_chat_fallback_and_disclaimer(client, patient1_headers):
    query_payload = {"message": "I have been experiencing a mild headache for the past few hours."}
    resp = client.post("/api/v1/ai/chat", json=query_payload, headers=patient1_headers)
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert "response" in data
    # Verify healthcare disclaimer is present in the response
    assert "Disclaimer" in data["response"]
    assert data["is_fallback"] in [True, False]


def test_ai_medicine_explanation(client, patient1_headers):
    payload = {"medicine_name": "Metformin"}
    resp = client.post("/api/v1/ai/explain-medicine", json=payload, headers=patient1_headers)
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert data["medicine_name"] == "Metformin"
    assert "explanation" in data
    assert "Disclaimer" in data["explanation"]


def test_ai_report_explanation(client, patient1_headers):
    sample_report = (
        "CBC Test: Hemoglobin 14.2 g/dL (Normal: 13.5-17.5), "
        "WBC 6,500 /mcL (Normal: 4,500-11,000), Platelets 240,000 /mcL."
    )
    payload = {"text": sample_report, "title": "Complete Blood Count"}
    resp = client.post("/api/v1/ai/explain-report", json=payload, headers=patient1_headers)
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert "explanation" in data
    assert "Disclaimer" in data["explanation"]
