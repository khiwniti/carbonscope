#!/bin/bash
# Bulk rebranding script for TypeScript/JavaScript files
# Replaces Kortix/SUNA with BKS cBIM AI branding

set -e

echo "🔄 Starting bulk TypeScript/JavaScript rebranding..."

cd /teamspace/studios/this_studio/comprehensive-suna-bim-agent/suna/apps/frontend/src

# Count occurrences before
BEFORE_COUNT=$(grep -r -i "kortix\|suna" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" . | wc -l)
echo "📊 Found $BEFORE_COUNT occurrences before replacement"

# User-facing text replacements (titles, descriptions, labels)
echo "📝 Replacing user-facing text..."
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i \
  -e "s/Worker Conversation | Kortix/Worker Conversation | BKS cBIM AI/g" \
  -e "s/API Keys | Kortix/API Keys | BKS cBIM AI/g" \
  -e "s/powered by Kortix/powered by BKS cBIM AI/g" \
  -e "s/Interactive Worker conversation powered by Kortix/Interactive Worker conversation powered by BKS cBIM AI/g" \
  -e "s/Kortix's system prompt/BKS system prompt/g" \
  -e "s/Kortix's tools/BKS tools/g" \
  -e "s/Kortix computer/BKS cBIM Computer/g" \
  -e "s/first used Suna/first used BKS cBIM AI/g" \
  -e "s/SUNA BIM/BKS cBIM AI/g" \
  -e "s/Kortix Team/BKS Team/g" \
  -e "s/from '@\/components\/ui\/kortix-loader'/from '@\/components\/ui\/carbonscope-loader'/g" \
  {} +

# Component and hook names (preserve for now, will handle separately)
# is_kortix_team, is_suna_default - these are API field names, keep for backend compatibility

# Count occurrences after
AFTER_COUNT=$(grep -r -i "kortix\|suna" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" . | wc -l)
echo "📊 Found $AFTER_COUNT occurrences after replacement"
echo "✅ Replaced $((BEFORE_COUNT - AFTER_COUNT)) occurrences"

# Show remaining references (likely technical identifiers)
echo ""
echo "📋 Remaining references (technical identifiers):"
grep -r -i "kortix\|suna" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" . | grep -E "(is_kortix_team|is_suna_default|kortix-loader|kortix-computer|useKortixComputerStore)" | wc -l
echo "   These are technical identifiers (component names, API fields) to be handled separately"

echo ""
echo "✨ TypeScript/JavaScript rebranding complete!"
