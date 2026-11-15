import asyncio

from fastapi import APIRouter, HTTPException, BackgroundTasks

from app.graph.workflow import reel_graph, pipeline_graph
from app.rag.rag import retrieve_chunks
from app.rag.visual_rag import search_visual
from app.schemas.model import SearchRequest
from app.schemas.reel import ReelRequest
from app.services.download_reel import download_reel
from app.services.reel_store import update_reel, delete_reel_by_id, get_reel_details
from app.services.search import list_reels, search_reels, _resolve_fallback_thumbnail

router = APIRouter()


@router.post("/process")
async def process_reel(request: ReelRequest, background_tasks: BackgroundTasks):
    """
    Fast endpoint: downloads video, thumbnail & metadata immediately (~1-2s),
    returns response right away so user sees thumbnail & card in grid,
    while running transcription, visual AI analysis & vector indexing in background.
    """
    try:
        # 1. Download video & extract thumbnail immediately (~1-2 seconds)
        dl_res = await asyncio.to_thread(download_reel, str(request.url))
        video_id = dl_res["id"]
        data = dl_res["data"]
        is_already_done = (dl_res.get("status") == "existing" and data.get("status") == "completed")
        fallback_thumb = _resolve_fallback_thumbnail(data)

        # If already fully indexed, return immediately
        if is_already_done:
            return {
                "status": "completed",
                "id": video_id,
                "video_id": video_id,
                "title": data.get("title"),
                "thumbnail": data.get("thumbnail"),
                "fallback_thumbnail": fallback_thumb,
                "summary": data.get("summary"),
                "language": data.get("language") or "en",
                "chunks_created": 0,
                "visual_frames_indexed": 0,
                "message": "Reel already processed",
            }

        # 2. Schedule remaining heavy AI steps in background
        initial_state = {
            "url": str(request.url),
            "download_result": dl_res,
            "video_id": video_id,
            "video_path": data["filename"],
            "title": data.get("title"),
            "uploader": data.get("uploader"),
            "duration": data.get("duration"),
        }

        async def run_pipeline():
            try:
                await pipeline_graph.ainvoke(initial_state)
            except Exception as e:
                print(f"Background processing error for reel {video_id}:", repr(e))
                await asyncio.to_thread(
                    update_reel,
                    video_id,
                    {
                        "status": "failed",
                        "summary": "Processing encountered an error in background.",
                    },
                )

        background_tasks.add_task(run_pipeline)

        # 3. Immediately return so frontend displays the thumbnail and card right away!
        return {
            "status": "processing",
            "id": video_id,
            "video_id": video_id,
            "title": data.get("title"),
            "thumbnail": data.get("thumbnail"),
            "fallback_thumbnail": fallback_thumb,
            "summary": "Analyzing video & audio insights...",
            "language": "en",
            "chunks_created": 0,
            "visual_frames_indexed": 0,
            "message": "Reel fetched successfully! Processing continues in background.",
        }

    except HTTPException:
        raise
    except Exception as e:
        print("Processing error:", repr(e))
        raise HTTPException(
            status_code=500,
            detail=f"Reel processing failed: {e}",
        ) from e


@router.post("/search")
def search(request: SearchRequest):
    """Main search for the UI: speech + visuals merged, one result per reel."""
    try:
        results = search_reels(request.query, request.top_k)
        return {
            "query": request.query,
            "count": len(results),
            "results": results,
        }
    except Exception as e:
        print("Search error:", repr(e))
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/library")
def library(limit: int = 50, skip: int = 0):
    """All saved reels, newest first, for the home screen grid."""
    try:
        return {"reels": list_reels(limit=limit, skip=skip)}
    except Exception as e:
        print("Library error:", repr(e))
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/{reel_id}")
async def get_reel(reel_id: str):
    """Get complete expanded details for a single reel."""
    try:
        details = await asyncio.to_thread(get_reel_details, reel_id)
        if not details:
            raise HTTPException(status_code=404, detail="Reel not found")
        return details
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print("Get reel details error:", repr(e))
        raise HTTPException(status_code=500, detail=f"Failed to fetch reel details: {e}") from e


@router.delete("/{reel_id}")
async def delete_reel(reel_id: str):
    """
    Delete a single reel and all of its associated data:
    video file, audio file, extracted frames, transcripts, and vector embeddings.
    Strictly isolated to this reel only.
    """
    try:
        result = await asyncio.to_thread(delete_reel_by_id, reel_id)
        if not result.get("deleted"):
            raise HTTPException(status_code=404, detail="Reel not found")
        return {
            "status": "success",
            "message": "Reel and all associated files deleted successfully",
            "id": reel_id,
            "deleted_files_count": result.get("deleted_files_count", 0),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        print("Delete error:", repr(e))
        raise HTTPException(status_code=500, detail=f"Failed to delete reel: {e}") from e


# Debug endpoints: raw results, useful while testing
@router.post("/text-search")
def text_search(request: SearchRequest):
    return {
        "query": request.query,
        "results": retrieve_chunks(request.query, request.top_k),
    }


@router.post("/visual-search")
def visual_search(request: SearchRequest):
    return {
        "query": request.query,
        "results": search_visual(request.query, request.top_k),
    }