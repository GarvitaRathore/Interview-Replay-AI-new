from google import genai
from decouple import Config,RepositoryEnv
from pathlib import Path
BASE_DIR=Path(__file__).resolve().parent
config=Config(RepositoryEnv(BASE_DIR/".env"))
client=genai.Client(api_key=config("GEMINI_API_KEY"))
for model in client.models.list():
    print(model.name)