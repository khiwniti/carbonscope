#!/bin/bash

# Script to replace all Kortix branding with CarbonScope/Suna branding
# This script performs a systematic replacement across the frontend codebase

FRONTEND_DIR="/teamspace/studios/this_studio/comprehensive-suna-bim-agent/suna-init/apps/frontend"

echo "=========================================="
echo "Kortix → Suna Branding Replacement"
echo "=========================================="
echo ""

# Step 1: Replace import statements
echo "Step 1: Replacing KortixLogo import statements..."
find "$FRONTEND_DIR/src" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i "s|from '@/components/sidebar/kortix-logo'|from '@/components/sidebar/suna-logo'|g" {} +
find "$FRONTEND_DIR/src" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i "s|from '@/components/sidebar/kortix-logo\"|from '@/components/sidebar/suna-logo\"|g" {} +
find "$FRONTEND_DIR/src" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|from "../sidebar/kortix-logo"|from "../sidebar/suna-logo"|g' {} +

echo "✓ Import statements updated"

# Step 2: Replace component usage
echo "Step 2: Replacing KortixLogo component usage..."
find "$FRONTEND_DIR/src" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|<KortixLogo|<SunaLogo|g' {} +
find "$FRONTEND_DIR/src" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|</KortixLogo>|</SunaLogo>|g' {} +
find "$FRONTEND_DIR/src" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|{ KortixLogo }|{ SunaLogo }|g' {} +
find "$FRONTEND_DIR/src" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|interface KortixLogoProps|interface SunaLogoProps|g' {} +
find "$FRONTEND_DIR/src" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|export function KortixLogo|export function SunaLogo|g' {} +
find "$FRONTEND_DIR/src" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|function KortixLogo|function SunaLogo|g' {} +

echo "✓ Component usage updated"

# Step 3: Replace alt text
echo "Step 3: Updating alt text and accessibility labels..."
find "$FRONTEND_DIR/src" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|alt="Kortix"|alt="Suna"|g' {} +

echo "✓ Alt text updated"

# Step 4: Count remaining references
echo ""
echo "Step 4: Checking for remaining Kortix references..."
REMAINING_COUNT=$(grep -r "Kortix" "$FRONTEND_DIR/src" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" | grep -v "kortix\.com" | grep -v "node_modules" | wc -l)

if [ "$REMAINING_COUNT" -gt 0 ]; then
    echo "⚠ Warning: Found $REMAINING_COUNT remaining Kortix references (excluding kortix.com URLs)"
    echo "  These may be in comments, documentation, or translation files."
    echo ""
    echo "  Files with remaining references:"
    grep -r "Kortix" "$FRONTEND_DIR/src" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" -l | grep -v "node_modules" | head -10
else
    echo "✓ No remaining Kortix references in code files"
fi

echo ""
echo "=========================================="
echo "Branding replacement complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - Import statements updated"
echo "  - Component names updated"
echo "  - Alt text updated"
echo "  - Created new SunaLogo component"
echo ""
echo "Manual review recommended for:"
echo "  - Translation files (*.json)"
echo "  - Documentation files (*.md)"
echo "  - Legal/Terms pages"
echo "  - External URLs (should remain kortix.com)"
