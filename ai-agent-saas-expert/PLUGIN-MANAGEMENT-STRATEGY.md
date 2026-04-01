# Plugin Management Strategy for Skill Plugins

Strategic framework for organizing, versioning, and scaling Claude Code plugin ecosystems.

## Architecture Patterns

### 1. Monorepo Strategy (Recommended for Teams)

**Structure:**
```
claude-plugins/
├── .git/
├── plugins/
│   ├── ai-agent-saas-expert/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   ├── agents/
│   │   ├── skills/
│   │   └── README.md
│   ├── devops-toolkit/
│   │   ├── .claude-plugin/
│   │   ├── agents/
│   │   └── skills/
│   └── security-audit/
├── shared-skills/
│   ├── common-patterns/
│   ├── best-practices/
│   └── templates/
├── scripts/
│   ├── validate-all.sh
│   ├── sync-skills.sh
│   └── publish.sh
└── README.md
```

**Benefits:**
- Centralized version control
- Easy cross-plugin skill sharing
- Unified CI/CD pipeline
- Single source of truth for documentation
- Atomic commits across multiple plugins

**Workflow:**
```bash
# Validate all plugins
./scripts/validate-all.sh

# Sync shared skills to all plugins
./scripts/sync-skills.sh common-patterns

# Publish all updated plugins
./scripts/publish.sh --version patch
```

### 2. Multi-Repo Strategy (Recommended for OSS)

**Structure:**
```
github.com/org/
├── claude-plugin-ai-saas/
│   └── .claude-plugin/
├── claude-plugin-devops/
│   └── .claude-plugin/
└── claude-plugin-security/
    └── .claude-plugin/
```

**Benefits:**
- Independent versioning per plugin
- Isolated permissions and access control
- Easier community contributions
- Simpler plugin-specific CI/CD
- Clear ownership boundaries

**Coordination:**
```bash
# Use git submodules for shared resources
git submodule add https://github.com/org/claude-skill-commons

# Or npm packages for skill libraries
npm install @org/claude-skills-common
```

## Skill Organization Strategies

### Skill Catalog System

**Create a centralized skill registry:**

```typescript
// skill-registry.json
{
  "skills": {
    "ai-agent-saas-patterns": {
      "id": "ai-agent-saas-patterns",
      "version": "0.1.0",
      "plugins": ["ai-agent-saas-expert"],
      "category": "architecture",
      "tags": ["ai", "saas", "monorepo", "nextjs"],
      "dependencies": [],
      "reusableIn": ["web-app-builder", "fullstack-starter"]
    },
    "database-architecture": {
      "id": "database-architecture",
      "version": "0.1.0",
      "plugins": ["ai-agent-saas-expert", "backend-toolkit"],
      "category": "database",
      "tags": ["postgresql", "neo4j", "redis"],
      "dependencies": [],
      "reusableIn": ["any"]
    },
    "security-checklist": {
      "id": "security-checklist",
      "version": "0.1.0",
      "plugins": ["ai-agent-saas-expert", "security-audit"],
      "category": "security",
      "tags": ["auth", "api-security", "gdpr"],
      "dependencies": [],
      "reusableIn": ["any"]
    }
  }
}
```

**Skill Discovery Script:**

```bash
#!/bin/bash
# scripts/find-skill.sh

SKILL_NAME="$1"
REGISTRY="skill-registry.json"

if [ -z "$SKILL_NAME" ]; then
  echo "Usage: ./find-skill.sh <skill-name>"
  exit 1
fi

# Find skill in registry
jq -r ".skills[\"$SKILL_NAME\"] | \"Plugin: \\(.plugins | join(\", \"))\\nCategory: \\(.category)\\nTags: \\(.tags | join(\", \"))\"" "$REGISTRY"
```

### Skill Reusability Matrix

**Design skills with composability:**

```yaml
# Skill levels
L1_Core_Skills:
  description: "Universal patterns applicable to any project"
  examples:
    - git-workflow
    - code-review-checklist
    - testing-strategies
  reusability: 100%

L2_Domain_Skills:
  description: "Domain-specific patterns (web, mobile, backend)"
  examples:
    - nextjs-app-router-guide
    - database-architecture
    - api-design-patterns
  reusability: 70-90%

L3_Framework_Skills:
  description: "Framework-specific implementations"
  examples:
    - nextjs-15-specific
    - react-19-patterns
    - prisma-optimization
  reusability: 30-50%

L4_Project_Skills:
  description: "Project-specific patterns"
  examples:
    - company-coding-standards
    - internal-api-patterns
    - custom-architecture
  reusability: 0-20%
```

## Version Control Workflows

### Semantic Versioning for Plugins

**Version format:** `MAJOR.MINOR.PATCH`

```json
{
  "version": "1.2.3",
  "changelog": {
    "1.2.3": {
      "date": "2024-03-28",
      "changes": [
        "Fix: YAML formatting in nextjs-routing-optimizer",
        "Add: security-checklist skill"
      ]
    },
    "1.2.0": {
      "date": "2024-03-20",
      "changes": [
        "Add: sandbox-integration-validator agent",
        "Update: LLM integration patterns for AI SDK v6"
      ]
    }
  }
}
```

**Automated versioning:**

```bash
#!/bin/bash
# scripts/version-bump.sh

TYPE="$1" # major, minor, patch

if [ -z "$TYPE" ]; then
  echo "Usage: ./version-bump.sh <major|minor|patch>"
  exit 1
fi

# Update version in plugin.json
jq ".version = (.version | split(\".\") | if \"$TYPE\" == \"major\" then [(.[0]|tonumber+1|tostring), \"0\", \"0\"] elif \"$TYPE\" == \"minor\" then [.[0], (.[1]|tonumber+1|tostring), \"0\"] else [.[0], .[1], (.[2]|tonumber+1|tostring)] end | join(\".\"))" .claude-plugin/plugin.json > .claude-plugin/plugin.json.tmp
mv .claude-plugin/plugin.json.tmp .claude-plugin/plugin.json

# Update version in all skill SKILL.md files
NEW_VERSION=$(jq -r .version .claude-plugin/plugin.json)
find skills -name "SKILL.md" -exec sed -i "s/^version: .*/version: $NEW_VERSION/" {} \;

# Git commit and tag
git add -A
git commit -m "chore: bump version to $NEW_VERSION"
git tag "v$NEW_VERSION"
```

### Branching Strategy

**GitFlow for plugin development:**

```
main (production-ready)
├── develop (integration branch)
│   ├── feature/new-security-agent
│   ├── feature/llm-patterns-update
│   └── feature/sandbox-health-checks
├── hotfix/critical-yaml-fix
└── release/v1.3.0
```

**Branch naming conventions:**
- `feature/<skill-or-agent-name>` - New features
- `fix/<issue-description>` - Bug fixes
- `docs/<documentation-update>` - Documentation only
- `refactor/<component-name>` - Code refactoring
- `release/<version>` - Release preparation

### Commit Message Standards

**Conventional Commits format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New skill or agent
- `fix`: Bug fix in skill or agent
- `docs`: Documentation update
- `refactor`: Code restructuring
- `test`: Test additions or changes
- `chore`: Maintenance tasks

**Examples:**
```
feat(skills): add deployment-strategies skill

- Add Vercel deployment patterns
- Add Docker containerization guide
- Add Railway deployment examples

feat(agents): add performance-tuning agent

Analyzes Core Web Vitals, database performance, and caching strategies.
Provides actionable optimization recommendations.

fix(agents): correct YAML formatting in nextjs-routing-optimizer

Description field was split across multiple lines, breaking YAML parsing.
Consolidated to single-line format per Claude Code agent standards.
```

## Cross-Plugin Skill Sharing

### Shared Skill Library Pattern

**Create a shared skill library:**

```
shared-skills/
├── core/
│   ├── git-workflow/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   └── examples/
│   └── testing-patterns/
├── web/
│   ├── nextjs-patterns/
│   └── react-best-practices/
└── backend/
    ├── api-design/
    └── database-patterns/
```

**Skill import mechanism:**

```bash
#!/bin/bash
# scripts/import-skill.sh

SKILL_PATH="$1"
TARGET_PLUGIN="$2"

if [ -z "$SKILL_PATH" ] || [ -z "$TARGET_PLUGIN" ]; then
  echo "Usage: ./import-skill.sh <shared-skill-path> <target-plugin>"
  exit 1
fi

# Copy skill to plugin
cp -r "shared-skills/$SKILL_PATH" "plugins/$TARGET_PLUGIN/skills/"

# Update plugin.json to reference new skill
echo "Skill imported successfully"
```

### Skill Templates

**Standardized skill template:**

```markdown
---
name: Skill Name
description: This skill should be used when the user asks about "trigger phrase 1", "trigger phrase 2", "trigger phrase 3". Brief description of what the skill provides.
version: 0.1.0
---

# Skill Name

Brief overview of the skill's purpose.

## Core Patterns

### Pattern 1: Pattern Name

**Purpose:** What this pattern solves

**Implementation:**
```[language]
// Code example
```

**When to Use:**
- Use case 1
- Use case 2

### Pattern 2: Pattern Name

[Same structure]

## Additional Resources

### Reference Files

- **\`references/detailed-guide.md\`** - Comprehensive documentation
- **\`references/advanced-patterns.md\`** - Advanced use cases

### Example Files

- **\`examples/working-example.ext\`** - Complete working example

## Key Principles

1. Principle 1
2. Principle 2

## When to Use This Skill

Use when [specific scenarios].
```

## Plugin Discovery and Installation

### Plugin Registry

**Create a plugin marketplace index:**

```json
{
  "registry": {
    "ai-agent-saas-expert": {
      "name": "AI Agent SaaS Expert",
      "version": "0.1.0",
      "description": "Professional AI agent team for AI chat SaaS applications",
      "author": "khiwniti",
      "repository": "https://github.com/khiwniti/claude-plugin",
      "keywords": ["ai", "saas", "nextjs", "llm", "sandbox"],
      "agents": 8,
      "skills": 8,
      "category": "web-development",
      "license": "MIT",
      "installUrl": "https://github.com/khiwniti/claude-plugin.git"
    }
  }
}
```

### Quick Installation Guide

**For users:**

```bash
# Install from GitHub
cc plugin install https://github.com/khiwniti/claude-plugin.git

# Or clone manually
git clone https://github.com/khiwniti/claude-plugin.git
cd claude-plugin
cc --plugin-dir ai-agent-saas-expert

# For development (link local)
cd /path/to/plugin
cc plugin link
```

## Maintenance Strategies

### Automated Validation

**CI/CD pipeline with validation:**

```yaml
# .github/workflows/validate.yml
name: Validate Plugin

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Validate plugin structure
        run: |
          # Check plugin.json exists and is valid JSON
          jq empty .claude-plugin/plugin.json

      - name: Validate agent frontmatter
        run: |
          for agent in agents/*.md; do
            # Check YAML frontmatter is valid
            sed -n '/^---$/,/^---$/p' "$agent" | yq eval - > /dev/null
          done

      - name: Validate skill frontmatter
        run: |
          for skill in skills/*/SKILL.md; do
            sed -n '/^---$/,/^---$/p' "$skill" | yq eval - > /dev/null
          done

      - name: Check for secrets
        run: |
          git secrets --scan || echo "No secrets found"
```

### Update Checklist

**Monthly maintenance tasks:**

```markdown
# Plugin Maintenance Checklist

## Monthly (First Monday)
- [ ] Review and update skill examples for framework updates
- [ ] Check for deprecated APIs in code examples
- [ ] Update model references (e.g., gpt-4o → gpt-5.4)
- [ ] Review skill trigger descriptions for clarity
- [ ] Update dependencies in examples

## Quarterly (Every 3 months)
- [ ] Comprehensive skill content review
- [ ] Update reference documentation
- [ ] Review and prune outdated examples
- [ ] Performance audit of agent activation times
- [ ] User feedback integration

## Annually
- [ ] Major version bump for breaking changes
- [ ] Complete documentation overhaul
- [ ] Skill reorganization based on usage patterns
- [ ] Competitive analysis of similar plugins
```

### Deprecation Strategy

**Graceful deprecation of outdated skills:**

```markdown
---
name: Legacy Skill Name
description: [DEPRECATED] Use new-skill-name instead. This skill will be removed in v2.0.0.
version: 0.1.0
deprecated: true
replacedBy: "new-skill-name"
---

# ⚠️ DEPRECATED: Legacy Skill Name

**This skill is deprecated and will be removed in version 2.0.0.**

**Migration Guide:**
- Use `new-skill-name` instead
- See migration instructions at [link]
- Differences: [list key changes]

[Original content preserved for backward compatibility]
```

## Performance Optimization

### Skill Loading Strategies

**Lazy loading for large plugins:**

```json
{
  "loadStrategy": {
    "core": ["ai-agent-saas-patterns", "security-checklist"],
    "onDemand": ["sandbox-integration-guide", "deployment-strategies"],
    "priority": {
      "high": ["nextjs-app-router-guide", "llm-integration-patterns"],
      "medium": ["database-architecture", "production-checklist"],
      "low": ["sandbox-integration-guide"]
    }
  }
}
```

### Skill Size Guidelines

**Keep skills focused and manageable:**

```yaml
Skill_Size_Guidelines:
  SKILL.md_Body:
    target: "1,500-2,000 words"
    maximum: "3,000 words"
    rationale: "Progressive disclosure - detailed content in references/"

  References_Files:
    target: "2,000-5,000 words per file"
    maximum: "10,000 words"
    rationale: "Load only when needed for deep dives"

  Examples:
    target: "Complete, runnable code under 200 lines"
    maximum: "500 lines"
    rationale: "Focused, single-purpose demonstrations"
```

## Documentation Standards

### Plugin Documentation Structure

**Standardized README template:**

```markdown
# Plugin Name

Brief description

## 🎯 What This Plugin Does

[Key capabilities]

## 🚀 Quick Start

### Installation
[Installation steps]

### Usage
[Usage examples]

## 🤖 Agents (N total)

### 1. Agent Name
[Description]

**When to use:**
[Scenarios]

## 📚 Skills (N total)

### 1. Skill Name
[Description]

## ⚙️ Configuration

[Optional configuration]

## 📖 Documentation

[Links to detailed docs]

## 🤝 Contributing

[Contribution guidelines]

## 📄 License

[License info]
```

## Strategic Recommendations

### For Individual Developers

1. **Start with monorepo** for personal plugins
2. **Create skill templates** for consistent quality
3. **Version control everything** with semantic versioning
4. **Document as you build** - README first approach
5. **Validate before commit** with automated checks

### For Teams

1. **Centralized plugin registry** for discovery
2. **Shared skill library** for cross-team reuse
3. **Code review process** for skill quality
4. **Automated CI/CD** for validation and publishing
5. **Regular maintenance schedule** for updates

### For Open Source Projects

1. **Multi-repo strategy** for independent versioning
2. **Contribution guidelines** for community PRs
3. **Issue templates** for bug reports and features
4. **Changelog maintenance** for transparency
5. **Community feedback loop** for improvements

## Next Steps

**Immediate Actions:**
1. Set up version control with semantic versioning
2. Create skill-registry.json for discovery
3. Write validation scripts for CI/CD
4. Document plugin usage with examples
5. Establish maintenance schedule

**Long-term Goals:**
1. Build skill marketplace/catalog
2. Create skill composition framework
3. Implement skill analytics (usage tracking)
4. Develop plugin migration tools
5. Foster plugin community ecosystem
