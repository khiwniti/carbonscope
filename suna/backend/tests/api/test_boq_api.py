"""
Tests for the BOQ Analysis API endpoints.
"""
import pytest
import io
from fastapi.testclient import TestClient
from fastapi import FastAPI

from routers.boq import router
from core.auth.auth import get_current_user


MOCK_USER = {"user_id": "test-user-123", "token": "test-token"}


def build_app():
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_current_user] = lambda: MOCK_USER
    return app


@pytest.fixture
def client():
    return TestClient(build_app())


@pytest.fixture
def minimal_xlsx_bytes():
    """Create a minimal valid XLSX file in memory."""
    try:
        import openpyxl
    except ImportError:
        pytest.skip("openpyxl not available")

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["รายการ", "หน่วย", "จำนวน"])
    ws.append(["คอนกรีต B25 / Concrete B25", "ม³", "100"])
    ws.append(["เหล็กเส้น DB12 / Steel Bar DB12", "กก", "5000"])
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf.getvalue()


XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


class TestBOQUpload:
    def test_upload_rejects_non_excel(self, client):
        response = client.post(
            "/boq/upload",
            files={"file": ("test.pdf", b"fake", "application/pdf")},
            data={"language": "th"},
        )
        assert response.status_code == 422

    def test_upload_excel_parses_materials(self, client, minimal_xlsx_bytes):
        response = client.post(
            "/boq/upload",
            files={"file": ("boq.xlsx", minimal_xlsx_bytes, XLSX_CONTENT_TYPE)},
            data={"language": "th"},
        )
        assert response.status_code == 201
        body = response.json()
        assert "analysis_id" in body
        assert body["filename"] == "boq.xlsx"
        assert body["status"] in ("completed", "queued", "processing")
        assert isinstance(body["materials_count"], int)

    def test_get_analysis_returns_results(self, client, minimal_xlsx_bytes):
        # Upload
        up = client.post(
            "/boq/upload",
            files={"file": ("boq.xlsx", minimal_xlsx_bytes, XLSX_CONTENT_TYPE)},
            data={"language": "th"},
        )
        assert up.status_code == 201
        analysis_id = up.json()["analysis_id"]

        # Retrieve
        get = client.get(f"/boq/{analysis_id}")
        assert get.status_code == 200
        body = get.json()
        assert body["analysis_id"] == analysis_id
        assert isinstance(body["materials"], list)

    def test_get_analysis_status(self, client, minimal_xlsx_bytes):
        up = client.post(
            "/boq/upload",
            files={"file": ("boq.xlsx", minimal_xlsx_bytes, XLSX_CONTENT_TYPE)},
            data={"language": "th"},
        )
        analysis_id = up.json()["analysis_id"]

        status = client.get(f"/boq/{analysis_id}/status")
        assert status.status_code == 200
        body = status.json()
        assert body["status"] in ("queued", "processing", "completed", "failed")
        assert 0 <= body["progress_percent"] <= 100

    def test_list_analyses_returns_user_analyses(self, client, minimal_xlsx_bytes):
        # Upload one
        client.post(
            "/boq/upload",
            files={"file": ("boq.xlsx", minimal_xlsx_bytes, XLSX_CONTENT_TYPE)},
            data={"language": "th"},
        )

        resp = client.get("/boq/")
        assert resp.status_code == 200
        body = resp.json()
        assert "analyses" in body
        assert len(body["analyses"]) >= 1
        assert "analysis_id" in body["analyses"][0]

    def test_get_nonexistent_analysis_returns_404(self, client):
        resp = client.get("/boq/nonexistent-id-xyz")
        assert resp.status_code == 404
