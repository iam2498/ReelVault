import mimetypes
import os
import time

from google import genai
from google.genai import types

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "gemini-embedding-2")
DIMENSIONS = 768  # must stay the same as the Chroma collection

_CONFIG = types.EmbedContentConfig(output_dimensionality=DIMENSIONS)


def _embed(contents):
    """Call the API, retry only on rate-limit / temporary errors."""
    last_error = None
    for attempt in range(3):
        try:
            response = client.models.embed_content(
                model=MODEL,
                contents=contents,
                config=_CONFIG,
            )
            return response.embeddings[0].values
        except Exception as e:
            last_error = e
            msg = str(e)
            if any(code in msg for code in ("429", "503", "RESOURCE_EXHAUSTED")):
                time.sleep(2 ** attempt)
                continue
            raise
    raise last_error


def generate_image_embedding(image_path: str):
    mime_type = mimetypes.guess_type(image_path)[0] or "image/jpeg"

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    return _embed([types.Part.from_bytes(data=image_bytes, mime_type=mime_type)])


def generate_text_embedding(text: str):
    return _embed(text)