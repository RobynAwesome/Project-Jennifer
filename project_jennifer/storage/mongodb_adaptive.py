"""MongoDB adaptive-context + governed retrieval adapter.

MongoDB is the mutable/rebuildable projection rail in Project Jennifer. This
adapter deliberately implements both contracts that belong on that rail:

- ``AdaptiveContextStore`` for mutable projections.
- ``RetrievalSource`` for non-authoritative adaptive-context retrieval.

The full projection payload is stored independently from its bounded retrieval
view. A projection is never retrieval-visible unless an explicit
``jennifer_retrieval`` envelope enables it.
"""

from __future__ import annotations

import hashlib
import json
import time
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any, cast

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
_DEFAULT_COLLECTION = "adaptive_context_records"
_DEFAULT_RETRIEVAL_LIMIT = 25
_MAX_RETRIEVAL_LIMIT = 100


class MongoAdapterConfigurationError(RuntimeError):
    """Raised when MongoDB production configuration/driver support is absent."""


@dataclass(frozen=True, slots=True)
class _RetrievalProjection:
    enabled: bool = False
    subject: str | None = None
    content: str | None = None
    source_uri: str | None = None
    authority_scope: str = "project-jennifer.adaptive-context"
    source_lane: RelationalLane = RelationalLane.OTHER
    observed_at: str | None = None
    checksum: str | None = None
    metadata: Mapping[str, object] | None = None


class MongoAdaptiveContextAdapter:
    """MongoDB implementation of adaptive projection storage + retrieval.

    Mutation law:

    A projection may be replaced under the same ``record_id`` because MongoDB
    is explicitly the rebuildable adaptive-context rail. This never changes
    PostgreSQL authority; it only changes the projection that can be rebuilt
    from governed records/events.

    Retrieval law:

    The full payload is not automatically queryable evidence. Only a validated
    ``jennifer_retrieval`` projection with ``enabled: true`` becomes eligible
    for retrieval, after which existing ``GovernedRAG`` authority/privacy rules
    still apply.
    """

    source_id = "mongodb-adaptive-context"
    authority_tier = AuthorityTier.MONGODB_ADAPTIVE_CONTEXT
    authority_scope = "project-jennifer-adaptive-context"
    source_lane = RelationalLane.OTHER

    def __init__(self, collection: Any, *, client: Any | None = None) -> None:
        self._collection = collection
        self._client = client

    @classmethod
    def from_uri(
        cls,
        uri: str,
        database_name: str,
        *,
        collection_name: str = _DEFAULT_COLLECTION,
        **client_kwargs: object,
    ) -> "MongoAdaptiveContextAdapter":
        """Create a production adapter backed by PyMongo.

        Import is intentionally lazy so Project Jennifer's baseline governance
        suite does not require a MongoDB client package merely to import its
        contracts. Production/live-proof environments install ``pymongo``.
        """

        uri = _require_text(uri, "MongoDB URI")
        database_name = _require_text(database_name, "MongoDB database name")
        collection_name = _require_text(collection_name, "MongoDB collection name")

        try:
            from pymongo import MongoClient  # type: ignore[import-not-found]
        except ImportError as exc:  # pragma: no cover - deployment dependency
            raise MongoAdapterConfigurationError(
                "pymongo is required for MongoAdaptiveContextAdapter.from_uri()."
            ) from exc

        client = MongoClient(uri, **client_kwargs)
        return cls(client[database_name][collection_name], client=client)

    def ensure_indexes(self) -> None:
        """Ensure deterministic indexes for projection lookup and retrieval."""

        self._collection.create_index(
            [("subject", 1), ("updated_at", -1)],
            name="adaptive_context_subject_updated",
            partialFilterExpression={"retrieval_enabled": True},
        )
        self._collection.create_index(
            [("source_lane", 1), ("updated_at", -1)],
            name="adaptive_context_lane_updated",
            partialFilterExpression={"retrieval_enabled": True},
        )
        # The text index spans the collection. Eligibility is still governed by
        # retrieval_enabled at query time. Keeping the text index non-partial
        # avoids coupling the portable adapter to server-specific text/partial
        # index restrictions.
        self._collection.create_index(
            [("subject", "text"), ("content", "text")],
            name="adaptive_context_text",
            weights={"subject": 5, "content": 1},
        )

    def read_projection(self, record_id: str) -> StorageRecord | None:
        record_id = _require_text(record_id, "record_id")
        document = self._collection.find_one(
            {"_id": record_id},
            {"payload": 1, "version": 1},
        )
        if document is None:
            return None

        payload = _decode_json_object(document.get("payload"), "payload")
        return StorageRecord(
            record_id=record_id,
            payload=payload,
            rail=PersistenceRail.MONGODB,
            role=PersistenceRole.ADAPTIVE_CONTEXT,
            version=str(document.get("version", "v1")),
        )

    def upsert_projection(self, record: StorageRecord) -> None:
        """Replace one rebuildable projection without claiming authority."""

        normalized = _validate_projection_record(record)
        payload_json = _canonical_json(normalized.payload)
        payload = cast(dict[str, object], json.loads(payload_json))
        payload_hash = hashlib.sha256(payload_json.encode("utf-8")).hexdigest()
        retrieval = _retrieval_projection(payload)
        timestamp = _now_ms()

        document = {
            "payload": payload,
            "payload_hash": payload_hash,
            "version": normalized.version,
            "subject": retrieval.subject,
            "content": retrieval.content,
            "source_uri": retrieval.source_uri,
            "authority_scope": retrieval.authority_scope,
            "source_lane": retrieval.source_lane.value,
            "observed_at": retrieval.observed_at,
            "checksum": retrieval.checksum,
            "metadata": dict(retrieval.metadata or {}),
            "retrieval_enabled": retrieval.enabled,
            "updated_at": timestamp,
        }

        self._collection.update_one(
            {"_id": normalized.record_id},
            {
                "$set": document,
                "$setOnInsert": {"created_at": timestamp},
            },
            upsert=True,
        )

    def retrieve(self, query: RetrievalQuery) -> tuple[EvidenceItem, ...]:
        """Retrieve adaptive evidence without promoting it to authority."""

        search = query.query.strip()
        limit = _retrieval_limit(query.metadata)
        match: dict[str, object] = {"retrieval_enabled": True}
        if search:
            match["$text"] = {"$search": search}

        score_expression: object = {"$meta": "textScore"} if search else 0.0
        pipeline: list[dict[str, object]] = [
            {"$match": match},
            {
                "$set": {
                    "_retrieval_score": score_expression,
                    "_subject_exact": {
                        "$cond": [{"$eq": ["$subject", query.subject]}, 0, 1]
                    },
                }
            },
            {
                "$sort": {
                    "_subject_exact": 1,
                    "_retrieval_score": -1,
                    "updated_at": -1,
                    "_id": 1,
                }
            },
            {"$limit": limit},
            {
                "$project": {
                    "_id": 1,
                    "content": 1,
                    "source_uri": 1,
                    "authority_scope": 1,
                    "source_lane": 1,
                    "observed_at": 1,
                    "checksum": 1,
                    "metadata": 1,
                    "version": 1,
                    "payload_hash": 1,
                    "updated_at": 1,
                    "_retrieval_score": 1,
                }
            },
        ]

        documents = self._collection.aggregate(pipeline)
        evidence: list[EvidenceItem] = []
        for document in documents:
            try:
                item = self._document_to_evidence(document)
            except (TypeError, ValueError):
                # Corrupt/mutated projection data fails closed: it is omitted
                # rather than becoming evidence under guessed semantics.
                continue
            evidence.append(item)

        return tuple(evidence)

    def close(self) -> None:
        if self._client is not None:
            self._client.close()

    def __enter__(self) -> "MongoAdaptiveContextAdapter":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()

    def _document_to_evidence(self, document: Mapping[str, object]) -> EvidenceItem:
        evidence_id = _require_text(str(document.get("_id", "")), "MongoDB evidence _id")
        content = _require_text(_expect_text(document.get("content")), "MongoDB evidence content")
        authority_scope = _require_text(
            _expect_text(document.get("authority_scope")),
            "MongoDB authority scope",
        )
        lane = _parse_lane(document.get("source_lane", RelationalLane.OTHER.value))
        metadata = _decode_json_object(document.get("metadata", {}), "metadata")
        metadata = {
            **metadata,
            "storage_version": str(document.get("version", "v1")),
            "payload_hash": str(document.get("payload_hash", "")),
            "persistence_rail": PersistenceRail.MONGODB.value,
            "projection_updated_at": document.get("updated_at"),
        }
        payload_hash = _optional_text(document.get("payload_hash"))

        return EvidenceItem(
            evidence_id=evidence_id,
            content=content,
            source_id=self.source_id,
            source_uri=_optional_text(document.get("source_uri")),
            authority_tier=self.authority_tier,
            authority_scope=authority_scope,
            score=_finite_score(document.get("_retrieval_score", 0.0)),
            source_lane=lane,
            observed_at=_optional_text(document.get("observed_at")),
            checksum=_optional_text(document.get("checksum")) or payload_hash,
            metadata=metadata,
        )


def _validate_projection_record(record: StorageRecord) -> StorageRecord:
    record_id = _require_text(record.record_id, "record.record_id")
    version = _require_text(record.version, "record.version")
    if record.rail != PersistenceRail.MONGODB:
        raise ValueError("adaptive projection records must use the MongoDB rail")
    if record.role != PersistenceRole.ADAPTIVE_CONTEXT:
        raise ValueError("adaptive projection records must use the adaptive-context role")

    payload = _decode_json_object(_canonical_json(record.payload), "record.payload")
    _retrieval_projection(payload)
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

    authority_scope = raw.get("authority_scope", "project-jennifer.adaptive-context")
    if not isinstance(authority_scope, str) or not authority_scope.strip():
        raise ValueError(f"{_RETRIEVAL_ENVELOPE}.authority_scope must be non-blank text")

    lane = _parse_lane(raw.get("source_lane", RelationalLane.OTHER.value))
    metadata = raw.get("metadata", {})
    if not isinstance(metadata, dict):
        raise ValueError(f"{_RETRIEVAL_ENVELOPE}.metadata must be a JSON object")
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
        raise ValueError("adaptive projection payload must be finite JSON-safe data") from exc


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


def _expect_text(value: object) -> str:
    if not isinstance(value, str):
        raise ValueError(f"expected text, got {type(value).__name__}")
    return value


def _require_text(value: str, field: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise ValueError(f"{field} is required")
    return normalized


def _now_ms() -> int:
    return int(time.time() * 1000)
