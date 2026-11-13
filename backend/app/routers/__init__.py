"""Backwards-compatibility shim for app.routers.

Routers have been organized into app.api.
"""
from app.api import audio, frames, reel, vision

__all__ = ["audio", "frames", "reel", "vision"]

