#!/bin/bash

echo "Starting frontend on http://localhost:3000"
echo "Backend URL: http://localhost:8000/v1"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd /teamspace/studios/this_studio/comprehensive-suna-bim-agent/suna-init/apps/frontend
npm run dev
