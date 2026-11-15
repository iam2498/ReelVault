"""ReelVault Backend Application Package."""
from pathlib import Path
from dotenv import load_dotenv

# Ensure environment variables are loaded when the app package is imported
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


