# Environment Variables Configuration

## All Available Environment Variables

The following environment variables are managed by the `config/settings.py` module and should be set either in the `.env` file (development) or in your deployment platform's environment variables section (production).

### Server Configuration
```env
HOST=0.0.0.0                    # Server host address
PORT=8001                       # Server port (auto-assigned in production)
DEBUG=false                     # Debug mode (false for production)
```

### CORS & Security
```env
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com    # Comma-separated list of allowed origins
```

### LLM Configuration
```env
GOOGLE_API_KEY=your-google-api-key                              # Google Generative AI API key
OPENAI_API_KEY=your-openai-key                                  # OpenAI API key (optional)
DEEPSEEK_API_KEY=your-deepseek-key                              # DeepSeek API key (optional)
HUGGINGFACEHUB_API_TOKEN=your-huggingface-token                # HuggingFace token (optional)

LLM_MODEL=gemini-flash-latest                                  # LLM model to use
LLM_TEMPERATURE=0.7                                            # Model temperature (0.0-1.0)
LLM_MAX_TOKENS=1000                                            # Maximum tokens in response
```

### Embedding Configuration
```env
EMBEDDING_MODEL=all-MiniLM-L6-v2                               # Embedding model name
```

### Vector Store Configuration
```env
VECTOR_INDEX_PATH=./data/faiss_index.index                     # Path to FAISS vector index
METADATA_PATH=./data/metadata.pkl                              # Path to document metadata
```

### Safety & Monitoring
```env
CRISIS_ALERT_THRESHOLD=7.0                                     # Crisis detection threshold (0.0-10.0)
```

---

## Files Using Settings

### ✅ Already Using Settings Module

1. **`main.py`**
   - Uses: `HOST`, `PORT`, `DEBUG`, `ALLOWED_ORIGINS` (via `allowed_origins_list`)

2. **`services/langchain_service.py`**
   - Uses: `GOOGLE_API_KEY`, `LLM_MODEL`, `LLM_TEMPERATURE`, `LLM_MAX_TOKENS`

3. **`services/embedding_service.py`** ✨ UPDATED
   - Uses: `EMBEDDING_MODEL`

4. **`services/rag_service.py`** ✨ UPDATED
   - Uses: `EMBEDDING_MODEL`, `VECTOR_INDEX_PATH`, `METADATA_PATH`

5. **`services/safety_service.py`** ✨ UPDATED
   - Uses: `CRISIS_ALERT_THRESHOLD`

6. **`check_models.py`** ✨ UPDATED
   - Uses: `GOOGLE_API_KEY`

---

## Deployment Instructions

### For Railway/Render/Heroku

Set these environment variables in your platform's dashboard:

```env
HOST=0.0.0.0
PORT=8001
DEBUG=false

ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,https://your-backend-domain.com

GOOGLE_API_KEY=your-actual-api-key
OPENAI_API_KEY=your-openai-key
LLM_MODEL=gemini-flash-latest
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=1000

EMBEDDING_MODEL=all-MiniLM-L6-v2
VECTOR_INDEX_PATH=./data/faiss_index.index
METADATA_PATH=./data/metadata.pkl

CRISIS_ALERT_THRESHOLD=7.0
```

### Important Notes

✅ **Advantages of using settings module:**
- All configuration centralized in one place
- Easy to override via environment variables
- Type-safe (Pydantic validation)
- Proper fallback defaults
- No hardcoded values in service files
- Easy to change configuration without code changes

✅ **Verification in Production:**
- The `.env` file is in `.gitignore` and won't be deployed
- Environment variables from the platform will be used instead
- All services will read from `settings` module
- No hardcoded configuration scattered across files

---

## Example: Testing Settings Locally

```bash
# Create .env file in ai_service directory
cat > .env << 'EOF'
HOST=0.0.0.0
PORT=8001
DEBUG=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
GOOGLE_API_KEY=your-key-here
LLM_MODEL=gemini-flash-latest
EMBEDDING_MODEL=all-MiniLM-L6-v2
CRISIS_ALERT_THRESHOLD=7.0
EOF

# Run the service
python main.py
```

The service will load all configuration from `.env` and print:
```
🚀 Starting server on 0.0.0.0:8001
📚 API Docs: http://0.0.0.0:8001/docs
```

---

**Last Updated:** May 6, 2026
**Status:** ✅ All environment variables properly configured
