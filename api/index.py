import os
import sys

# Ensure project root is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Import the configured Flask WSGI app instance
from backend.flask_app import app

# Expose app for Vercel Serverless
if __name__ == "__main__":
    app.run()
