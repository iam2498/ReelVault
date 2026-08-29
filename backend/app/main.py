from fastapi import FastAPI
from .routers import reel

app = FastAPI()

app.include_router(reel.router)

@app.get("/")
def root():
    return {
        "status": "Backend is Running...."
    }