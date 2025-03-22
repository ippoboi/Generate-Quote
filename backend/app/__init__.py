from flask import Flask
from flask_cors import CORS
from config import Config
import os
import time
import threading
import shutil

def cleanup_temp_files(app):
    """Clean up temporary files that are older than the retention time"""
    with app.app_context():
        retention_time = app.config['PDF_RETENTION_TIME']
        temp_folder = app.config['TEMP_FOLDER']
        
        while True:
            if os.path.exists(temp_folder):
                current_time = time.time()
                for filename in os.listdir(temp_folder):
                    file_path = os.path.join(temp_folder, filename)
                    # Check if the file is older than retention time
                    if os.path.isfile(file_path) and current_time - os.path.getmtime(file_path) > retention_time:
                        try:
                            os.remove(file_path)
                        except Exception as e:
                            app.logger.error(f"Failed to delete {file_path}: {str(e)}")
            # Sleep for 15 minutes before next cleanup
            time.sleep(900)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS with configured origins
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Ensure temp directory exists
    os.makedirs(app.config['TEMP_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from app.routes import bp as routes_bp
    app.register_blueprint(routes_bp)
    
    # Start cleanup thread if not in debug mode
    if not app.config['DEBUG']:
        cleanup_thread = threading.Thread(target=cleanup_temp_files, args=(app,))
        cleanup_thread.daemon = True
        cleanup_thread.start()
    
    return app