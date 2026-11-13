from .reel import router as reel_router
from .audio import router as audio_router
from .frames import router as frames_router
from .vision import router as vision_router

__all__ = [
    "reel_router",
    "audio_router",
    "frames_router",
    "vision_router",
]

