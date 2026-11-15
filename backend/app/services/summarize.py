import os
import time

from google import genai
from google.genai import types

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

PRIMARY_MODEL = os.getenv("GEMINI_SUMMARY_MODEL", "gemini-3.5-flash-lite")
FALLBACK_MODELS = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"]


def summarize_text(transcript: str) -> str:
    prompt = (
        "Summarize this Instagram reel transcript in 2 short sentences. "
        "Mention the main topic and the key takeaway. "
        "Do not add anything that is not in the transcript.\n\n"
        f"Transcript:\n{transcript[:6000]}"
    )

    config = types.GenerateContentConfig(temperature=0.2)
    models_to_try = [PRIMARY_MODEL] + [m for m in FALLBACK_MODELS if m != PRIMARY_MODEL]

    for model_name in models_to_try:
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config,
                )
                text = (response.text or "").strip()
                if text:
                    return text
            except Exception as e:
                msg = str(e)
                print(f"Summary failed with {model_name}:", repr(e))
                if any(code in msg for code in ("429", "503", "RESOURCE_EXHAUSTED")):
                    time.sleep(1 + attempt * 2)
                    continue
                break

    return transcript[:200].strip() + "..." if transcript else "Summary not available."


def summarize_visual_descriptions(descriptions: list[dict]) -> str:
    """Summarizes a reel from its visual frames when no speech is present."""
    if not descriptions:
        return "Video reel with no speech detected."

    notes = []
    for d in descriptions:
        desc = d.get("description")
        scene = d.get("scene")
        if desc and desc != "Frame could not be analyzed." and desc not in notes:
            notes.append(desc)
        elif scene and scene not in notes:
            notes.append(scene)

    if not notes:
        return "Video reel with background audio or music."

    combined = " ; ".join(notes[:8])
    prompt = (
        "Summarize this Instagram reel based on its visual scene descriptions in 1-2 concise sentences. "
        "Describe what happens in the video.\n\n"
        f"Visual scenes:\n{combined}"
    )

    config = types.GenerateContentConfig(temperature=0.2)
    models_to_try = [PRIMARY_MODEL] + [m for m in FALLBACK_MODELS if m != PRIMARY_MODEL]

    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config,
            )
            text = (response.text or "").strip()
            if text:
                return text
        except Exception as e:
            print(f"Visual summary failed with {model_name}:", repr(e))
            continue

    return notes[0] if notes else "Video reel with no speech detected."