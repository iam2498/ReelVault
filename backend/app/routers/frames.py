from fastapi import APIRouter, HTTPException
from pathlib import Path
from uuid import uuid4
from ..schemas.model import ExtractImageRequest
import subprocess

router = APIRouter()

@router.post("/process-frames")
def Extract_images(payload: ExtractImageRequest):

    frames_dir = Path("frames")
    frames_dir.mkdir(exist_ok=True)

    video_id = str(uuid4())
    frames_path = frames_dir / video_id
    frames_path.mkdir(exist_ok=True)

    if not Path(payload.video_path).is_file():
        raise HTTPException(
            status_code=400,
            detail="video_path does not exist"
        )

    try:
        subprocess.run([
            "ffmpeg",
            "-i", payload.video_path,
            "-vf", "fps=0.5,scale=768:-1",
            str(frames_path / "frame_%04d.jpg")
        ], check=True)

    except subprocess.CalledProcessError:
        raise HTTPException(
            status_code=500,
            detail="Images extraction failed"
        )

    return {
        "message": "Images extracted successfully",
        "frames_path": str(frames_path)
    }