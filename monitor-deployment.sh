#!/bin/bash

echo "📊 Deployment Monitor"
echo "===================="
echo ""

# Check if deployment is running
if [ -f /tmp/deploy-pid.txt ]; then
    PID=$(cat /tmp/deploy-pid.txt)
    if ps -p $PID > /dev/null 2>&1; then
        echo "✅ Deployment process running (PID: $PID)"
        echo ""
        echo "📝 Recent logs (last 30 lines):"
        echo "---"
        tail -30 /tmp/deploy-acr.log
        echo ""
        echo "🔄 To monitor continuously: tail -f /tmp/deploy-acr.log"
    else
        echo "✅ Deployment process completed"
        echo ""
        echo "📊 Final status:"
        tail -50 /tmp/deploy-acr.log | grep -E "(✅|❌|Error|Successfully|pushed)"
    fi
else
    echo "❌ No deployment process found"
fi
