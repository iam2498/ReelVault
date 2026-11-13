from fastapi import HTTPException
import subprocess
from pathlib import Path
from uuid import uuid4


def extract_audio(video_path:str):

    audio_dir = Path("audio")
    audio_dir.mkdir(exist_ok=True)
    audio_path = audio_dir / f"{uuid4()}.wav"

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

    return audio_path