from fastapi import APIRouter, HTTPException
import subprocess
from uuid import uuid4
from pathlib import Path
from ..schemas.model import ExtractAudioRequest

from app.schemas.model import (
    SearchRequest
)

from app.rag.rag import (
    get_chunks,
    create_embeddings,
    store_embeddings,
    retrieve_chunks
)

from faster_whisper import WhisperModel

model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)

router = APIRouter()

@router.post("/Process-audio")
def Process_audio(payload: ExtractAudioRequest):

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

    # Whisper Model for Transcribe

    audio_file = Path(str(audio_path))

    if not audio_file.is_file():
            raise HTTPException(status_code=400, detail="audio_path does not exist")
    
    segments, info = model.transcribe(str(audio_file), language="en")
    segments = list(segments)
    
    text = " ".join(seg.text.strip() for seg in segments)
    
    for segment in segments:
        print(segment.text.strip())

    # Convert Transcribe To Embedding and Store in ChromaDB

    chunks = get_chunks(
        text,
        payload.video_id
    )

    embeddings = create_embeddings(chunks)

    store_embeddings(
        chunks,
        embeddings
    )

    return {
        "message_1": "Audio extracted successfully",
        "audio_file": audio_path,
        "message_2": "Audio Transcribe Successfully",
        "language": info.language,
        "text": text,
        "message_3": "Video indexed successfully",
        "video_id": payload.video_id,
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