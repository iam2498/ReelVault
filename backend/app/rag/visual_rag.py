from pathlib import Path

import chromadb

from app.services.visual_embeddings import (
    generate_image_embedding,
    generate_text_embedding,
)

# Absolute path: same database no matter where the server starts
CHROMA_PATH = Path(__file__).resolve().parents[2] / "chroma_db"

client = chromadb.PersistentClient(path=str(CHROMA_PATH))

visual_collection = client.get_or_create_collection(
    name="reel_visual_gemini",
    metadata={"hnsw:space": "cosine"},
)

FRAME_INTERVAL_SECONDS = 2  # must match your extract_frames setting


def _as_text(value) -> str:
    """Chroma metadata must be str/int/float/bool, never None or list."""
    if value is None:
        return ""
    if isinstance(value, (list, tuple, set)):
        return ", ".join(str(v) for v in value)
    return str(value)


def store_visual_frames(
    frame_paths: list[str],
    descriptions: list[dict],
    video_id: str,
) -> int:
    ids, embeddings, documents, metadatas = [], [], [], []

    for index, (frame_path, desc) in enumerate(zip(frame_paths, descriptions)):
        desc = desc or {}

        try:
            embedding = generate_image_embedding(frame_path)
        except Exception as e:
            print(f"Frame {index} embedding failed:", repr(e))
            continue  # skip this frame, keep the rest

        ids.append(f"{video_id}_frame_{index}")
        embeddings.append(embedding)
        documents.append(_as_text(desc.get("description")) or "frame")
        metadatas.append({
            "video_id": str(video_id),
            "frame_path": str(frame_path),
            "timestamp": index * FRAME_INTERVAL_SECONDS,
            "scene": _as_text(desc.get("scene")),
            "objects": _as_text(desc.get("objects")),
            "activities": _as_text(desc.get("activities")),
            "visible_text": _as_text(desc.get("visible_text")),
        })

    if ids:
        # upsert: re-processing the same reel replaces frames, no duplicates
        visual_collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )

    return len(ids)


def search_visual(query: str, top_k: int = 5, video_id: str | None = None):
    query_embedding = generate_text_embedding(query)

    results = visual_collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={"video_id": video_id} if video_id else None,
        include=["documents", "metadatas", "distances"],
    )

    hits = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        hits.append({
            "video_id": meta["video_id"],
            "timestamp": meta["timestamp"],
            "description": doc,
            "scene": meta["scene"],
            "visible_text": meta.get("visible_text", ""),
            "similarity": round(1 - dist, 4),
            "frame_path": meta["frame_path"],
        })
    return hits