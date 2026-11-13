from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "Backend is Running...."}

def test_routes_registered():
    paths = list(app.openapi()["paths"].keys())
    assert "/" in paths
    assert "/download" in paths
    assert "/Process-audio" in paths
    assert "/search" in paths
    assert "/process-frames" in paths
    assert "/Process-frames" in paths

