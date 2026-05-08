# Mental Health AI Services

A FastAPI-based service layer for the mental health platform. It includes the AI chat service for LangChain/RAG/safety monitoring and a lightweight analytics report service used by the main backend.

## Features

- **AI Chat Support**
  - LangChain-based conversational AI
  - Context-aware responses using retrieved documents
  - Support for conversation history
  - Multiple model integration (OpenAI, Google GenAI)

- **Retrieval-Augmented Generation (RAG)**
  - FAISS vector store for document retrieval
  - Semantic search over mental health resources
  - Relevance scoring
  - Context augmentation for AI responses

- **Safety Monitoring**
  - Crisis detection and alerting
  - Keyword-based risk assessment
  - Risk level classification (low, medium, high, critical)
  - Counselor alerts for urgent messages

- **Sentiment & Emotion Analysis**
  - Real-time sentiment detection
  - Emotion scoring (joy, sadness, anger, fear, surprise)
  - Stress level assessment
  - Continuous mood tracking

- **Embeddings**
  - Sentence transformer embeddings
  - Document vectorization
  - Index management

- **Health Monitoring**
  - Service health checks
  - Status monitoring endpoint

- **Analytics Report Service**
  - Separate FastAPI app under `analytics_service/`
  - Summarizes metrics supplied by the Express backend
  - Generates operational recommendations without inventing platform totals

## Tech Stack

- **Framework**: FastAPI
- **Server**: Uvicorn
- **LLM Integration**: LangChain, OpenAI, Google GenAI
- **Vector Store**: FAISS
- **Embeddings**: Sentence Transformers
- **NLP**: NLTK, Transformers
- **Deep Learning**: PyTorch
- **Configuration**: Pydantic Settings

## Project Structure

```
python-services/
├── ai_service/
│   ├── config/
│   │   └── settings.py          # Application settings
│   ├── models/
│   │   ├── chat_models.py      # Chat request/response models
│   │   ├── document_models.py  # Document models
│   │   └── embedding_models.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── health_routes.py   # Health check endpoints
│   │   ├── chat_routes.py   # Chat endpoints
│   │   ├── rag_routes.py   # RAG endpoints
│   │   ├── safety_routes.py # Safety endpoints
│   │   └── embedding_routes.py
│   ├── services/
│   │   ├── langchain_service.py  # LLM service
│   │   ├── rag_service.py     # RAG service
│   │   ├── embedding_service.py # Embedding service
│   │   └── safety_service.py  # Safety service
│   ├── data/
│   │   ├── faiss_index.index  # Vector store
│   │   └── metadata.pkl     # Document metadata
│   ├── dependencies.py       # Service initialization
│   ├── main.py            # FastAPI app
│   └── .env              # Environment config
│
├── analytics_service/
│   └── main.py            # Report generation service, default port 8002
│
├── requirements.txt
└── README.md
```

## Installation

### Prerequisites

- Python 3.10+
- OpenAI API key (optional)
- Google GenAI API key (optional)
- 256MB+ memory (after lazy-loading optimization)

### Steps

1. **Create virtual environment**
   ```bash
   cd python-services
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate  # Windows
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**

   The service uses a **centralized configuration file** at `ai_service/config/settings.py`.
   
   Create `ai_service/.env` file:
   ```bash
   cp .env.example ai_service/.env
   ```

4. **Update `ai_service/.env` with your configuration**

   All environment variables are documented in [ENV_VARIABLES.md](ENV_VARIABLES.md).
   
   Key variables:
   ```env
   # Service Configuration
   HOST=0.0.0.0          # Bind to all interfaces (cloud-ready)
   PORT=8001             # Standard port for AI service
   DEBUG=False           # False in production, True for development
   
   # LLM Configuration (at least one required)
   GOOGLE_API_KEY=your-google-key
   OPENAI_API_KEY=your-openai-key
   DEEPSEEK_API_KEY=your-deepseek-key
   HUGGINGFACE_API_TOKEN=your-hf-token
   
   # Model Selection
   LLM_MODEL=gemini-flash-latest
   LLM_TEMPERATURE=0.7
   LLM_MAX_TOKENS=1000
   
   # Embedding Configuration
   EMBEDDING_MODEL=all-MiniLM-L6-v2  # Lightweight (~80MB)
   
   # Vector Store
   VECTOR_INDEX_PATH=./data/faiss_index.index
   METADATA_PATH=./data/metadata.pkl
   
   # CORS
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
   
   # Safety Settings
   CRISIS_ALERT_THRESHOLD=0.8
   ```

5. **Start the service**
   ```bash
   # Development with auto-reload
   python ai_service/main.py
   
   # Or with uvicorn directly
   uvicorn ai_service.main:app --host 0.0.0.0 --port 8001
   ```

   Optional analytics/report service:
   ```bash
   uvicorn analytics_service.main:app --host 0.0.0.0 --port 8002
   ```

6. **Open API documentation**
   Navigate to `http://localhost:8001/docs`

---

## ✅ Environment Configuration System

### Centralized Config File: `ai_service/config/settings.py`

All environment variables are managed using Pydantic BaseSettings:

```python
from config.settings import settings

# Usage in code:
api_key = settings.GOOGLE_API_KEY
embedding_model = settings.EMBEDDING_MODEL
port = settings.PORT
debug = settings.DEBUG
```

### Available Configuration

| Setting | Default | Purpose |
|---------|---------|---------|
| **HOST** | 0.0.0.0 | Bind address (cloud-ready) |
| **PORT** | 8001 | Service port |
| **DEBUG** | False | Debug/reload mode |
| **GOOGLE_API_KEY** | "" | Google GenAI API key |
| **OPENAI_API_KEY** | "" | OpenAI API key |
| **DEEPSEEK_API_KEY** | "" | DeepSeek API key |
| **HUGGINGFACE_API_TOKEN** | "" | Hugging Face token |
| **LLM_MODEL** | gemini-flash-latest | LLM model name |
| **LLM_TEMPERATURE** | 0.7 | Model temperature (0-1) |
| **LLM_MAX_TOKENS** | 1000 | Max tokens per response |
| **EMBEDDING_MODEL** | all-MiniLM-L6-v2 | Embedding model |
| **VECTOR_INDEX_PATH** | ./data/faiss_index.index | FAISS index path |
| **METADATA_PATH** | ./data/metadata.pkl | Metadata storage path |
| **ALLOWED_ORIGINS** | localhost | CORS allowed origins |
| **CRISIS_ALERT_THRESHOLD** | 0.8 | Crisis detection threshold |

### Benefits

✅ **Memory Efficient** - Lazy-loads ML models on first request  
✅ **Validation** - Pydantic validates all environment variables  
✅ **Organized** - All settings in one place  
✅ **Easy Overrides** - Environment variables override defaults  
✅ **Production Ready** - Proper defaults for deployment  

See [ENV_VARIABLES.md](ENV_VARIABLES.md) for complete documentation.

---

## ✅ Memory Optimization: Lazy-Loading

### Problem Solved
- **Before**: SentenceTransformer model loaded at startup (~300MB) → Out of memory on Render (512MB)
- **After**: Models load on first request → Startup uses ~100MB → Works on free tier

### How It Works

Models are initialized on demand, not at app startup:

```python
class EmbeddingService:
    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL
        self.model = None  # Lazy load on first use
    
    def _ensure_model_loaded(self):
        """Load model on first use (lazy loading)"""
        if self.model is None:
            self.model = SentenceTransformer(self.model_name)
    
    async def generate_embedding(self, text: str):
        self._ensure_model_loaded()  # Load if needed
        # Use model...
```

### Result

- ✅ Startup time: <2 seconds
- ✅ Startup memory: ~100MB (vs. 500MB before)
- ✅ Works on Render free tier (512MB)
- ✅ No changes to API or usage

---

## Cloud Deployment

### Port Binding for Render/Railway/Heroku

The service properly binds to `0.0.0.0` for cloud platforms:

```python
# ai_service/main.py
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,      # = "0.0.0.0"
        port=settings.PORT,
        reload=settings.DEBUG,   # False in production
    )
```

### Environment Variables for Production

Set these on your deployment platform:

```env
HOST=0.0.0.0
PORT=8001
DEBUG=False

# API Keys (required)
GOOGLE_API_KEY=your-production-key
OPENAI_API_KEY=your-production-key

# Model Configuration
LLM_MODEL=gemini-flash-latest
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=1000

# Embedding (use lightweight model)
EMBEDDING_MODEL=all-MiniLM-L6-v2

# CORS
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-backend.onrender.com

# Paths (must be writable)
VECTOR_INDEX_PATH=/tmp/faiss_index.index
METADATA_PATH=/tmp/metadata.pkl
```

### Example: Render Deployment

**Build Command**:
```bash
pip install -r requirements.txt
```

**Start Command**:
```bash
cd python-services && uvicorn ai_service.main:app --host 0.0.0.0 --port $PORT
```

**Environment Variables** (in Render dashboard):
```
HOST=0.0.0.0
PORT=8001
DEBUG=False
GOOGLE_API_KEY=<your-key>
OPENAI_API_KEY=<your-key>
ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## API Endpoints

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| GET | `/` | Root endpoint |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Send chat message |

### RAG
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/rag/retrieve` | Retrieve relevant documents |
| POST | `/rag/add` | Add documents to index |
| POST | `/rag/rebuild` | Rebuild index |

### Safety
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/safety/check` | Safety check message |
| POST | `/safety/sentiment/analyze` | Analyze sentiment |

### Embeddings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/embeddings/create` | Create embeddings |
| GET | `/embeddings/status` | Embedding status |

### Analytics Report Service (`analytics_service`, default port 8002)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Analytics service health check |
| POST | `/generate-report` | Generate a report from metrics supplied by the backend |

## Chat API Response

```json
{
  "response": "I understand you're feeling overwhelmed...",
  "safetyCheck": {
    "riskScore": 0.15,
    "riskLevel": "low",
    "keywords": ["stress", "anxiety"],
    "flagged": false,
    "alertCounselor": false,
    "recommendations": ["Consider talking to a counselor"]
  },
  "sentiment": {
    "overall": "negative",
    "emotions": [
      {"emotion": "sadness", "confidence": 0.65},
      {"emotion": "fear", "confidence": 0.25}
    ],
    "stressLevel": "moderate"
  },
  "ragContext": {
    "used": true,
    "documents": [...],
    "relevanceScores": [0.89, 0.72]
  },
  "processingTime": 1250,
  "modelUsed": "gpt-4"
}
```

## Safety Service

### Risk Levels
| Level | Score | Action |
|-------|-------|--------|
| low | 0.0-0.3 | Normal processing |
| medium | 0.3-0.6 | Monitor closely |
| high | 0.6-0.8 | Log and flag |
| critical | 0.8-1.0 | Alert counselor immediately |

### Alert Triggers
- Self-harm mentions
- Suicide ideation
- Harmful behavior
- Crisis indicators
- Severe depression signals

### Recommendations
- Professional help suggestions
- Resource recommendations
- Crisis hotline information
- Emergency contacts

## RAG Service

### Features
- FAISS vector index
- Semantic document search
- Relevance scoring (0-1)
- Top-K retrieval
- Context window management

### Usage
```python
# Automatic with chat requests
rag_results = await rag_service.retrieve_context(
    query="help with anxiety",
    top_k=3
)
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HOST` | Server host | 0.0.0.0 |
| `PORT` | AI service port | 8001 |
| `DEBUG` | Debug mode | false |
| `OPENAI_API_KEY` | OpenAI key | - |
| `GOOGLE_GENAI_API_KEY` | Google GenAI key | - |
| `OPENAI_MODEL` | OpenAI model | gpt-4 |
| `GOOGLE_MODEL` | Google model | gemini-pro |
| `ALLOWED_ORIGINS` | CORS origins | * |
| `FAISS_INDEX_PATH` | Index path | data/faiss_index.index |
| `METADATA_PATH` | Metadata path | data/metadata.pkl |

## Dependencies

### Core
- fastapi - Web framework
- uvicorn - ASGI server
- pydantic - Data validation

### LLMs
- langchain - LLM framework
- langchain_google_genai - Google integration
- openai - OpenAI integration
- tiktoken - Tokenization

### Vector Store
- faiss-cpu - FAISS vector store
- sentence-transformers - Embeddings

### NLP
- transformers - HuggingFace models
- torch - PyTorch
- nltk - NLTK

### Utilities
- python-dotenv - Environment config
- httpx - HTTP client
- aiofiles - Async file handling

## Running with Docker

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8001

CMD ["uvicorn", "ai_service.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

```bash
docker build -t mental-health-ai .
docker run -p 8001:8001 mental-health-ai
```

## Deployment

### Environment Variable Configuration

**IMPORTANT**: Before deploying, set these environment variables in your deployment platform:

```env
# Required
PORT=8001                          # Auto-assigned by platform (or use 8001)
HOST=0.0.0.0                      # Keep as 0.0.0.0

# LLM Keys (at least one required)
GOOGLE_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here      # Optional

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# Debug Mode
DEBUG=false
```

### Deploy to Railway

1. **Connect your repository**
   - Push code to GitHub
   - Connect repo to Railway

2. **Set environment variables** in Railway dashboard:
   ```
   GOOGLE_API_KEY=your-key
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-domain.com
   ```

3. **Set start command**:
   ```
   uvicorn ai_service.main:app --host 0.0.0.0 --port $PORT
   ```

4. **Deploy**
   - Railway will auto-detect Python and install dependencies
   - Service will be accessible at `https://your-service.railway.app`

### Deploy to Render

1. **Create new Web Service**
   - Connect GitHub repo
   - Set Root Directory: `python-services`

2. **Build Command**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start Command**:
   ```bash
   uvicorn ai_service.main:app --host 0.0.0.0 --port $PORT
   ```

4. **Environment Variables** (in Render dashboard):
   ```
   GOOGLE_API_KEY=your-key
   ALLOWED_ORIGINS=https://your-app.onrender.com
   DEBUG=false
   ```

### Verify Deployment

```bash
# Health check
curl https://your-service-domain/health

# API Docs
https://your-service-domain/docs
```

## Testing

```bash
# Using Swagger UI
http://localhost:8001/docs

# Using curl
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have been feeling anxious lately",
    "sessionId": "user123",
    "useRAG": true,
    "conversationHistory": []
  }'
```

## Integration with Backend

The FastAPI service integrates with the Express.js backend:

```
Backend (Port 5000)  -->  AI Service (Port 8001)
     |
     v
POST /api/chat
     |
     v
http://localhost:8001/chat
```

Backend analytics report generation can also call the analytics service:

```
Backend (Port 5000)  -->  Analytics Service (Port 8002)
POST /generate-report
```

## Safety Guidelines

1. **Never replace human professionals** - AI is for support, not diagnosis
2. **Crisis intervention** - Always provide hotlines
3. **Data privacy** - Don't log sensitive information
4. **Transparency** - Inform users they're chatting with AI
5. **Limits** - Set clear boundaries on AI capabilities

## License

MIT

## Related Projects

- [Backend API](../backend/README.md)
- [Frontend](../frontend-next/README.md)

