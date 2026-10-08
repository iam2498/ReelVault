from fastapi import FastAPI
from .routers import reel,audio,frames,vision

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