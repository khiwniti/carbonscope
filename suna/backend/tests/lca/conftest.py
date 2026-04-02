"""
Conftest for LCA tests — ensures GraphDB client mock is in place.
"""
import pytest
from unittest.mock import MagicMock


@pytest.fixture(autouse=True)
def mock_graphdb_client(monkeypatch):
    """
    Provide a mock GraphDB client so tests don't need a real GraphDB instance.
    The client.query() returns an empty result set by default.
    """
    mock_client = MagicMock()
    # Default: return empty SPARQL results
    mock_client.query.return_value = {"results": {"bindings": []}}
    return mock_client
