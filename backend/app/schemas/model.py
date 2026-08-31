from pydantic import BaseModel

class ExtractAudioRequest(BaseModel):
    video_path: str
    video_id: str

class TranscribeRequest(BaseModel):
    audio_path:str

class IndexRequest(BaseModel):
    text:str
    video_id: str


class SearchRequest(BaseModel):
    query: str
    top_k: int = 3