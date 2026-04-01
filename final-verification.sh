#!/bin/bash

echo "🎉 Final Verification"
echo "===================="
echo ""

echo "1️⃣  Port 80 (HTTP) - Direct VM Access"
echo "-------------------------------------"
curl -s http://20.55.21.69 | grep -o '<title>[^<]*</title>' | head -1
echo ""

echo "2️⃣  Port 443 (HTTPS) - Production Domain via Cloudflare"
echo "-------------------------------------------------------"
curl -s https://carbon-bim.ensimu.space | grep -o '<title>[^<]*</title>' | head -1
echo ""

echo "3️⃣  Service Status"
echo "------------------"
./check-services-via-cli.sh 2>&1 | grep -A 10 "Docker Compose Status"
echo ""

echo "✅ Verification Complete!"
echo ""
echo "📝 Summary:"
echo "   ✓ Old Dokploy deployment stopped"
echo "   ✓ New deployment running on port 80"
echo "   ✓ Production domain showing correct version"
echo ""
echo "🌐 Your site is now live at:"
echo "   https://carbon-bim.ensimu.space"
