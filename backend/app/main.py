from fastapi import FastAPI
from .routers import reel
from .routers import audio

app = FastAPI()

app.include_router(reel.router)
app.include_router(audio.router)

@app.get("/")
def root():
    return {
        "status": "Backend is Running...."
    }