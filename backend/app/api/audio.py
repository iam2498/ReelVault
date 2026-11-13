from fastapi import APIRouter
from uuid import uuid4
from app.schemas.model import ExtractAudioRequest, SearchRequest
from app.services.extract_audio import extract_audio
from app.services.transcribe import transcribe

from app.rag.rag import (
    get_chunks,
    create_embeddings,
    store_embeddings,
    retrieve_chunks
)

router = APIRouter()

@router.post("/Process-audio")
def Process_audio(payload: ExtractAudioRequest):

    # Extract Audio From Video
    audio_path = extract_audio(payload.video_path)

    # Transcribe Audio into Text
    transcribe_text = transcribe(audio_path)
    text = transcribe_text["text"]

    # Convert Text into Chunks
    chunks = get_chunks(
        text,
        payload.video_id
    )

    # Create Embedding For Created Chunks
    embeddings = create_embeddings(chunks)

    # Store Embedding and Chunks in Vector_Database
    store_embeddings(
        chunks,
        embeddings
    )

    return {
        "message_1": "Audio extracted successfully",
        "audio_file": audio_path,
        "message_2": "Audio Transcribe Successfully",
        "language": transcribe_text["language"],
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