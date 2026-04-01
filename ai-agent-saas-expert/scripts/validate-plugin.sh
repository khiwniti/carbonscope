#!/bin/bash
# Validate plugin structure and content

set -e

PLUGIN_DIR="${1:-.}"
ERRORS=0
WARNINGS=0

echo "🔍 Validating plugin at: $PLUGIN_DIR"
echo "================================"
echo ""

# Check .claude-plugin directory
if [ ! -d "$PLUGIN_DIR/.claude-plugin" ]; then
  echo "❌ ERROR: .claude-plugin/ directory not found"
  ((ERRORS++))
else
  echo "✓ .claude-plugin/ directory exists"
fi

# Check plugin.json
if [ ! -f "$PLUGIN_DIR/.claude-plugin/plugin.json" ]; then
  echo "❌ ERROR: plugin.json not found"
  ((ERRORS++))
else
  echo "✓ plugin.json exists"
  
  # Validate JSON syntax
  if jq empty "$PLUGIN_DIR/.claude-plugin/plugin.json" 2>/dev/null; then
    echo "✓ plugin.json is valid JSON"
    
    # Check required fields
    if jq -e '.name' "$PLUGIN_DIR/.claude-plugin/plugin.json" > /dev/null; then
      echo "✓ plugin.json has 'name' field"
    else
      echo "❌ ERROR: plugin.json missing 'name' field"
      ((ERRORS++))
    fi
    
    if jq -e '.version' "$PLUGIN_DIR/.claude-plugin/plugin.json" > /dev/null; then
      VERSION=$(jq -r '.version' "$PLUGIN_DIR/.claude-plugin/plugin.json")
      if [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "✓ plugin.json has valid semantic version: $VERSION"
      else
        echo "⚠️  WARNING: version '$VERSION' is not semantic versioning format"
        ((WARNINGS++))
      fi
    else
      echo "❌ ERROR: plugin.json missing 'version' field"
      ((ERRORS++))
    fi
  else
    echo "❌ ERROR: plugin.json is not valid JSON"
    ((ERRORS++))
  fi
fi

# Check agents directory
AGENT_COUNT=0
if [ -d "$PLUGIN_DIR/agents" ]; then
  AGENT_COUNT=$(find "$PLUGIN_DIR/agents" -name "*.md" -type f | wc -l)
  echo "✓ Found $AGENT_COUNT agent(s)"
  
  # Validate each agent
  for agent in "$PLUGIN_DIR/agents"/*.md; do
    if [ -f "$agent" ]; then
      AGENT_NAME=$(basename "$agent" .md)
      
      # Check frontmatter
      if grep -q "^---$" "$agent"; then
        echo "  ✓ $AGENT_NAME has frontmatter"
        
        # Check required fields
        if grep -q "^name:" "$agent"; then
          echo "    ✓ has 'name' field"
        else
          echo "    ❌ ERROR: missing 'name' field"
          ((ERRORS++))
        fi
        
        if grep -q "^description:" "$agent"; then
          echo "    ✓ has 'description' field"
        else
          echo "    ❌ ERROR: missing 'description' field"
          ((ERRORS++))
        fi
      else
        echo "  ❌ ERROR: $AGENT_NAME missing frontmatter"
        ((ERRORS++))
      fi
    fi
  done
else
  echo "⚠️  WARNING: agents/ directory not found"
  ((WARNINGS++))
fi

# Check skills directory
SKILL_COUNT=0
if [ -d "$PLUGIN_DIR/skills" ]; then
  SKILL_COUNT=$(find "$PLUGIN_DIR/skills" -name "SKILL.md" -type f | wc -l)
  echo "✓ Found $SKILL_COUNT skill(s)"
  
  # Validate each skill
  for skill in "$PLUGIN_DIR/skills"/*/SKILL.md; do
    if [ -f "$skill" ]; then
      SKILL_DIR=$(dirname "$skill")
      SKILL_NAME=$(basename "$SKILL_DIR")
      
      # Check frontmatter
      if grep -q "^---$" "$skill"; then
        echo "  ✓ $SKILL_NAME has frontmatter"
        
        # Check required fields
        if grep -q "^name:" "$skill"; then
          echo "    ✓ has 'name' field"
        else
          echo "    ❌ ERROR: missing 'name' field"
          ((ERRORS++))
        fi
        
        if grep -q "^description:" "$skill"; then
          echo "    ✓ has 'description' field"
        else
          echo "    ❌ ERROR: missing 'description' field"
          ((ERRORS++))
        fi
        
        if grep -q "^version:" "$skill"; then
          echo "    ✓ has 'version' field"
        else
          echo "    ❌ ERROR: missing 'version' field"
          ((ERRORS++))
        fi
      else
        echo "  ❌ ERROR: $SKILL_NAME missing frontmatter"
        ((ERRORS++))
      fi
      
      # Check for supporting directories
      if [ -d "$SKILL_DIR/examples" ]; then
        echo "    ✓ has examples/ directory"
      else
        echo "    ⚠️  WARNING: missing examples/ directory"
        ((WARNINGS++))
      fi
      
      if [ -d "$SKILL_DIR/references" ]; then
        echo "    ✓ has references/ directory"
      else
        echo "    ⚠️  WARNING: missing references/ directory"
        ((WARNINGS++))
      fi
    fi
  done
else
  echo "⚠️  WARNING: skills/ directory not found"
  ((WARNINGS++))
fi

# Check README.md
if [ -f "$PLUGIN_DIR/README.md" ]; then
  echo "✓ README.md exists"
else
  echo "⚠️  WARNING: README.md not found"
  ((WARNINGS++))
fi

# Summary
echo ""
echo "================================"
echo "Validation Summary"
echo "================================"
echo "Agents: $AGENT_COUNT"
echo "Skills: $SKILL_COUNT"
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
  echo "✅ Plugin validation passed!"
  exit 0
else
  echo "❌ Plugin validation failed with $ERRORS error(s)"
  exit 1
fi
