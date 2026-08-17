"""Production-capable PostgreSQL authority + retrieval adapter.

The adapter implements both Project Jennifer persistence contracts that belong
on the PostgreSQL rail:

- GovernedAuthorityStore for authoritative append/read semantics.
- RetrievalSource for non-mutating governed evidence retrieval.

The class is driver-neutral at its core and accepts a DB-API-shaped connection
factory. ``from_dsn`` lazily wires psycopg 3 when it is installed in the
runtime environment. Unit tests can therefore prove transaction/idempotency
behavior without pretending they are a live PostgreSQL deployment receipt.
"""

from __future__ import annotations

import hashlib
import json
import time
from collections.abc import Callable, Mapping, Sequence
from contextlib import contextmanager
from dataclasses import dataclass
from typing import Any, Protocol, cast

from project_jennifer.contracts import (
    AuthorityTier,
    EvidenceItem,
    PersistenceRail,
    PersistenceRole,
    RelationalLane,
    RetrievalQuery,
    StorageRecord,
)


_RETRIEVAL_ENVELOPE = "jennifer_retrieval"
_MAX_RETRIEVAL_LIMIT = 100
_DEFAULT_RETRIEVAL_LIMIT = 25


class AuthorityConflictError(RuntimeError):
    """Raised when an append would overwrite different governed authority."""


class PostgresAdapterConfigurationError(RuntimeError):
    """Raised when the production driver/runtime configuration is unavailable."""


class _Cursor(Protocol):
    rowcount: int

    def execute(self, query: str, params: Sequence[object] | None = None) -> Any: ...

    def fetchone(self) -> Sequence[object] | None: ...

    def fetchall(self) -> Sequence[Sequence[object]]: ...

    def close(self) -> None: ...


class _Connection(Protocol):
    def cursor(self) -> _Cursor: ...

    def commit(self) -> None: ...

    def rollback(self) -> None: ...

    def close(self) -> None: ...


ConnectionFactory = Callable[[], _Connection]


@dataclass(frozen=True, slots=True)
class _RetrievalProjection:
    enabled: bool = False
    subject: str | None = None
    content: str | None = None
    source_uri: str | None = None
    authority_scope: str = "project-jennifer"
    source_lane: RelationalLane = RelationalLane.OTHER
    observed_at: str | None = None
    checksum: str | None = None
    metadata: Mapping[str, object] | None = None


class PostgresGovernedAuthorityAdapter:
    """PostgreSQL implementation of authority storage and governed retrieval.

    Idempotency law:

    ``same record_id + same canonical payload + same version`` is a no-op.

    Any different payload/version for an existing ``record_id`` is an explicit
    authority conflict. The adapter rolls the transaction back and raises
    ``AuthorityConflictError`` rather than overwriting the existing record.

    Retrieval law:

    Storage payloads are not automatically retrievable. A record must carry an
    explicit ``jennifer_retrieval`` envelope with ``enabled: true``. This keeps
    the authoritative payload and the evidence projection separate.
    """

    source_id = "postgres-governed-authority"
    authority_tier = AuthorityTier.POSTGRES_GOVERNED_AUTHORITY
    authority_scope = "project-jennifer-governed-authority"
    # The source can contain multiple item lanes. Item-level lanes are emitted
    # on EvidenceItem so GovernedRAG can apply cross-lane privacy suppression.
    source_lane = RelationalLane.OTHER

    def __init__(self, connection_factory: ConnectionFactory) -> None:
        self._connection_factory = connection_factory

    @classmethod
    def from_dsn(
        cls,
        dsn: str,
        **connect_kwargs: object,
    ) -> "PostgresGovernedAuthorityAdapter":
        """Create a production adapter backed by psycopg 3.

        Import is intentionally lazy so the governance test suite remains
        dependency-light. A deployment that calls this constructor must install
        ``psycopg`` and provide a valid PostgreSQL DSN.
        """

        if not dsn.strip():
            raise PostgresAdapterConfigurationError("PostgreSQL DSN is required.")

        try:
            import psycopg  # type: ignore[import-not-found]
        except ImportError as exc:  # pragma: no cover - depends on deploy env
            raise PostgresAdapterConfigurationError(
                "psycopg 3 is required for PostgresGovernedAuthorityAdapter.from_dsn()."
            ) from exc

        def factory() -> _Connection:
            return cast(
                _Connection,
                psycopg.connect(dsn, **connect_kwargs),
            )

        return cls(factory)

    def read_authoritative(self, record_id: str) -> StorageRecord | None:
        record_id = _require_text(record_id, "record_id")
        sql = """
            SELECT payload_json, version
            FROM governed_authority_records
            WHERE record_id = %s
        """

        with self._connection() as connection:
            cursor = connection.cursor()
            try:
                cursor.execute(sql, (record_id,))
                row = cursor.fetchone()
            finally:
                cursor.close()

        if row is None:
            return None

        payload = _decode_json_object(row[0], "payload_json")
        return StorageRecord(
            record_id=record_id,
            payload=payload,
            rail=PersistenceRail.POSTGRESQL,
            role=PersistenceRole.GOVERNED_AUTHORITY,
            version=str(row[1]),
        )

    def append_authoritative(self, record: StorageRecord) -> None:
        """Append exactly once or prove an existing write is idempotent.

        PostgreSQL is append-authority for this contract; the method never
        updates a conflicting row in place.
        """

        normalized = _validate_authoritative_record(record)
        payload_json = _canonical_json(normalized.payload)
        payload_hash = hashlib.sha256(payload_json.encode("utf-8")).hexdigest()
        projection = _retrieval_projection(normalized.payload)
        metadata_json = _canonical_json(dict(projection.metadata or {}))
        timestamp = _now_ms()

        insert_sql = """
            INSERT INTO governed_authority_records (
              record_id,
              payload_json,
              payload_hash,
              version,
              subject,
              content,
              source_uri,
              authority_scope,
              source_lane,
              observed_at,
              checksum,
              metadata_json,
              retrieval_enabled,
              created_at,
              updated_at
            ) VALUES (
              %s,
              %s::jsonb,
              %s,
              %s,
              %s,
              %s,
              %s,
              %s,
              %s,
              %s,
              %s,
              %s::jsonb,
              %s,
              %s,
              %s
            )
            ON CONFLICT (record_id) DO NOTHING
            RETURNING record_id
        """
        existing_sql = """
            SELECT payload_hash, version
            FROM governed_authority_records
            WHERE record_id = %s
            FOR SHARE
        """

        with self._connection() as connection:
            cursor = connection.cursor()
            try:
                cursor.execute(
                    insert_sql,
                    (
                        normalized.record_id,
                        payload_json,
                        payload_hash,
                        normalized.version,
                        projection.subject,
                        projection.content,
                        projection.source_uri,
                        projection.authority_scope,
                        projection.source_lane.value,
                        projection.observed_at,
                        projection.checksum,
                        metadata_json,
                        projection.enabled,
                        timestamp,
                        timestamp,
                    ),
                )
                inserted = cursor.fetchone()
                if inserted is not None:
                    connection.commit()
                    return

                cursor.execute(existing_sql, (normalized.record_id,))
                existing = cursor.fetchone()
                if existing is None:
                    connection.rollback()
                    raise RuntimeError(
                        "PostgreSQL reported an authority conflict but the existing record could not be read."
                    )

                existing_hash = str(existing[0])
                existing_version = str(existing[1])
                if existing_hash == payload_hash and existing_version == normalized.version:
                    connection.commit()
                    return

                connection.rollback()
                raise AuthorityConflictError(
                    "Authoritative record conflict: existing payload/version differs "
                    f"for record_id={normalized.record_id!r}."
                )
            except Exception:
                # rollback is safe after a prior rollback and prevents any failed
                # statement from leaking a partially open transaction.
                try:
                    connection.rollback()
                except Exception:
                    pass
                raise
            finally:
                cursor.close()

    def retrieve(self, query: RetrievalQuery) -> tuple[EvidenceItem, ...]:
        """Retrieve bounded authority evidence without mutating memory."""

        search = query.query.strip()
        limit = _retrieval_limit(query.metadata)
        search_vector = (
            "to_tsvector('simple', coalesce(subject, '') || ' ' || coalesce(content, ''))"
        )
        sql = f"""
            SELECT
              record_id,
              content,
              source_uri,
              authority_scope,
              source_lane,
              observed_at,
              checksum,
              metadata_json,
              version,
              payload_hash,
              CASE
                WHEN %s = '' THEN 0.0
                ELSE ts_rank({search_vector}, websearch_to_tsquery('simple', %s))
              END AS retrieval_score
            FROM governed_authority_records
            WHERE retrieval_enabled = TRUE
              AND (
                %s = ''
                OR {search_vector} @@ websearch_to_tsquery('simple', %s)
              )
            ORDER BY
              CASE WHEN subject = %s THEN 0 ELSE 1 END,
              retrieval_score DESC,
              updated_at DESC,
              record_id ASC
            LIMIT %s
        """

        with self._connection() as connection:
            cursor = connection.cursor()
            try:
                cursor.execute(
                    sql,
                    (search, search, search, search, query.subject, limit),
                )
                rows = cursor.fetchall()
            finally:
                cursor.close()

        evidence: list[EvidenceItem] = []
        for row in rows:
            metadata = _decode_json_object(row[7], "metadata_json")
            metadata = {
                **metadata,
                "storage_version": str(row[8]),
                "payload_hash": str(row[9]),
                "persistence_rail": PersistenceRail.POSTGRESQL.value,
            }
            lane = _parse_lane(row[4])
            score = _finite_score(row[10])
            evidence.append(
                EvidenceItem(
                    evidence_id=str(row[0]),
                    content=str(row[1]),
                    source_id=self.source_id,
                    source_uri=_optional_text(row[2]),
                    authority_tier=self.authority_tier,
                    authority_scope=str(row[3]),
                    score=score,
                    source_lane=lane,
                    observed_at=_optional_text(row[5]),
                    checksum=_optional_text(row[6]) or str(row[9]),
                    metadata=metadata,
                )
            )

        return tuple(evidence)

    @contextmanager
    def _connection(self):
        connection = self._connection_factory()
        try:
            yield connection
        except Exception:
            try:
                connection.rollback()
            except Exception:
                pass
            raise
        finally:
            connection.close()


def _validate_authoritative_record(record: StorageRecord) -> StorageRecord:
    record_id = _require_text(record.record_id, "record.record_id")
    version = _require_text(record.version, "record.version")
    if record.rail != PersistenceRail.POSTGRESQL:
        raise ValueError("authoritative records must use the PostgreSQL rail")
    if record.role != PersistenceRole.GOVERNED_AUTHORITY:
        raise ValueError("authoritative records must use the governed-authority role")

    # Canonical round-trip validates that the durable payload is ordinary JSON,
    # finite, detached from caller-owned references, and deterministic to hash.
    payload = _decode_json_object(_canonical_json(record.payload), "record.payload")
    _retrieval_projection(payload)  # validate the reserved envelope now
    return StorageRecord(
        record_id=record_id,
        payload=payload,
        rail=record.rail,
        role=record.role,
        version=version,
    )


def _retrieval_projection(payload: Mapping[str, object]) -> _RetrievalProjection:
    raw = payload.get(_RETRIEVAL_ENVELOPE)
    if raw is None:
        return _RetrievalProjection()
    if not isinstance(raw, dict):
        raise ValueError(f"{_RETRIEVAL_ENVELOPE} must be a JSON object")

    enabled = raw.get("enabled", False)
    if not isinstance(enabled, bool):
        raise ValueError(f"{_RETRIEVAL_ENVELOPE}.enabled must be a boolean")

    authority_scope = raw.get("authority_scope", "project-jennifer")
    if not isinstance(authority_scope, str) or not authority_scope.strip():
        raise ValueError(f"{_RETRIEVAL_ENVELOPE}.authority_scope must be non-blank text")

    lane = _parse_lane(raw.get("source_lane", RelationalLane.OTHER.value))
    metadata = raw.get("metadata", {})
    if not isinstance(metadata, dict):
        raise ValueError(f"{_RETRIEVAL_ENVELOPE}.metadata must be a JSON object")
    # Force JSON validation for nested metadata as well.
    metadata = _decode_json_object(_canonical_json(metadata), "retrieval metadata")

    subject = _optional_text(raw.get("subject"))
    content = _optional_text(raw.get("content"))
    if enabled:
        if subject is None or not subject.strip():
            raise ValueError(f"{_RETRIEVAL_ENVELOPE}.subject is required when enabled")
        if content is None or not content.strip():
            raise ValueError(f"{_RETRIEVAL_ENVELOPE}.content is required when enabled")

    return _RetrievalProjection(
        enabled=enabled,
        subject=subject.strip() if subject is not None else None,
        content=content.strip() if content is not None else None,
        source_uri=_optional_text(raw.get("source_uri")),
        authority_scope=authority_scope.strip(),
        source_lane=lane,
        observed_at=_optional_text(raw.get("observed_at")),
        checksum=_optional_text(raw.get("checksum")),
        metadata=metadata,
    )


def _retrieval_limit(metadata: Mapping[str, object]) -> int:
    raw = metadata.get("limit", _DEFAULT_RETRIEVAL_LIMIT)
    if isinstance(raw, bool) or not isinstance(raw, int):
        return _DEFAULT_RETRIEVAL_LIMIT
    return max(1, min(_MAX_RETRIEVAL_LIMIT, raw))


def _parse_lane(value: object) -> RelationalLane:
    if isinstance(value, RelationalLane):
        return value
    try:
        return RelationalLane(str(value))
    except ValueError as exc:
        raise ValueError(f"unknown relational lane: {value!r}") from exc


def _finite_score(value: object) -> float:
    try:
        score = float(value)
    except (TypeError, ValueError):
        return 0.0
    if score != score or score in (float("inf"), float("-inf")):
        return 0.0
    return max(0.0, min(1.0, score))


def _canonical_json(value: object) -> str:
    try:
        return json.dumps(
            value,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
            allow_nan=False,
        )
    except (TypeError, ValueError) as exc:
        raise ValueError("authoritative payload must be finite JSON-safe data") from exc


def _decode_json_object(value: object, field: str) -> dict[str, object]:
    decoded: object
    if isinstance(value, dict):
        decoded = json.loads(_canonical_json(value))
    elif isinstance(value, (str, bytes, bytearray)):
        decoded = json.loads(value)
    else:
        raise ValueError(f"{field} must decode to a JSON object")
    if not isinstance(decoded, dict):
        raise ValueError(f"{field} must decode to a JSON object")
    return cast(dict[str, object], decoded)


def _optional_text(value: object) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError(f"expected text or null, got {type(value).__name__}")
    return value


def _require_text(value: str, field: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise ValueError(f"{field} is required")
    return normalized


def _now_ms() -> int:
    return int(time.time() * 1000)
