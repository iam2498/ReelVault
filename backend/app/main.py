from fastapi import FastAPI
from .routers import reel,audio,frames

app = FastAPI()

app.include_router(reel.router)
app.include_router(audio.router)
app.include_router(frames.router)

@app.get("/")
def root():
    return {
        "status": "Backend is Running...."
    }