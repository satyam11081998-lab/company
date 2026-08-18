"""
Forwarding proxy to consilio-backend/scripts/ingest_decks.py
Allows running `python scripts/ingest_decks.py` directly from the consilio/ frontend directory.
"""
import os
import sys
import subprocess

backend_script = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "consilio-backend", "scripts", "ingest_decks.py"))

if not os.path.exists(backend_script):
    # Try alternate relative path
    backend_script = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "consilio-backend", "scripts", "ingest_decks.py"))

cmd = [sys.executable, backend_script] + sys.argv[1:]
sys.exit(subprocess.call(cmd))
