import pytest
from fastapi.testclient import TestClient


def test_care_finder_search_general(client: TestClient):
    """Test Care Finder search returns facilities list with fallback."""
    response = client.get("/api/v1/care-finder/search?query=Hospital")
    assert response.status_code == 200
    data = response.json()
    assert "facilities" in data
    assert isinstance(data["facilities"], list)
    assert len(data["facilities"]) > 0
    first = data["facilities"][0]
    assert "name" in first
    assert "address" in first


def test_care_finder_search_by_coords(client: TestClient):
    """Test Care Finder search by GPS coordinates."""
    response = client.get("/api/v1/care-finder/search?lat=37.7749&lng=-122.4194&facility_type=Hospital")
    assert response.status_code == 200
    data = response.json()
    assert "facilities" in data
    assert isinstance(data["facilities"], list)


def test_care_finder_empty_query(client: TestClient):
    """Test Care Finder returns default results when no query is provided."""
    response = client.get("/api/v1/care-finder/search")
    assert response.status_code == 200
    data = response.json()
    assert "facilities" in data
    assert len(data["facilities"]) > 0
