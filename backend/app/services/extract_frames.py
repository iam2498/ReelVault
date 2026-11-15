import subprocess
from pathlib import Path


def extract_frames(video_path: str) -> list[str]:

    video = Path(video_path)

    if not video.is_file():
        raise FileNotFoundError(f"Video not found: {video_path}")

    frame_dir = video.parent / f"{video.stem}_frames"
    frame_dir.mkdir(parents=True, exist_ok=True)

    # Purge any stale extracted frames before extracting new ones
    for old_frame in frame_dir.glob("frame_*.jpg"):
        try:
            old_frame.unlink(missing_ok=True)
        except Exception:
            pass

    output_pattern = str(frame_dir / "frame_%04d.jpg")

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i", str(video),
            "-vf", "fps=0.5,scale=768:-2",  # -2 guarantees even height for all aspect ratios
            "-q:v", "3",
            output_pattern
        ],
        check=True,
        capture_output=True,
        text=True,
        timeout=180
    )

    return [
        str(path)
        for path in sorted(frame_dir.glob("frame_*.jpg"))
    ]