import json
import mimetypes
import os
import time

from google import genai
from google.genai import types
from pydantic import BaseModel

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

PRIMARY_MODEL = os.getenv("GEMINI_VISION_MODEL", "gemini-3.5-flash-lite")
FALLBACK_MODELS = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"]

PROMPT = """
Analyze this video frame for a visual search system.

Identify:
1. Main scene
2. Objects and entities
3. Human activities
4. Environment and background
5. Visible text (if any)
6. Detailed visual description

Only describe what is actually visible.
Do not invent missing information.
"""


class FrameDescription(BaseModel):
    scene: str
    objects: list[str]
    activities: list[str]
    environment: str
    visible_text: list[str]
    description: str


FALLBACK = {
    "scene": "",
    "objects": [],
    "activities": [],
    "environment": "",
    "visible_text": [],
    "description": "Frame could not be analyzed.",
}


def understand_frame(image_path: str) -> dict:
    mime_type = mimetypes.guess_type(image_path)[0] or "image/jpeg"

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    models_to_try = [PRIMARY_MODEL] + [m for m in FALLBACK_MODELS if m != PRIMARY_MODEL]

    for model_name in models_to_try:
        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=[
                        PROMPT,
                        types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                    ],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=FrameDescription,
                    ),
                )
                if response and response.text:
                    data = json.loads(response.text)
                    return FrameDescription.model_validate(data).model_dump()
            except Exception as e:
                msg = str(e)
                print(f"Frame analysis failed with {model_name} ({image_path}):", repr(e))
                if any(code in msg for code in ("429", "503", "RESOURCE_EXHAUSTED")):
                    time.sleep(1 + attempt * 2)
                    continue
                # If model is deprecated or not found or quota exhausted, try next model
                break

    return dict(FALLBACK)  # keeps frame count aligned for storage