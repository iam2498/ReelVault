from datetime import datetime, timezone
from pathlib import Path

import yt_dlp

from app.database.db import reels_collection


def download_reel(url: str) -> dict:
    # Check if this reel is already saved and its video file still exists
    existing = reels_collection.find_one({"reel_url": url})
    if existing and existing.get("filename"):
        file_path = Path(existing["filename"])
        if file_path.is_file():
            reel_id = str(existing["_id"])
            existing["_id"] = reel_id
            return {"id": reel_id, "data": existing, "status": "existing"}

    download_dir = Path(__file__).resolve().parents[2] / "downloads"
    download_dir.mkdir(parents=True, exist_ok=True)

    ydl_opts = {
        "outtmpl": str(download_dir / "%(id)s.%(ext)s"),
        "format": "best[ext=mp4]/best",
        "quiet": True,
        # "cookiefile": "cookies.txt",  # enable if Instagram asks for login
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)

        uploader = (
            info.get("uploader")
            or info.get("channel")
            or info.get("uploader_id")
        )

        reel_doc = {
            "title": info.get("title"),
            "uploader": uploader,
            "duration": info.get("duration"),
            "reel_url": url,
            "thumbnail": info.get("thumbnail"),
            "filename": filename,
            "status": "processing",
            "created_at": datetime.now(timezone.utc),
        }

        # If previous document exists for this url without a valid file, update it; otherwise insert
        if existing:
            reels_collection.update_one({"_id": existing["_id"]}, {"$set": reel_doc})
            reel_id = str(existing["_id"])
        else:
            result = reels_collection.insert_one(reel_doc)
            reel_id = str(result.inserted_id)

        reel_doc["_id"] = reel_id
        return {"id": reel_id, "data": reel_doc, "status": "success"}

    except Exception as e:
        print("DOWNLOAD ERROR:", repr(e))
        raise RuntimeError(f"Failed to download reel: {e}") from e