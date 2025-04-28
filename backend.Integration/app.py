# app.py
import threading
import subprocess
import sys
from datetime import datetime
import time

def run_webrtc():
    try:
        # Run webrtc.py as a subprocess
        process = subprocess.Popen(['python', 'webrtc.py'],
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        universal_newlines=True)
        print(f"[{datetime.now()}] WebRTC service started")
        
        # Monitor the process
        while True:
            if process.poll() is not None:
                print(f"[{datetime.now()}] WebRTC service stopped with return code: {process.returncode}")
                break
            time.sleep(1)
            
    except Exception as e:
        print(f"[{datetime.now()}] Error starting WebRTC service: {e}")

def run_schedule_fetcher():
    try:
        # Run schedule_fetcher.py as a subprocess
        process = subprocess.Popen(['python', 'schedule_fetcher.py'],
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        universal_newlines=True)
        print(f"[{datetime.now()}] Schedule fetcher service started")
        
        # Monitor the process
        while True:
            if process.poll() is not None:
                print(f"[{datetime.now()}] Schedule fetcher service stopped with return code: {process.returncode}")
                break
            time.sleep(1)
            
    except Exception as e:
        print(f"[{datetime.now()}] Error starting Schedule fetcher service: {e}")

if __name__ == '__main__':
    try:
        print(f"[{datetime.now()}] Starting services...")
        
        # Start both services in separate threads
        webrtc_thread = threading.Thread(target=run_webrtc)
        schedule_thread = threading.Thread(target=run_schedule_fetcher)
        
        webrtc_thread.start()
        schedule_thread.start()
        
        print(f"[{datetime.now()}] Both services started. Press Ctrl+C to stop.")
        
        # Keep the main thread alive
        webrtc_thread.join()
        schedule_thread.join()
        
    except KeyboardInterrupt:
        print(f"\n[{datetime.now()}] Shutting down services...")
        sys.exit(0)
    except Exception as e:
        print(f"[{datetime.now()}] Error in main process: {e}")
        sys.exit(1)
