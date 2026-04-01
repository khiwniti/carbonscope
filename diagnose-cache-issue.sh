#!/bin/bash

echo "🔍 Diagnosing Cache Issue"
echo "=========================="
echo ""

echo "1️⃣  Checking VM Direct Access (Should Show NEW Version)"
echo "--------------------------------------------------------"
curl -sI http://20.55.21.69:3000 2>&1 | head -20
echo ""

echo "2️⃣  Checking Production Domain (Might Show OLD if Cached)"
echo "--------------------------------------------------------"
curl -sI https://carbon-bim.ensimu.space 2>&1 | head -20
echo ""

echo "3️⃣  DNS Resolution Check"
echo "------------------------"
nslookup carbon-bim.ensimu.space 2>&1 || host carbon-bim.ensimu.space 2>&1
echo ""

echo "4️⃣  Cloudflare Cache Status"
echo "---------------------------"
CACHE_STATUS=$(curl -sI https://carbon-bim.ensimu.space 2>&1 | grep -i "cf-cache-status" || echo "Not found")
echo "CF-Cache-Status: $CACHE_STATUS"
echo ""

echo "5️⃣  Title Tag Comparison"
echo "------------------------"
echo "VM Title:"
curl -s http://20.55.21.69:3000 2>&1 | grep -o '<title>[^<]*</title>' | head -1
echo ""
echo "Domain Title:"
curl -s https://carbon-bim.ensimu.space 2>&1 | grep -o '<title>[^<]*</title>' | head -1
echo ""

echo "✅ Diagnosis Complete!"
echo ""
echo "📝 What to do:"
echo "   1. Compare the titles above - are they different?"
echo "   2. Check CF-Cache-Status - if 'HIT', cache is being served"
echo "   3. Go to Cloudflare Dashboard and purge cache"
echo "   4. Or enable Development Mode for immediate bypass"
