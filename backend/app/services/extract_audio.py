import subprocess
from pathlib import Path


def extract_audio(video_path: str) -> Path | None:
    video = Path(video_path)
    if not video.is_file():
        raise FileNotFoundError(f"video_path does not exist: {video_path}")

    audio_dir = Path(__file__).resolve().parents[2] / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    audio_path = audio_dir / f"{video.stem}.wav"

    try:
        subprocess.run(
            [
                "ffmpeg",
                "-y",  # overwrite output without prompting
                "-i", str(video),
                "-vn",
                "-ac", "1",
                "-ar", "16000",
                str(audio_path),
            ],
            check=True,
            capture_output=True,
        )
        return audio_path
    except subprocess.CalledProcessError as e:
        # Video might have no audio track (silent video); log and return None
        print(f"Audio extraction skipped or failed for {video_path}: {e.stderr.decode(errors='ignore') if e.stderr else e}")
        return None