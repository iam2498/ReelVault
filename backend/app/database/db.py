import os
from pymongo import MongoClient

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
mongo_db_name = os.getenv("MONGO_DB_NAME", "reelvault")

client = MongoClient(mongo_uri)
db = client[mongo_db_name]
reels_collection = db["reels"]