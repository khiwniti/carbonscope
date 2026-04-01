#!/bin/bash
# Bump plugin version using semantic versioning

TYPE="$1"
PLUGIN_JSON=".claude-plugin/plugin.json"

if [ -z "$TYPE" ]; then
  echo "Usage: ./version-bump.sh <major|minor|patch>"
  echo ""
  echo "Examples:"
  echo "  ./version-bump.sh patch  # 0.1.0 -> 0.1.1"
  echo "  ./version-bump.sh minor  # 0.1.0 -> 0.2.0"
  echo "  ./version-bump.sh major  # 0.1.0 -> 1.0.0"
  exit 1
fi

if [ ! -f "$PLUGIN_JSON" ]; then
  echo "Error: $PLUGIN_JSON not found"
  exit 1
fi

# Get current version
CURRENT=$(jq -r '.version' "$PLUGIN_JSON")
echo "Current version: $CURRENT"

# Parse version
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT"
MAJOR="${VERSION_PARTS[0]}"
MINOR="${VERSION_PARTS[1]}"
PATCH="${VERSION_PARTS[2]}"

# Bump version
case "$TYPE" in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  patch)
    PATCH=$((PATCH + 1))
    ;;
  *)
    echo "Error: Invalid type '$TYPE'. Use major, minor, or patch."
    exit 1
    ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
echo "New version: $NEW_VERSION"

# Update plugin.json
jq ".version = \"$NEW_VERSION\"" "$PLUGIN_JSON" > "$PLUGIN_JSON.tmp"
mv "$PLUGIN_JSON.tmp" "$PLUGIN_JSON"
echo "✓ Updated $PLUGIN_JSON"

# Update all skill SKILL.md files
SKILL_COUNT=0
for skill in skills/*/SKILL.md; do
  if [ -f "$skill" ]; then
    sed -i "s/^version: .*/version: $NEW_VERSION/" "$skill"
    ((SKILL_COUNT++))
  fi
done
echo "✓ Updated $SKILL_COUNT skill(s)"

# Git commit and tag
echo ""
echo "Creating git commit and tag..."
git add -A
git commit -m "chore: bump version to $NEW_VERSION"
git tag "v$NEW_VERSION"

echo ""
echo "✅ Version bumped successfully!"
echo ""
echo "Next steps:"
echo "  git push origin main"
echo "  git push origin v$NEW_VERSION"
