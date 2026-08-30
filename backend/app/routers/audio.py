from fastapi import APIRouter, HTTPException
import subprocess
from uuid import uuid4
from pathlib import Path
from ..schemas.model import ExtractAudioRequest,TranscribeRequest

from app.schemas.model import (
    IndexRequest,
    SearchRequest
)

from app.rag.rag import (
    get_chunks,
    create_embeddings,
    store_embeddings,
    retrieve_chunks
)

from faster_whisper import WhisperModel

router = APIRouter()

@router.post("/extract-audio")
def extract_audio(payload: ExtractAudioRequest):

    audio_dir = Path("audio")
    audio_dir.mkdir(exist_ok=True)
    audio_path = audio_dir / f"{uuid4()}.wav"

    video_path = payload.video_path
    if not Path(video_path).is_file():
        raise HTTPException(status_code=400, detail="video_path does not exist")

    try:
        subprocess.run([
            "ffmpeg",
            "-i", video_path,
            "-vn",
            "-ac", "1",
            "-ar", "16000",
            audio_path
        ], check=True)

    except subprocess.CalledProcessError:
        raise HTTPException(
            status_code=500,
            detail="Audio extraction failed"
        )

    return {
        "message": "Audio extracted successfully",
        "audio_file": audio_path
    }

model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)

@router.post("/transcribe")
def transcribe(payload: TranscribeRequest):

    audio_file = Path(payload.audio_path)

    if not audio_file.is_file():
        raise HTTPException(status_code=400, detail="audio_path does not exist")

    segments, info = model.transcribe(str(audio_file), language="en")
    segments = list(segments)

    text = " ".join(seg.text.strip() for seg in segments)

    for segment in segments:
        print(segment.text.strip())

    return {
        "language": info.language,
        "text": text
    }

@router.post("/index")
def index_video(request: IndexRequest):

    chunks = get_chunks(
        request.text,
        request.video_id
    )

    embeddings = create_embeddings(chunks)

    store_embeddings(
        chunks,
        embeddings
    )

    return {
        "message": "Video indexed successfully",
        "video_id": request.video_id,
        "chunks_created": len(chunks)
    }

@router.post("/search")
def search(request: SearchRequest):

    results = retrieve_chunks(
        request.query,
        request.top_k
    )

    return {
        "query": request.query,
        "results": results
    }