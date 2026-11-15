from pathlib import Path
from dotenv import load_dotenv

# Ensure environment variables are loaded regardless of current working directory
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import reel, process


app = FastAPI(
    title="ReelVault API",
    description="AI-powered Instagram Reel Processing and Search",
    version="1.0.0"
)

# Serve downloaded videos and extracted frames statically
downloads_dir = Path(__file__).resolve().parent.parent / "downloads"
downloads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/downloads", StaticFiles(directory=str(downloads_dir)), name="downloads")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(
    reel.router,
    tags=["Reels"]
)

app.include_router(
    process.router,
    prefix="/reels",
    tags=["Reel Processing"]
)


# Root Endpoint
@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "ReelVault Backend is Running"
    }


# Health Check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy"
    }
