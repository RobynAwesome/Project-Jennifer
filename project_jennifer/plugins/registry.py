"""Minimal plugin model for Free Mode and supporting frameworks."""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from typing import Protocol


class PluginKind(StrEnum):
    """Supported framework plugin families."""

    ENGINE = "engine"
    VALIDATOR = "validator"
    METRIC = "metric"
    SIMULATOR = "simulator"
    TELEMETRY = "telemetry"


class FrameworkPlugin(Protocol):
    """Common metadata expected from plugins registered in the runtime."""

    name: str
    kind: PluginKind
    version: str


@dataclass(slots=True)
class PluginRegistry:
    """Simple in-memory registry that preserves domain ownership of contracts."""

    _plugins: dict[str, FrameworkPlugin] | None = None

    def __post_init__(self) -> None:
        if self._plugins is None:
            self._plugins = {}

    def register(self, plugin: FrameworkPlugin) -> None:
        """Register or replace a plugin by name."""

        self._plugins[plugin.name] = plugin

    def get(self, name: str) -> FrameworkPlugin | None:
        """Return a previously registered plugin, if present."""

        return self._plugins.get(name)

    def list(self, *, kind: PluginKind | None = None) -> tuple[FrameworkPlugin, ...]:
        """List registered plugins, optionally filtered by family."""

        plugins = tuple(self._plugins.values())
        if kind is None:
            return plugins
        return tuple(plugin for plugin in plugins if plugin.kind == kind)
