"""External/provider adapter boundaries for Project Jennifer."""

from .renters import (
    RenterAdapterRegistry,
    RenterExecutionAdapter,
    RenterExecutionRequest,
    RenterExecutionResult,
)

__all__ = [
    "RenterAdapterRegistry",
    "RenterExecutionAdapter",
    "RenterExecutionRequest",
    "RenterExecutionResult",
]
