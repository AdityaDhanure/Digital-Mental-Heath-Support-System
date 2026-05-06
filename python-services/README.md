# Mental Health AI Services

A FastAPI-based AI service providing mental health support through LangChain, RAG (Retrieval-Augmented Generation), sentiment analysis, and safety monitoring. Integrates with the main backend to provide intelligent chat responses for students.

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
│   └── main.py            # Analytics service
│
├── requirements.txt
└── README.md
```

## Installation

### Prerequisites

- Python 3.10+
- OpenAI API key (optional)
- Google GenAI API key (optional)

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
   
   Create `ai_service/.env` file:
   ```env
   # Service Configuration
   HOST=0.0.0.0
   PORT=8000
   DEBUG=true
   
   # API Keys (at least one required)
   OPENAI_API_KEY=your-openai-key
   GOOGLE_GENAI_API_KEY=your-google-key
   
   # Model Configuration
   OPENAI_MODEL=gpt-4
   GOOGLE_MODEL=gemini-pro
   
   # CORS
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
   
   # Data Paths
   FAISS_INDEX_PATH=ai_service/data/faiss_index.index
   METADATA_PATH=ai_service/data/metadata.pkl
   ```

4. **Start the service**
   ```bash
   # Development
   uvicorn ai_service.main:app --reload --port 8000
   
   # Or run directly
   python ai_service/main.py
   ```

5. **Open API documentation**
   Navigate to `http://localhost:8000/docs`

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
| `PORT` | Server port | 8000 |
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
EXPOSE 8000

CMD ["uvicorn", "ai_service.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t mental-health-ai .
docker run -p 8000:8000 mental-health-ai
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
http://localhost:8000/docs

# Using curl
curl -X POST http://localhost:8000/chat \
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
Backend (Port 5000)  -->  AI Service (Port 8000)
     |
     v
POST /api/chat
     |
     v
http://localhost:8000/chat
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
- [Frontend](../frontend/README.md)