from fastapi import APIRouter, HTTPException
from ..schemas.ReelRequest import ReelRequest
import yt_dlp
from pathlib import Path
from ..database.db import reels_collection

router = APIRouter()

@router.post("/download")
def download_reel(url: ReelRequest):

    DOWNLOAD_DIR = Path(__file__).resolve().parents[2] / "downloads"
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

    ydl_opts = {
        "outtmpl": str(DOWNLOAD_DIR / "%(title)s.%(ext)s"),
        "format": "best",
    }

    try:

        # Download Reel
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(
                str(url.url),
                download=True
            )
            filename = ydl.prepare_filename(info)
        print("Downloaded:", filename)

        # Create MongoDB document
        reel_doc = {
            "title": info.get("title"),
            "reel_url": str(url.url),
            "thumbnail": info.get("thumbnail"),
            "filename": filename
        }
        print("MongoDB document:", reel_doc)

        # Save to MongoDB (only once)
        result = reels_collection.insert_one(reel_doc)
        print("MongoDB ID:", result.inserted_id)
        reel_doc["_id"] = str(result.inserted_id)

        return {
            "id": str(result.inserted_id),
            "data": reel_doc,
            "status": "success"
        }

    except Exception as e:
        print("ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=str(e))