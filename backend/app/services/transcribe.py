from pathlib import Path

_whisper_model = None


def get_whisper_model():
    """Lazy-load the WhisperModel so imports and server startup are instant."""
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel
        # "small" gives good translation (Hindi/Gujarati/etc.) while running on CPU.
        _whisper_model = WhisperModel(
            "small",
            device="cpu",
            compute_type="int8",
        )
    return _whisper_model


def transcribe(audio_path: str | Path | None) -> dict:
    if not audio_path:
        return {"language": "en", "text": ""}

    audio_file = Path(str(audio_path))
    if not audio_file.is_file():
        return {"language": "en", "text": ""}

    model = get_whisper_model()
    segments, info = model.transcribe(
        str(audio_file),
        task="translate",     # output is always English
        beam_size=5,
        vad_filter=True,      # ignore music/silence, avoids made-up text
    )
    segments = list(segments)
    text = " ".join(seg.text.strip() for seg in segments).strip()

    return {
        "language": info.language if info else "en",
        "text": text,
    }