# 🎬 ReelVault

> **Save it. Understand it. Find it again.**

**ReelVault** is an AI-powered knowledge management platform for short-form videos such as Instagram Reels. Instead of simply saving Reels and forgetting about them, ReelVault transforms them into **searchable, understandable knowledge**.

It automatically summarizes saved Reels, extracts their semantic meaning, allows users to chat with individual Reels, and lets users discover saved content using **semantic search**.

---

## ✨ Features

* 📥 **Save Reels**
  Save a Reel and its relevant metadata for later.

* 📝 **AI Reel Summarization**
  Generate a concise summary of the Reel's content.

* 💬 **Chat with a Reel**
  Ask questions about a specific Reel and get answers based on its content.

* 🧠 **Semantic Understanding**
  Convert Reel content into embeddings so it can be searched by meaning rather than exact keywords.

* 🔎 **Semantic Search**
  Search your saved Reels using natural language.

  > Example:
  > Search: `videos explaining how to build better habits`
  > ReelVault can find relevant Reels even if those exact words were never used.

* 🏷️ **Automatic Metadata**
  Generate useful information such as topics, keywords, and summaries.

* 📚 **Personal Reel Knowledge Base**
  Turn your saved Reels into a personal, searchable knowledge base.

---

## 🧠 How It Works

```text
                    ┌─────────────────┐
                    │   Save a Reel   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Extract Content │
                    │  & Metadata     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ AI Summarization│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Create Embedding│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Vector Database │
                    └────────┬────────┘
                             │
               ┌─────────────┴─────────────┐
               │                           │
               ▼                           ▼
       ┌───────────────┐           ┌───────────────┐
       │Semantic Search│           │ Chat with Reel│
       └───────────────┘           └───────────────┘
```

---

## 🛠️ Tech Stack

### Backend

* **Python**
* **FastAPI**
* **LangGraph**
* **REST API**

### AI / GenAI

* **LLM** — Reel summarization and question answering
* **Embeddings** — semantic representation of Reel content
* **RAG** — retrieval-based question answering

### Database

* **Vector Database** — storing Reel embeddings and metadata

### Frontend

* **[Add your frontend technology here]**

### Infrastructure

* **Docker**
* **Git / GitHub**

---

## 🔍 Semantic Search

Traditional search depends heavily on matching keywords.

For example:

```text
Query:
"How can I become more productive?"
```

A keyword-based system might only find content containing:

```text
productivity
productive
work
```

ReelVault instead converts the query into an embedding and compares it with the embeddings of saved Reels.

```text
User Query
     │
     ▼
Query Embedding
     │
     ▼
Vector Search
     │
     ▼
Relevant Reels
     │
     ▼
Ranked Results
```

This allows ReelVault to retrieve content based on **semantic similarity**.

---

## 💬 Chat with a Reel

Users can select a saved Reel and ask questions about it.

Example:

```text
User:
What are the three habits mentioned in this Reel?

        ↓

ReelVault retrieves relevant Reel content

        ↓

LLM generates an answer

        ↓

Answer:
The Reel recommends:
1. Planning your day
2. Avoiding unnecessary distractions
3. Reviewing your progress at night
```

The goal is to make every saved Reel **interactive instead of just bookmarked content**.

---

## 📂 Project Structure

```text
ReelVault/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── routes/
│   │   │   ├── reels.py
│   │   │   ├── search.py
│   │   │   └── chat.py
│   │   │
│   │   ├── services/
│   │   │   ├── summarizer.py
│   │   │   ├── embeddings.py
│   │   │   └── retrieval.py
│   │   │
│   │   ├── rag/
│   │   │   └── pipeline.py
│   │   │
│   │   └── database/
│   │       └── vector_store.py
│   │
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│
├── docker-compose.yml
│
├── .env.example
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/ReelVault.git

cd ReelVault
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it:

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file:

```env
LLM_API_KEY=your_api_key
VECTOR_DB_URL=your_vector_database_url
```

### 5. Start the backend

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

---

## 🐳 Running with Docker

Build and start the application:

```bash
docker compose up --build
```

Stop the application:

```bash
docker compose down
```

---

## 🔮 Future Improvements

* 🎯 Personalized Reel recommendations
* 🗂️ AI-generated collections
* 🏷️ Automatic categorization
* 📊 Saved-content analytics
* 🎙️ Voice-based Reel search
* 🖼️ Multimodal Reel understanding
* 🤖 Agentic Reel research
* 🔗 Similar-Reel discovery
* 📱 Mobile application
* 🔄 Automatic synchronization of saved Reels

---

## 🎯 Project Goals

ReelVault is built around one simple idea:

> **Your saved Reels should become knowledge, not digital clutter.**

The project explores how **LLMs, RAG, embeddings, vector databases, and agentic workflows** can be combined to create a practical AI application.

---

## 👨‍💻 Learning Goals

This project demonstrates practical experience with:

* REST API development
* FastAPI
* LLM integration
* Prompt engineering
* Embeddings
* Vector databases
* Semantic search
* RAG pipelines
* LangGraph
* Docker
* AI application architecture

---

## 📌 Status

🚧 **Currently in development**

ReelVault is being actively developed as an AI-powered semantic knowledge system for short-form video content.

---

## ⭐ If you find this project interesting

Give the repository a ⭐ and follow the development of ReelVault.
