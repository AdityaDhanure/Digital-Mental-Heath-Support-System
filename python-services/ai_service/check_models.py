import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Load your .env file
load_dotenv()

from config.settings import settings

api_key = settings.GOOGLE_API_KEY
if not api_key:
    print("❌ Error: GOOGLE_API_KEY not set in environment variables")
    exit(1)

genai.configure(api_key=api_key)

print(f"Checking models for key ending in: ...{api_key[-5:]}")
print("------------------------------------------------")

try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"✅ AVAILABLE: {m.name}")
except Exception as e:
    print(f"❌ Error: {e}")


"""
    Checking models for key ending in: ...nQVbo
------------------------------------------------
✅ AVAILABLE: models/gemini-2.5-flash
✅ AVAILABLE: models/gemini-2.5-pro
✅ AVAILABLE: models/gemini-2.0-flash-exp
✅ AVAILABLE: models/gemini-2.0-flash
✅ AVAILABLE: models/gemini-2.0-flash-001
✅ AVAILABLE: models/gemini-2.0-flash-exp-image-generation
✅ AVAILABLE: models/gemini-2.0-flash-lite-001
✅ AVAILABLE: models/gemini-2.0-flash-lite
✅ AVAILABLE: models/gemini-2.0-flash-lite-preview-02-05
✅ AVAILABLE: models/gemini-2.0-flash-lite-preview
✅ AVAILABLE: models/gemini-exp-1206
✅ AVAILABLE: models/gemini-2.5-flash-preview-tts
✅ AVAILABLE: models/gemini-2.5-pro-preview-tts
✅ AVAILABLE: models/gemma-3-1b-it
✅ AVAILABLE: models/gemma-3-4b-it
✅ AVAILABLE: models/gemma-3-12b-it
✅ AVAILABLE: models/gemma-3-27b-it
✅ AVAILABLE: models/gemma-3n-e4b-it
✅ AVAILABLE: models/gemma-3n-e2b-it
✅ AVAILABLE: models/gemini-flash-latest
✅ AVAILABLE: models/gemini-flash-lite-latest
✅ AVAILABLE: models/gemini-pro-latest
✅ AVAILABLE: models/gemini-2.5-flash-lite
✅ AVAILABLE: models/gemini-2.5-flash-image-preview
✅ AVAILABLE: models/gemini-2.5-flash-image
✅ AVAILABLE: models/gemini-2.5-flash-preview-09-2025
✅ AVAILABLE: models/gemini-2.5-flash-lite-preview-09-2025
✅ AVAILABLE: models/gemini-3-pro-preview
✅ AVAILABLE: models/gemini-3-flash-preview
✅ AVAILABLE: models/gemini-3-pro-image-preview
✅ AVAILABLE: models/nano-banana-pro-preview
✅ AVAILABLE: models/gemini-robotics-er-1.5-preview
✅ AVAILABLE: models/gemini-2.5-computer-use-preview-10-2025
✅ AVAILABLE: models/deep-research-pro-preview-12-2025


"""