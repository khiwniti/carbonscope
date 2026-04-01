#!/bin/bash
# Clean agent monitor - filters out JSON logs

AGENT=$1
OUTPUT_DIR="/tmp/claude-1000/-teamspace-studios-this-studio-comprehensive-suna-bim-agent/7166f407-b5a4-4420-bf5b-df67cfa675d3/tasks"

case $AGENT in
  2)
    echo "=== WAVE 2: Material Matching (RapidFuzz upgrade) ==="
    tail -f "$OUTPUT_DIR/a3d4b0d1886bc99e4.output" 2>&1 | grep -v '"type":"progress"' | grep -v '"type":"user"' | grep -v '"type":"assistant"'
    ;;
  3)
    echo "=== WAVE 3: Carbon Pipeline (Brightway2 integration) ==="
    tail -f "$OUTPUT_DIR/a162e9462b409f107.output" 2>&1 | grep -v '"type":"progress"' | grep -v '"type":"user"' | grep -v '"type":"assistant"'
    ;;
  4)
    echo "=== WAVE 4: Redis Caching (3-layer strategy) ==="
    tail -f "$OUTPUT_DIR/a16a7eeabe32cd26c.output" 2>&1 | grep -v '"type":"progress"' | grep -v '"type":"user"' | grep -v '"type":"assistant"'
    ;;
  5)
    echo "=== WAVE 5: FastAPI Endpoints (4 REST APIs) ==="
    tail -f "$OUTPUT_DIR/a5edae9f7a5f0390c.output" 2>&1 | grep -v '"type":"progress"' | grep -v '"type":"user"' | grep -v '"type":"assistant"'
    ;;
  *)
    echo "Usage: $0 [2|3|4|5]"
    echo "  2 = Material Matching"
    echo "  3 = Carbon Pipeline"
    echo "  4 = Redis Caching"
    echo "  5 = API Endpoints"
    exit 1
    ;;
esac
