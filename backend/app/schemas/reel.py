from pydantic import BaseModel,HttpUrl

class ReelRequest(BaseModel):
    url:HttpUrl