from pathlib import Path
from uuid import uuid4
import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

CHUNK_SIZE = 500
CHUNK_OVERLAP = 100

splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
)

def get_chunks(text: str, video_id: str):
    if not text.strip():
        return []

    if len(text) <= CHUNK_SIZE:
        return [{"text": text, "video_id": video_id}]

    chunks = splitter.split_text(text)
    return [{"text": chunk, "video_id": video_id} for chunk in chunks]

def create_embeddings(chunks):

    if not chunks:
        return []

    texts = [chunk["text"] for chunk in chunks]
    embeddings = embedding_model.encode(texts)

    return embeddings


# Absolute path: persistent vector store in backend/chroma_db
CHROMA_PATH = Path(__file__).resolve().parents[2] / "chroma_db"
client = chromadb.PersistentClient(path=str(CHROMA_PATH))
collection = client.get_or_create_collection(
    name="reel",
    metadata={"hnsw:space": "cosine"},
)


def store_embeddings(chunks, embeddings):
    if not chunks:
        return

    ids = [str(uuid4()) for _ in chunks]
    documents = [chunk["text"] for chunk in chunks]
    metadatas = [{"video_id": chunk["video_id"]} for chunk in chunks]

    collection.add(
        ids=ids,
        embeddings=embeddings.tolist(),
        documents=documents,
        metadatas=metadatas,
    )


def retrieve_chunks(query, top_k=3):
    query_embedding = embedding_model.encode(query)
    results = collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=top_k,
    )

    if not results["documents"] or not results["documents"][0]:
        return []

    retrieved_chunks = []
    for i in range(len(results["documents"][0])):
        retrieved_chunks.append({
            "text": results["documents"][0][i],
            "video_id": results["metadatas"][0][i]["video_id"],
            "distance": results["distances"][0][i],
        })

    return retrieved_chunks