from pathlib import Path
from bson import ObjectId

from app.database.db import reels_collection
from app.rag.rag import retrieve_chunks
from app.rag.visual_rag import search_visual

TEXT_WEIGHT = 0.6    # speech/transcript match
VISUAL_WEIGHT = 0.4  # what is visible in frames


def _resolve_fallback_thumbnail(doc: dict) -> str | None:
    fn = doc.get("filename")
    if not fn:
        return None
    stem = Path(fn).stem
    downloads_dir = Path(__file__).resolve().parent.parent.parent / "downloads"
    frames_dir = downloads_dir / f"{stem}_frames"
    if frames_dir.exists():
        first_frame = next(frames_dir.glob("*.jpg"), None)
        if first_frame:
            return f"/downloads/{stem}_frames/{first_frame.name}"
    return None


def search_text(query: str, top_k: int) -> list[dict]:
    """Wraps retrieve_chunks from rag.py into a simple common format."""
    raw = retrieve_chunks(query, top_k)
    items = []

    # Case 1: raw Chroma result {"documents": [[...]], "metadatas": [[...]], "distances": [[...]]}
    if isinstance(raw, dict) and "documents" in raw:
        docs = raw["documents"][0]
        metas = raw["metadatas"][0]
        dists = (raw.get("distances") or [[None] * len(docs)])[0]
        for doc, meta, dist in zip(docs, metas, dists):
            items.append({
                "text": doc,
                "metadata": meta or {},
                "similarity": None if dist is None else 1 - dist,
            })
    # Case 2: list of dicts
    elif isinstance(raw, list):
        items = [i for i in raw if isinstance(i, dict)]

    hits = []
    for item in items:
        meta = item.get("metadata") or {}
        video_id = item.get("video_id") or meta.get("video_id")
        if not video_id:
            continue

        if item.get("similarity") is not None:
            sim = item["similarity"]
        elif item.get("score") is not None:
            sim = item["score"]
        elif item.get("distance") is not None:
            sim = 1 - item["distance"]
        else:
            sim = 0.5

        hits.append({
            "video_id": str(video_id),
            "similarity": max(0.0, min(1.0, float(sim))),
            "snippet": item.get("text") or item.get("document") or item.get("content") or "",
        })
    return hits


def search_reels(query: str, limit: int = 10) -> list[dict]:
    pool: dict[str, dict] = {}

    def entry(video_id: str) -> dict:
        return pool.setdefault(video_id, {
            "text": 0.0, "visual": 0.0,
            "snippet": None, "timestamp": None, "frame_note": None,
        })

    for hit in search_text(query, limit * 3):
        e = entry(hit["video_id"])
        if hit["similarity"] > e["text"]:
            e["text"] = hit["similarity"]
            e["snippet"] = hit.get("snippet")

    for hit in search_visual(query, limit * 3):
        e = entry(hit["video_id"])
        if hit["similarity"] > e["visual"]:
            e["visual"] = hit["similarity"]
            e["timestamp"] = hit["timestamp"]
            e["frame_note"] = hit["description"]

    ranked = sorted(
        pool.items(),
        key=lambda kv: TEXT_WEIGHT * kv[1]["text"] + VISUAL_WEIGHT * kv[1]["visual"],
        reverse=True,
    )[:limit]

    ids = [ObjectId(v) for v, _ in ranked if ObjectId.is_valid(v)]
    docs = {
        str(d["_id"]): d
        for d in reels_collection.find({"_id": {"$in": ids}})
    }

    results = []
    for video_id, e in ranked:
        doc = docs.get(video_id)
        if not doc:
            continue  # vector exists but the reel was deleted from Mongo

        if e["text"] and e["visual"]:
            matched_on = "both"
        elif e["text"]:
            matched_on = "speech"
        else:
            matched_on = "visuals"

        score = TEXT_WEIGHT * e["text"] + VISUAL_WEIGHT * e["visual"]
        results.append({
            "id": video_id,
            "title": doc.get("title"),
            "thumbnail": doc.get("thumbnail"),
            "fallback_thumbnail": _resolve_fallback_thumbnail(doc),
            "summary": doc.get("summary"),
            "reel_url": doc.get("reel_url"),
            "score": round(score * 100),
            "matched_on": matched_on,
            "snippet": e["snippet"],
            "timestamp": e["timestamp"],
            "frame_note": e["frame_note"],
        })
    return results


def list_reels(limit: int = 50, skip: int = 0) -> list[dict]:
    cursor = reels_collection.find().sort("_id", -1).skip(skip).limit(limit)
    return [
        {
            "id": str(d["_id"]),
            "title": d.get("title"),
            "thumbnail": d.get("thumbnail"),
            "fallback_thumbnail": _resolve_fallback_thumbnail(d),
            "summary": d.get("summary"),
            "reel_url": d.get("reel_url"),
            "status": d.get("status"),
            "created_at": d["created_at"].isoformat() if d.get("created_at") else None,
        }
        for d in cursor
    ]