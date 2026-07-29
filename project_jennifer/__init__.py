"""Project Jennifer Python scaffold for the Free Mode redesign foundation.

This package defines clean architectural boundaries for the planned
multi-framework runtime without replacing the existing TypeScript monorepo.
"""

from .core import FreeModeEngine, FreeModeRequest, FreeModeResult
from .plugins import FrameworkPlugin, PluginKind, PluginRegistry

__all__ = [
    "FreeModeEngine",
    "FreeModeRequest",
    "FreeModeResult",
    "FrameworkPlugin",
    "PluginKind",
    "PluginRegistry",
]
