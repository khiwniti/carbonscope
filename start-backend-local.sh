#!/bin/bash

echo "Starting backend on http://127.0.0.1:8000"
echo "Health endpoint: http://127.0.0.1:8000/v1/health"
echo "API docs: http://127.0.0.1:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd /teamspace/studios/this_studio/comprehensive-suna-bim-agent/suna-init/backend
python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload
