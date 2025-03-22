import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-production'
    TEMP_FOLDER = os.environ.get('TEMP_FOLDER') or 'temp'
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    PDF_RETENTION_TIME = int(os.environ.get('PDF_RETENTION_TIME', 3600))  # 1 heure par défaut
    DEBUG = os.environ.get('FLASK_DEBUG', '0') == '1'