from typing import TypedDict, Any


class ReelState(TypedDict, total=False):
    # Input
    url: str

    # Download
    download_result: dict | None
    video_id: str | None        # MongoDB _id as string
    video_path: str | None

    # Audio branch
    audio_path: str | None
    transcript: str | None
    language: str | None
    summary: str | None
    chunks: list | None
    embeddings: Any
    processing_status: str | None

    # Visual branch
    frame_paths: list[str] | None
    visual_descriptions: list[dict] | None
    visual_embeddings_count: int