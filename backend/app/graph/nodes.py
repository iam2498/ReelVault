import asyncio

from app.graph.state import ReelState

from app.services.download_reel import download_reel
from app.services.extract_audio import extract_audio
from app.services.transcribe import transcribe
from app.services.summarize import summarize_text, summarize_visual_descriptions
from app.services.reel_store import update_reel

from app.services.extract_frames import extract_frames
from app.services.visual_understanding import understand_frame
from app.rag.visual_rag import store_visual_frames

from app.rag.rag import (
    get_chunks,
    create_embeddings,
    store_embeddings,
)


# 1. Download
async def download_reel_node(state: ReelState) -> dict:
    result = await asyncio.to_thread(download_reel, state["url"])
    return {
        "download_result": result,
        "video_id": result["id"],
        "video_path": result["data"]["filename"],
    }


# 2. Extract audio
async def extract_audio_node(state: ReelState) -> dict:
    audio_path = await asyncio.to_thread(extract_audio, state["video_path"])
    audio_path_str = str(audio_path) if audio_path else None
    if audio_path_str:
        await asyncio.to_thread(
            update_reel,
            state["video_id"],
            {"audio_path": audio_path_str},
        )
    return {"audio_path": audio_path_str}


# 3. Transcribe
async def transcribe_node(state: ReelState) -> dict:
    result = await asyncio.to_thread(transcribe, state["audio_path"])
    return {
        "transcript": result["text"],
        "language": result["language"],
    }


# 4. Summarize and save transcript to MongoDB
async def summarize_node(state: ReelState) -> dict:
    transcript = state["transcript"]

    try:
        summary = await asyncio.to_thread(summarize_text, transcript)
    except Exception as e:
        print("Summary failed:", repr(e))
        summary = transcript[:200].strip() + "..."   # simple fallback

    await asyncio.to_thread(
        update_reel,
        state["video_id"],
        {
            "transcript": transcript,
            "language": state.get("language"),
            "summary": summary,
        },
    )
    return {"summary": summary}


# 5. Create chunks
async def create_chunks_node(state: ReelState) -> dict:
    chunks = await asyncio.to_thread(
        get_chunks,
        state.get("transcript") or "",
        state["video_id"],
    )
    return {"chunks": chunks}


# 6. Create embeddings
async def create_embeddings_node(state: ReelState) -> dict:
    chunks = state.get("chunks") or []
    if not chunks:
        return {"embeddings": []}
    embeddings = await asyncio.to_thread(create_embeddings, chunks)
    return {"embeddings": embeddings}


# 7. Store embeddings
async def store_embeddings_node(state: ReelState) -> dict:
    chunks = state.get("chunks") or []
    if chunks:
        await asyncio.to_thread(
            store_embeddings,
            chunks,
            state["embeddings"],
        )
    return {"text_indexed": True}


# 8. No speech in the reel
async def no_speech_node(state: ReelState) -> dict:
    return {
        "transcript": "",
        "chunks": [],
        "embeddings": [],
        "text_indexed": False,
    }


# Passthrough node for audio branch synchronization
async def audio_done_node(state: ReelState) -> dict:
    return {}


# 9. Extract frames
async def extract_frames_node(state: ReelState) -> dict:
    frames = await asyncio.to_thread(extract_frames, state["video_path"])
    return {"frame_paths": frames or []}


# 10. Understand frames (concurrency 2 with spacing to avoid free tier rate limits)
async def understand_frames_node(state: ReelState) -> dict:
    frames = state.get("frame_paths") or []
    sem = asyncio.Semaphore(2)

    async def one(path: str):
        async with sem:
            res = await asyncio.to_thread(understand_frame, path)
            await asyncio.sleep(0.2)
            return res

    descriptions = await asyncio.gather(*(one(p) for p in frames))
    return {"visual_descriptions": list(descriptions)}


# 11. Store visual embeddings
async def store_visual_embeddings_node(state: ReelState) -> dict:
    frames = state.get("frame_paths") or []
    descriptions = state.get("visual_descriptions") or []

    if not frames:
        return {"visual_embeddings_count": 0}

    count = await asyncio.to_thread(
        store_visual_frames,
        frames,
        descriptions,
        state["video_id"],
    )
    return {"visual_embeddings_count": count}


# 12. Finalize processing and aggregate status
async def finalize_processing_node(state: ReelState) -> dict:
    video_id = state["video_id"]
    chunks_count = len(state.get("chunks") or [])
    visual_count = state.get("visual_embeddings_count", 0)
    has_transcript = bool((state.get("transcript") or "").strip())
    existing_summary = state.get("summary")

    # If no speech, generate rich visual summary from frame scene descriptions
    if not has_transcript:
        visual_descriptions = state.get("visual_descriptions") or []
        summary = await asyncio.to_thread(
            summarize_visual_descriptions,
            visual_descriptions,
        )
    else:
        summary = existing_summary or "Completed"

    # Status: if either speech chunks or visual frames were indexed, mark completed
    if chunks_count > 0 or visual_count > 0:
        status = "completed"
    else:
        status = "completed_without_indexing"

    update_fields = {
        "status": status,
        "summary": summary,
        "language": state.get("language") or "en",
    }
    if not has_transcript:
        update_fields["transcript"] = ""

    await asyncio.to_thread(update_reel, video_id, update_fields)

    return {
        "summary": summary,
        "processing_status": status,
        "visual_embeddings_count": visual_count,
        "chunks_count": chunks_count,
    }