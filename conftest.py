"""Test configuration for the repository.
Ensures the repository root is on PYTHONPATH for package imports and
mocks external services that would otherwise require network access.
"""

import os, sys, pathlib

# Add repository root to sys.path
ROOT = pathlib.Path(__file__).parent.resolve()
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
# Mock Braintrust login to bypass remote validation during tests
try:
    import braintrust.logger as bt_logger

    bt_logger.state.login = lambda *args, **kwargs: None
except Exception:
    pass
# Set a dummy Braintrust API key (JWT format) if not already set
os.environ.setdefault(
    "BRAINTRUST_API_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
)
