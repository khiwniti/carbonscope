#!/bin/bash
set -e

# Cloudflare Cache Purge Script
# This script purges the Cloudflare cache for carbon-bim.ensimu.space

echo "🔥 Cloudflare Cache Purge Script"
echo "================================"
echo ""

# Check if required environment variables are set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ ERROR: CLOUDFLARE_API_TOKEN environment variable not set"
    echo ""
    echo "To get your API token:"
    echo "1. Go to: https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Click 'Create Token'"
    echo "3. Use 'Edit zone DNS' template or create custom token with:"
    echo "   - Permissions: Zone > Cache Purge > Purge"
    echo "   - Zone Resources: Include > Specific zone > ensimu.space"
    echo "4. Copy the token and run:"
    echo "   export CLOUDFLARE_API_TOKEN='your_token_here'"
    echo ""
    exit 1
fi

if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
    echo "⚠️  CLOUDFLARE_ZONE_ID not set, attempting to fetch..."

    # Try to get zone ID automatically
    ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=ensimu.space" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" | \
        grep -Po '"id":"\K[^"]*' | head -1)

    if [ -z "$ZONE_ID" ]; then
        echo "❌ ERROR: Could not fetch zone ID"
        echo "Please set it manually:"
        echo "export CLOUDFLARE_ZONE_ID='your_zone_id'"
        exit 1
    fi

    export CLOUDFLARE_ZONE_ID="$ZONE_ID"
    echo "✅ Found zone ID: $CLOUDFLARE_ZONE_ID"
fi

echo "📍 Target: carbon-bim.ensimu.space"
echo "🆔 Zone ID: $CLOUDFLARE_ZONE_ID"
echo ""

# Purge everything (most aggressive option)
echo "🔄 Purging ALL cache for zone..."
RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data '{"purge_everything":true}')

SUCCESS=$(echo "$RESPONSE" | grep -o '"success":[^,]*' | cut -d':' -f2)

if [ "$SUCCESS" = "true" ]; then
    echo "✅ Cache purged successfully!"
    echo ""
    echo "⏱️  Wait 30-60 seconds for propagation"
    echo "🔄 Then hard refresh your browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
    echo ""
    echo "🌐 Test URLs:"
    echo "   https://carbon-bim.ensimu.space (should show new version after 30s)"
    echo "   http://20.55.21.69:3000 (already showing correct version)"
else
    echo "❌ Cache purge failed!"
    echo ""
    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo "💡 Alternative: Purge via Dashboard"
    echo "   1. Go to: https://dash.cloudflare.com"
    echo "   2. Select domain: ensimu.space"
    echo "   3. Caching > Configuration > Purge Everything"
    exit 1
fi
