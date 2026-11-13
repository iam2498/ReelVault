from fastapi import FastAPI
from app.api import audio, frames, reel, vision

app = FastAPI()

app.include_router(reel.router)
app.include_router(audio.router)
app.include_router(frames.router)
app.include_router(vision.router)

@app.get("/")
def root():
    return {
        "status": "Backend is Running...."
    }