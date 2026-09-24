"""
BankWise AI — One-Click Project Launcher
Launches the full interactive Web UI dashboard and REST API, and opens your browser.
"""
import os
import sys
import time
import webbrowser
import subprocess

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print("=" * 65)
    print("  🚀 BANKWISE AI — INTELLIGENT BANK MARKETING PREDICTION")
    print("  🏛️ Darshan University | Computer Engineering Department")
    print("=" * 65)
    print("  🌐 Web Dashboard: http://127.0.0.1:5000")
    print("  🔌 REST API:      http://127.0.0.1:5000/health")
    print("  📊 Analytics:     http://127.0.0.1:5000/api/analytics")
    print("=" * 65)
    print("\n[INFO] Opening web browser in 1.5 seconds...")
    
    # Auto-open web browser
    try:
        time.sleep(1.5)
        webbrowser.open("http://127.0.0.1:5000")
    except Exception:
        pass
        
    print("[INFO] Starting server. Press CTRL+C to stop.\n")
    subprocess.run([sys.executable, os.path.join("backend", "flask_app.py")])
