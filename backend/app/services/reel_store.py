import os
import shutil
from pathlib import Path
from bson import ObjectId

from app.database.db import reels_collection
from app.rag.rag import collection as text_collection
from app.rag.visual_rag import visual_collection


def update_reel(reel_id: str, fields: dict) -> None:
    reels_collection.update_one(
        {"_id": ObjectId(reel_id)},
        {"$set": fields},
    )


def get_reel_details(reel_id: str) -> dict | None:
    """
    Returns full expanded information for a single reel:
    MongoDB fields (title, summary, transcript, language, status, dates),
    relative video stream URL (if file exists on disk),
    all visual frames from ChromaDB with timestamps, descriptions, objects, visible text, and frame URLs.
    """
    if not ObjectId.is_valid(reel_id):
        raise ValueError(f"Invalid reel ID: {reel_id}")

    doc = reels_collection.find_one({"_id": ObjectId(reel_id)})
    if not doc:
        return None

    reel_id_str = str(doc["_id"])
    backend_root = Path(__file__).resolve().parents[2]
    downloads_dir = backend_root / "downloads"

    # 1. Video playback URL if file exists
    video_url = None
    video_path_str = doc.get("filename")
    if video_path_str:
        vp = Path(video_path_str)
        if vp.is_file():
            try:
                rel = vp.resolve().relative_to(downloads_dir.resolve())
                video_url = f"/downloads/{str(rel).replace(chr(92), '/')}"
            except Exception:
                video_url = f"/downloads/{vp.name}"

    # 2. Visual frames & timestamps from ChromaDB
    visual_frames = []
    try:
        vis_items = visual_collection.get(where={"video_id": reel_id_str})
        metas = vis_items.get("metadatas") or []
        documents = vis_items.get("documents") or []

        for doc_text, meta in zip(documents, metas):
            if isinstance(meta, dict):
                frame_url = None
                fpath = meta.get("frame_path")
                if fpath:
                    fp = Path(fpath)
                    if fp.is_file():
                        try:
                            rel_frame = fp.resolve().relative_to(downloads_dir.resolve())
                            frame_url = f"/downloads/{str(rel_frame).replace(chr(92), '/')}"
                        except Exception:
                            frame_url = f"/downloads/{fp.name}"

                visual_frames.append({
                    "timestamp": meta.get("timestamp", 0),
                    "description": doc_text or meta.get("scene") or "",
                    "scene": meta.get("scene", ""),
                    "objects": meta.get("objects", ""),
                    "activities": meta.get("activities", ""),
                    "visible_text": meta.get("visible_text", ""),
                    "frame_url": frame_url,
                })

        # Sort frames chronologically by timestamp
        visual_frames.sort(key=lambda x: x.get("timestamp", 0))
    except Exception as e:
        print(f"Error fetching visual frames for reel {reel_id_str}: {e}")

    # 3. Audio transcript chunks count
    chunks_count = 0
    try:
        t_data = text_collection.get(where={"video_id": reel_id_str})
        if t_data and t_data.get("ids"):
            chunks_count = len(t_data["ids"])
    except Exception as e:
        print(f"Error checking text chunks for reel {reel_id_str}: {e}")

    # 4. Check audio file existence
    has_audio_file = False
    audio_path_str = doc.get("audio_path")
    if audio_path_str and Path(audio_path_str).is_file():
        has_audio_file = True

    fallback_thumbnail = visual_frames[0].get("frame_url") if visual_frames else None

    return {
        "id": reel_id_str,
        "title": doc.get("title") or "Untitled Reel",
        "thumbnail": doc.get("thumbnail"),
        "fallback_thumbnail": fallback_thumbnail,
        "reel_url": doc.get("reel_url"),
        "summary": doc.get("summary"),
        "transcript": doc.get("transcript"),
        "language": doc.get("language"),
        "status": doc.get("status") or "completed",
        "duration": doc.get("duration"),
        "uploader": doc.get("uploader"),
        "created_at": doc["created_at"].isoformat() if doc.get("created_at") else None,
        "video_url": video_url,
        "visual_frames": visual_frames,
        "visual_frames_count": len(visual_frames),
        "chunks_count": chunks_count,
        "has_audio_file": has_audio_file,
    }


def delete_reel_by_id(reel_id: str) -> dict:
    """
    Deletes all data associated with a single reel:
    1. Removes extracted frames on disk.
    2. Deletes visual frame embeddings in ChromaDB (where video_id == reel_id).
    3. Deletes transcript chunk embeddings in ChromaDB (where video_id == reel_id).
    4. Deletes video file on disk.
    5. Deletes audio file on disk.
    6. Removes reel document from MongoDB.
    Ensures that NO other reel's data is affected.
    """
    if not ObjectId.is_valid(reel_id):
        raise ValueError(f"Invalid reel ID: {reel_id}")

    doc = reels_collection.find_one({"_id": ObjectId(reel_id)})
    if not doc:
        return {"deleted": False, "reason": "not_found"}

    deleted_files = []
    reel_id_str = str(reel_id)

    # 1. Gather and remove frame files referenced in visual collection
    try:
        vis_items = visual_collection.get(where={"video_id": reel_id_str})
        for meta in vis_items.get("metadatas", []):
            if isinstance(meta, dict):
                fpath = meta.get("frame_path")
                if fpath and Path(fpath).is_file():
                    try:
                        Path(fpath).unlink(missing_ok=True)
                        deleted_files.append(str(fpath))
                    except Exception as e:
                        print(f"Error removing frame file {fpath}: {e}")
    except Exception as e:
        print(f"Error querying visual collection for reel {reel_id_str}: {e}")

    # 2. Delete ChromaDB visual frame embeddings for this reel only
    try:
        visual_collection.delete(where={"video_id": reel_id_str})
    except Exception as e:
        print(f"Error deleting visual embeddings for reel {reel_id_str}: {e}")

    # 3. Delete ChromaDB text chunk embeddings for this reel only
    try:
        text_collection.delete(where={"video_id": reel_id_str})
    except Exception as e:
        print(f"Error deleting text embeddings for reel {reel_id_str}: {e}")

    # 4. Remove video file & frames directory from disk
    video_path_str = doc.get("filename")
    if video_path_str:
        vpath = Path(video_path_str)
        if vpath.is_file():
            try:
                vpath.unlink(missing_ok=True)
                deleted_files.append(str(vpath))
            except Exception as e:
                print(f"Error removing video file {vpath}: {e}")

        # Check for <stem>_frames directory
        frames_dir = vpath.parent / f"{vpath.stem}_frames"
        if frames_dir.is_dir():
            try:
                shutil.rmtree(frames_dir, ignore_errors=True)
                deleted_files.append(str(frames_dir))
            except Exception as e:
                print(f"Error removing frames directory {frames_dir}: {e}")

    # 5. Remove audio file
    audio_path_str = doc.get("audio_path")
    if audio_path_str:
        apath = Path(audio_path_str)
        if apath.is_file():
            try:
                apath.unlink(missing_ok=True)
                deleted_files.append(str(apath))
            except Exception as e:
                print(f"Error removing audio file {apath}: {e}")

    # Check common audio directory locations by video stem or reel_id
    backend_root = Path(__file__).resolve().parents[2]
    audio_candidates = []
    if video_path_str:
        vstem = Path(video_path_str).stem
        audio_candidates.extend([
            backend_root / "audio" / f"{vstem}.wav",
            Path("audio") / f"{vstem}.wav",
        ])
    audio_candidates.extend([
        backend_root / "audio" / f"{reel_id_str}.wav",
        Path("audio") / f"{reel_id_str}.wav",
    ])

    for candidate in audio_candidates:
        if candidate.is_file() and str(candidate) not in deleted_files:
            try:
                candidate.unlink(missing_ok=True)
                deleted_files.append(str(candidate))
            except Exception as e:
                print(f"Error removing audio candidate {candidate}: {e}")

    # 6. Remove MongoDB document
    reels_collection.delete_one({"_id": ObjectId(reel_id)})

    return {
        "deleted": True,
        "id": reel_id_str,
        "deleted_files_count": len(deleted_files),
    }
