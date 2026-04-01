#!/bin/bash
# Bulk rebranding script for Markdown documentation files
# Replaces Kortix/SUNA with BKS cBIM AI branding

set -e

echo "🔄 Starting bulk Markdown rebranding..."

cd /teamspace/studios/this_studio/comprehensive-suna-bim-agent

# Count files before
BEFORE_COUNT=$(find . -name "*.md" -type f -exec grep -l -i "kortix\|suna" {} \; | wc -l)
echo "📊 Found $BEFORE_COUNT markdown files with references"

# Replace in all markdown files
echo "📝 Replacing branding in markdown files..."
find . -type f -name "*.md" -exec sed -i \
  -e "s/SUNA BIM/BKS cBIM AI/g" \
  -e "s/SUNA - Kortix AI/BKS - cBIM AI/g" \
  -e "s/Kortix AI/cBIM AI/g" \
  -e "s/Kortix Desktop/BKS cBIM Desktop/g" \
  -e "s/Kortix Team/BKS Team/g" \
  -e "s/Kortix/BKS cBIM AI/g" \
  -e "s/kortix/cbim/g" \
  -e "s/SUNA/BKS/g" \
  -e "s/Suna/BKS/g" \
  -e "s/suna-frontend/bks-cbim-frontend/g" \
  -e "s/suna-bim/bks-cbim-ai/g" \
  -e "s/suna\/backend/backend/g" \
  -e "s/@agentpress/@bks/g" \
  -e "s/support@carbonbim\.com/support@bks-cbim.com/g" \
  -e "s/comprehensive-suna-bim-agent/bks-cbim-ai/g" \
  {} +

# Count files after
AFTER_COUNT=$(find . -name "*.md" -type f -exec grep -l -i "kortix\|suna" {} \; 2>/dev/null | wc -l)
echo "📊 Found $AFTER_COUNT markdown files still with references after replacement"
echo "✅ Updated $((BEFORE_COUNT - AFTER_COUNT)) markdown files"

echo ""
echo "✨ Markdown rebranding complete!"
