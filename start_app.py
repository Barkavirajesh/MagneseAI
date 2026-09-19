import subprocess
import sys
import time
import os

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dir = os.path.join(base_dir, "frontend")

    print("==========================================================")
    print(" Starting AI Manganese Reserve Detection Application")
    print("==========================================================")

    # 1. Start FastAPI Backend
    print("\n[1/2] Starting FastAPI Backend on http://localhost:8000...")
    backend_proc = subprocess.Popen(
        [sys.executable, "run.py"],
        cwd=backend_dir
    )

    time.sleep(2)

    # 2. Start Vite Frontend
    print("[2/2] Starting React Vite Frontend on http://localhost:5173...")
    frontend_proc = subprocess.Popen(
        "npm run dev",
        shell=True,
        cwd=frontend_dir
    )

    print("\n Both servers launched!")
    print(" Frontend Dashboard: http://localhost:5173")
    print(" FastAPI Swagger Docs: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop both servers.")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping processes...")
        backend_proc.terminate()
        frontend_proc.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
