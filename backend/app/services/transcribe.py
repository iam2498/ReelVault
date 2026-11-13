from fastapi import HTTPException
from pathlib import Path
from faster_whisper import WhisperModel

model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)

def transcribe(audio_path):

    # Whisper Model for Transcribe

    audio_file = Path(str(audio_path))

    if not audio_file.is_file():
            raise HTTPException(status_code=400, detail="audio_path does not exist")
    
    segments, info = model.transcribe(str(audio_file), language="en")
    segments = list(segments)
    
    text = " ".join(seg.text.strip() for seg in segments)
    
    for segment in segments:
        print(segment.text.strip())

    return{
        "language": info.language,
        "text": text
    }