"""Minimal stub for setup configuration used in tests.
This provides dummy dataclasses so that import statements succeed.
The real implementation lives elsewhere; for unit‑test purposes we only need
the class names.
"""

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class SetupConfig:
    """Placeholder configuration container.
    Attributes can be added as needed by tests.
    """

    data: Dict[str, Any] | None = None


class SetupMethod:
    """Enum‑like placeholder for setup methods.
    In production this would be an Enum; here we use simple class attributes.
    """

    METHOD_A = "method_a"
    METHOD_B = "method_b"
