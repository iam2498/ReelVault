import asyncio

from fastapi import APIRouter, HTTPException

from app.graph.workflow import reel_graph
from app.schemas.reel import ReelRequest
from app.services.reel_store import update_reel

router = APIRouter()


@router.post("/download")
async def process_reel(request: ReelRequest):
    try:
        result = await reel_graph.ainvoke({"url": str(request.url)})

        reel_id = result["video_id"]
        status = result.get("processing_status") or "completed"
        await asyncio.to_thread(update_reel, reel_id, {"status": status})

        data = result["download_result"]["data"]
        return {
            "id": reel_id,
            "video_id": reel_id,
            "status": status,
            "title": data.get("title"),
            "thumbnail": data.get("thumbnail"),
            "summary": result.get("summary"),
            "language": result.get("language"),
            "visual_frames_indexed": result.get("visual_embeddings_count", 0),
        }

    except HTTPException:
        raise
    except Exception as e:
        print("ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=str(e)) from e