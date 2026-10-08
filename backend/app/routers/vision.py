from fastapi import APIRouter, HTTPException
from ..services.visual_embedding import VisualEmbedding
from ..services.ocr_service import OCRService

from pathlib import Path


router = APIRouter()

visual_model = VisualEmbedding()
ocr_model = OCRService()


@router.post("/Process-frames")
def vision_frames():

    frames_folder = Path("frames")

    if not frames_folder.exists():
        raise HTTPException(
            status_code=404,
            detail="Frames folder not found"
        )

    results = []

    image_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    }

    for frame_path in frames_folder.iterdir():

        if frame_path.suffix.lower() not in image_extensions:
            continue

        try:

            # Generate visual embedding
            embedding = visual_model.encode_image(
                str(frame_path)
            )

            # Extract OCR text
            extracted_text = ocr_model.extract_text(
                str(frame_path)
            )

            results.append({
                "filename": frame_path.name,
                "ocr_text": extracted_text,
                "embedding": embedding
            })

        except Exception as e:

            results.append({
                "filename": frame_path.name,
                "error": str(e)
            })

    return {
        "total_frames": len(results),
        "frames": results
    }