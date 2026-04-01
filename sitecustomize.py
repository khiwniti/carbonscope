import os, sys

root = os.path.abspath(os.path.dirname(__file__))
if root not in sys.path:
    sys.path.insert(0, root)
# Set a dummy JWT for Braintrust to avoid login validation errors in eval tests
os.environ.setdefault(
    "BRAINTRUST_API_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
)
# Monkey‑patch Braintrust logger to skip remote login during tests
try:
    import braintrust.logger as _bt_logger

    _bt_logger.state.login = lambda *args, **kwargs: None
except Exception:
    pass
