#!/bin/bash
# Logo Migration Script - Replace all Kortix branding with CarbonScope

set -e

echo "🎨 Migrating all logos from Kortix → CarbonScope"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd suna-init/apps/frontend

# Step 1: Create CarbonScope computer logos from Kortix ones (if they don't exist)
echo "📦 Creating CarbonScope computer logos..."

if [ -f "public/kortix-computer-black.svg" ] && [ ! -f "public/carbonscope-computer-black.svg" ]; then
    cp public/kortix-computer-black.svg public/carbonscope-computer-black.svg
    echo "  ✓ Created carbonscope-computer-black.svg"
fi

if [ -f "public/kortix-computer-white.svg" ] && [ ! -f "public/carbonscope-computer-white.svg" ]; then
    cp public/kortix-computer-white.svg public/carbonscope-computer-white.svg
    echo "  ✓ Created carbonscope-computer-white.svg"
fi

# Step 2: Remove old Kortix logo files
echo ""
echo "🗑️  Removing old Kortix logo files..."

kortix_files=(
    "public/kortix-brandmark-bg.svg"
    "public/kortix-brandmark-effect-full.svg"
    "public/kortix-brandmark-effect.svg"
    "public/kortix-logomark-white.svg"
    "public/kortix-symbol.svg"
)

for file in "${kortix_files[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "  ✗ Removed $file"
    fi
done

# Step 3: List all remaining logo files
echo ""
echo "📋 Current logo files:"
ls -1 public/ | grep -E "(CarbonScope|carbonscope|Logomark|logomark|symbol|wordmark)" | sed 's/^/  • /'

echo ""
echo "✅ Logo migration complete!"
echo ""
echo "🔍 Verify in browser:"
echo "  1. Config menu (CarbonScope dropdown)"
echo "  2. Agent avatars"
echo "  3. Favicon"
echo "  4. About page logos"
echo ""
