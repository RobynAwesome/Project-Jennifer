"""External/provider adapter boundaries for Project Jennifer."""

from .nvidia_nim import NvidiaNimAdapter, nvidia_hold_manifest
from .renters import (
    RenterAdapterRegistry,
    RenterExecutionAdapter,
    RenterExecutionRequest,
    RenterExecutionResult,
)

__all__ = [
    "NvidiaNimAdapter",
    "RenterAdapterRegistry",
    "RenterExecutionAdapter",
    "RenterExecutionRequest",
    "RenterExecutionResult",
    "nvidia_hold_manifest",
]
