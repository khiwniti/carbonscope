#!/bin/bash
# Find skill in registry by name, tag, or category

QUERY="$1"
REGISTRY="skill-registry.json"

if [ -z "$QUERY" ]; then
  echo "Usage: ./find-skill.sh <skill-name|tag|category>"
  echo ""
  echo "Examples:"
  echo "  ./find-skill.sh database-architecture"
  echo "  ./find-skill.sh security"
  echo "  ./find-skill.sh ai"
  exit 1
fi

if [ ! -f "$REGISTRY" ]; then
  echo "Error: skill-registry.json not found"
  exit 1
fi

echo "Searching for: $QUERY"
echo "================================"
echo ""

# Search by skill name
if jq -e ".skills[\"$QUERY\"]" "$REGISTRY" > /dev/null 2>&1; then
  echo "📦 Skill Found:"
  jq -r ".skills[\"$QUERY\"] | \"
Name: \\(.name)
Version: \\(.version)
Category: \\(.category)
Description: \\(.description)
Plugins: \\(.plugins | join(\", \"))
Tags: \\(.tags | join(\", \"))
Reusable In: \\(.reusableIn | join(\", \"))
Complexity: \\(.complexity)
\"" "$REGISTRY"
  exit 0
fi

# Search by tag
TAG_RESULTS=$(jq -r ".tags[\"$QUERY\"][]?" "$REGISTRY" 2>/dev/null)
if [ -n "$TAG_RESULTS" ]; then
  echo "🏷️  Skills tagged with '$QUERY':"
  echo ""
  for skill in $TAG_RESULTS; do
    jq -r ".skills[\"$skill\"] | \"  • \\(.name) (\\(.category))\"" "$REGISTRY"
  done
  exit 0
fi

# Search by category
CAT_RESULTS=$(jq -r ".categories[\"$QUERY\"].skills[]?" "$REGISTRY" 2>/dev/null)
if [ -n "$CAT_RESULTS" ]; then
  echo "📁 Skills in category '$QUERY':"
  echo ""
  for skill in $CAT_RESULTS; do
    jq -r ".skills[\"$skill\"] | \"  • \\(.name) - \\(.description)\"" "$REGISTRY"
  done
  exit 0
fi

echo "❌ No matches found for: $QUERY"
echo ""
echo "Available categories:"
jq -r '.categories | keys | .[] | "  • " + .' "$REGISTRY"
echo ""
echo "Available tags:"
jq -r '.tags | keys | .[] | "  • " + .' "$REGISTRY"
