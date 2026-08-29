from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["reelvault"]
reels_collection = db["reels"]