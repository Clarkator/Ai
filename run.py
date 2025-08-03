#!/usr/bin/env python3
"""
OpenRouter Python Chat Application
A simple web-based chat interface using Flask and OpenRouter API
"""

import os
import sys
from app import app

def main():
    """Main function to run the Flask application"""
    print("🚀 Starting OpenRouter Python Chat Application...")
    print("📝 Make sure you have your OpenRouter API key ready!")
    print("🌐 The application will be available at: http://localhost:5000")
    print("⚡ Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 Shutting down the application...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error starting the application: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
