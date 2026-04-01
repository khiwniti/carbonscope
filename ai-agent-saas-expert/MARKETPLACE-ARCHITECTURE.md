# Claude Marketplace Architecture

Hierarchical ecosystem for managing plugins, skills, and tools independently.

## Architecture Overview

```
Claude Ecosystem Marketplace
├── Plugins (Level 1)
│   ├── ai-agent-saas-expert
│   ├── devops-toolkit
│   └── security-audit
├── Skills (Level 2)
│   ├── Bundled (distributed with plugins)
│   └── Standalone (independent, reusable)
└── Tools (Level 3)
    ├── Scripts & Utilities
    ├── Validation Tools
    └── Development Helpers
```

## Hierarchy Levels

### Level 1: Plugins (Collections)

**Purpose:** Complete expert systems with agents, skills, and tools

**Structure:**
```
plugin-name/
├── .claude-plugin/
│   └── plugin.json
├── agents/
├── skills/ (bundled with plugin)
├── tools/ (plugin-specific utilities)
└── README.md
```

**Use When:**
- Need complete domain expertise (agents + skills + tools)
- Require coordinated agent orchestration
- Building comprehensive solutions

**Example:** `ai-agent-saas-expert` plugin
- 8 specialized agents
- 8 domain skills
- Validation + versioning tools

### Level 2: Skills (Patterns)

**Purpose:** Standalone knowledge patterns, reusable across contexts

**Types:**

**A. Bundled Skills** (distributed with plugins):
```
plugin-name/skills/skill-name/
├── SKILL.md
├── references/
└── examples/
```

**B. Standalone Skills** (marketplace-level):
```
marketplace/skills/skill-name/
├── SKILL.md
├── references/
├── examples/
└── metadata.json
```

**metadata.json:**
```json
{
  "id": "skill-name",
  "name": "Skill Display Name",
  "version": "0.1.0",
  "type": "standalone",
  "category": "category-name",
  "tags": ["tag1", "tag2"],
  "dependencies": [],
  "compatibleWith": ["plugin1", "plugin2"],
  "license": "MIT",
  "repository": "https://github.com/org/skill-name"
}
```

**Use When:**
- Need specific pattern without full plugin
- Want to compose custom plugin from skills
- Sharing knowledge across multiple plugins

**Examples:**
- `git-workflow` skill (universal)
- `nextjs-routing` skill (framework-specific)
- `security-checklist` skill (domain-specific)

### Level 3: Tools (Utilities)

**Purpose:** Executable utilities, scripts, validators

**Structure:**
```
marketplace/tools/tool-name/
├── tool.sh or tool.py
├── README.md
└── metadata.json
```

**metadata.json:**
```json
{
  "id": "tool-name",
  "name": "Tool Display Name",
  "version": "0.1.0",
  "type": "script",
  "executable": "tool.sh",
  "dependencies": ["bash", "jq"],
  "category": "validation",
  "tags": ["quality", "automation"],
  "license": "MIT"
}
```

**Use When:**
- Need automation without full plugin
- Building custom workflows
- Validating or transforming content

**Examples:**
- `plugin-validator` tool
- `skill-generator` tool
- `version-bumper` tool

## Marketplace Registry

### Unified Registry Structure

```json
{
  "marketplace": {
    "version": "1.0.0",
    "lastUpdated": "2024-03-28",
    "plugins": {
      "ai-agent-saas-expert": {
        "type": "plugin",
        "version": "0.1.0",
        "agents": 8,
        "skills": 8,
        "tools": 3,
        "installUrl": "https://github.com/khiwniti/claude-plugin.git",
        "bundledSkills": [
          "ai-agent-saas-patterns",
          "database-architecture",
          "deployment-strategies",
          "llm-integration-patterns",
          "nextjs-app-router-guide",
          "production-checklist",
          "sandbox-integration-guide",
          "security-checklist"
        ],
        "bundledTools": [
          "validate-plugin",
          "find-skill",
          "version-bump"
        ]
      }
    },
    "skills": {
      "standalone": {
        "git-workflow": {
          "type": "skill",
          "version": "1.0.0",
          "category": "version-control",
          "compatibleWith": ["any"],
          "installUrl": "https://github.com/org/claude-skill-git-workflow"
        },
        "react-patterns": {
          "type": "skill",
          "version": "1.2.0",
          "category": "framework",
          "compatibleWith": ["any-react-project"],
          "installUrl": "https://github.com/org/claude-skill-react-patterns"
        }
      },
      "bundled": {
        "ai-agent-saas-patterns": {
          "type": "skill",
          "version": "0.1.0",
          "bundledIn": ["ai-agent-saas-expert"],
          "canInstallStandalone": true
        }
      }
    },
    "tools": {
      "plugin-validator": {
        "type": "tool",
        "version": "1.0.0",
        "category": "validation",
        "executable": "validate-plugin.sh",
        "dependencies": ["bash", "python3"],
        "installUrl": "https://github.com/org/claude-tool-validator"
      },
      "skill-generator": {
        "type": "tool",
        "version": "0.5.0",
        "category": "development",
        "executable": "generate-skill.sh",
        "dependencies": ["bash"],
        "installUrl": "https://github.com/org/claude-tool-skill-gen"
      }
    }
  },
  "categories": {
    "plugins": ["web-development", "devops", "security", "ai"],
    "skills": ["architecture", "database", "framework", "security", "ai"],
    "tools": ["validation", "development", "automation"]
  },
  "dependencies": {
    "ai-agent-saas-expert": {
      "requiredSkills": [],
      "optionalSkills": ["git-workflow", "react-patterns"],
      "requiredTools": []
    }
  }
}
```

## Installation Commands

### Plugin Installation

**Install complete plugin:**
```bash
# Install from marketplace
claude install plugin ai-agent-saas-expert

# Install from GitHub URL
claude install plugin https://github.com/khiwniti/claude-plugin.git

# Install specific version
claude install plugin ai-agent-saas-expert@0.1.0
```

### Standalone Skill Installation

**Install individual skill:**
```bash
# Install from marketplace
claude install skill security-checklist

# Install from GitHub URL
claude install skill https://github.com/org/claude-skill-security-checklist

# Install to specific location
claude install skill security-checklist --to ~/.claude/skills/

# Extract bundled skill from plugin
claude extract skill ai-agent-saas-expert:database-architecture
```

### Tool Installation

**Install utility tool:**
```bash
# Install from marketplace
claude install tool plugin-validator

# Install from GitHub URL
claude install tool https://github.com/org/claude-tool-validator

# Install to custom location
claude install tool plugin-validator --to ~/.claude/tools/

# Make globally accessible
claude install tool plugin-validator --global
```

## Discovery Commands

### Search Marketplace

**Search all levels:**
```bash
# Search everything
claude search "nextjs"

# Search plugins only
claude search plugin "ai agent"

# Search skills only
claude search skill "security"

# Search tools only
claude search tool "validation"
```

**Filter by category:**
```bash
# Find all AI-related items
claude list --category ai

# Find all validation tools
claude list tools --category validation

# Find all standalone skills
claude list skills --type standalone
```

**Filter by tags:**
```bash
# Find items tagged with "security"
claude search --tag security

# Find items tagged with multiple tags
claude search --tag "security,auth,api"
```

## Composition Workflows

### Custom Plugin from Skills

**Compose custom plugin from standalone skills:**

```bash
# Create new plugin
claude create plugin my-custom-plugin

# Add standalone skills
claude add skill my-custom-plugin git-workflow
claude add skill my-custom-plugin react-patterns
claude add skill my-custom-plugin security-checklist

# Add tools
claude add tool my-custom-plugin plugin-validator

# Generate plugin structure
claude build plugin my-custom-plugin
```

**Resulting structure:**
```
my-custom-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── git-workflow/ (copied from marketplace)
│   ├── react-patterns/ (copied from marketplace)
│   └── security-checklist/ (copied from marketplace)
└── tools/
    └── plugin-validator/ (copied from marketplace)
```

### Skill Extraction

**Extract bundled skill to standalone:**

```bash
# Extract skill from plugin
claude extract skill ai-agent-saas-expert:database-architecture \
  --to ~/.claude/skills/database-architecture

# Publish as standalone
cd ~/.claude/skills/database-architecture
claude publish skill database-architecture
```

## Dependency Management

### Skill Dependencies

**Define skill dependencies:**

```yaml
# skills/advanced-nextjs/metadata.json
{
  "id": "advanced-nextjs",
  "dependencies": {
    "skills": ["nextjs-routing", "react-patterns"],
    "minVersion": {
      "nextjs-routing": "1.0.0",
      "react-patterns": "1.2.0"
    }
  }
}
```

**Auto-install dependencies:**
```bash
# Install skill with dependencies
claude install skill advanced-nextjs --with-deps

# Check dependency tree
claude deps skill advanced-nextjs
```

### Tool Dependencies

**Define tool dependencies:**

```json
{
  "id": "advanced-validator",
  "dependencies": {
    "tools": ["plugin-validator", "skill-analyzer"],
    "system": ["bash", "python3", "jq"]
  }
}
```

**Verify dependencies:**
```bash
# Check if tool dependencies are met
claude check tool advanced-validator

# Install missing dependencies
claude install deps advanced-validator
```

## Publishing Workflows

### Publish Plugin

```bash
# Initialize plugin for publishing
claude init plugin my-plugin

# Validate structure
claude validate plugin my-plugin

# Publish to marketplace
claude publish plugin my-plugin --version 1.0.0 --public
```

### Publish Standalone Skill

```bash
# Initialize skill
claude init skill my-skill

# Validate structure
claude validate skill my-skill

# Publish to marketplace
claude publish skill my-skill --version 1.0.0 --public

# Update metadata
claude update skill my-skill --category "security" --tags "auth,api"
```

### Publish Tool

```bash
# Initialize tool
claude init tool my-tool

# Add executable
chmod +x my-tool.sh

# Validate
claude validate tool my-tool

# Publish
claude publish tool my-tool --version 1.0.0 --public
```

## Versioning Strategy

### Semantic Versioning for Each Level

**Plugin versioning:**
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes in agents or bundled skills
- Minor: New agents or skills added
- Patch: Bug fixes, documentation updates

**Skill versioning:**
- `MAJOR.MINOR.PATCH`
- Major: Breaking API changes, removed sections
- Minor: New patterns, expanded content
- Patch: Typo fixes, example updates

**Tool versioning:**
- `MAJOR.MINOR.PATCH`
- Major: CLI interface changes
- Minor: New features or flags
- Patch: Bug fixes

### Compatibility Matrix

```json
{
  "compatibility": {
    "ai-agent-saas-expert@0.1.0": {
      "claude-code": ">=1.0.0",
      "skills": {
        "database-architecture": "0.1.x",
        "security-checklist": "0.1.x"
      },
      "tools": {
        "plugin-validator": ">=1.0.0"
      }
    }
  }
}
```

## Migration Paths

### From Bundled to Standalone

**Extract skill from plugin for standalone use:**

1. **Extract:**
   ```bash
   claude extract skill ai-agent-saas-expert:security-checklist \
     --to ~/claude-skills/security-checklist
   ```

2. **Add metadata:**
   ```json
   {
     "id": "security-checklist",
     "type": "standalone",
     "formerlyBundledIn": "ai-agent-saas-expert@0.1.0",
     "compatibleWith": ["any"]
   }
   ```

3. **Publish:**
   ```bash
   claude publish skill security-checklist --standalone
   ```

### From Standalone to Plugin

**Bundle standalone skills into new plugin:**

1. **Create plugin:**
   ```bash
   claude create plugin my-security-toolkit
   ```

2. **Add skills:**
   ```bash
   claude add skill my-security-toolkit security-checklist
   claude add skill my-security-toolkit auth-patterns
   claude add skill my-security-toolkit api-security
   ```

3. **Build and publish:**
   ```bash
   claude build plugin my-security-toolkit
   claude publish plugin my-security-toolkit
   ```

## Marketplace CLI

### Installation

```bash
# Install Claude Marketplace CLI
npm install -g @claude/marketplace-cli

# Or with Homebrew
brew install claude-marketplace

# Verify installation
claude --version
```

### Configuration

```bash
# Login to marketplace
claude login

# Set default registry
claude config set registry https://marketplace.claude.ai

# Configure local cache
claude config set cache-dir ~/.claude/cache
```

### Common Commands

```bash
# Search
claude search "keyword"
claude search skill "pattern"
claude search tool "validator"

# Install
claude install plugin <name>
claude install skill <name>
claude install tool <name>

# List installed
claude list installed
claude list installed --plugins
claude list installed --skills
claude list installed --tools

# Update
claude update plugin <name>
claude update skill <name>
claude update tool <name>
claude update all

# Remove
claude remove plugin <name>
claude remove skill <name>
claude remove tool <name>

# Info
claude info plugin <name>
claude info skill <name>
claude info tool <name>

# Dependencies
claude deps plugin <name>
claude deps skill <name>
```

## Registry Implementation

### Local Registry

```bash
# Initialize local registry
claude registry init ~/claude-registry

# Add item to local registry
claude registry add plugin ./my-plugin
claude registry add skill ./my-skill
claude registry add tool ./my-tool

# Serve local registry
claude registry serve --port 3000
```

### Custom Registry

```yaml
# .claude/registry.yml
registries:
  - name: official
    url: https://marketplace.claude.ai
    priority: 1

  - name: company
    url: https://claude-registry.company.com
    priority: 2
    auth: token

  - name: local
    path: ~/claude-registry
    priority: 3
```

## Best Practices

### For Plugin Developers

1. **Clear Boundaries:** Define what belongs in plugin vs standalone skills
2. **Dependency Declaration:** Explicitly declare skill and tool dependencies
3. **Versioning:** Use semantic versioning consistently
4. **Documentation:** Document all bundled skills and tools
5. **Extraction:** Allow skills to be extracted for standalone use

### For Skill Creators

1. **Self-Contained:** Skills should work independently
2. **No Hard Dependencies:** Avoid requiring specific plugins
3. **Progressive Disclosure:** Keep SKILL.md lean, details in references/
4. **Compatibility:** Document which projects/plugins can use the skill
5. **Versioning:** Independent version from bundling plugin

### For Tool Developers

1. **Single Responsibility:** Each tool does one thing well
2. **Standard Interface:** Follow CLI conventions (--help, --version)
3. **Error Handling:** Clear error messages and exit codes
4. **Documentation:** Comprehensive README with examples
5. **Cross-Platform:** Work on Linux, macOS, Windows where possible

## Example Ecosystem

```
Claude Marketplace Ecosystem
├── Plugins
│   ├── ai-agent-saas-expert (8 skills, 3 tools)
│   ├── fullstack-toolkit (12 skills, 5 tools)
│   └── security-audit (6 skills, 4 tools)
│
├── Standalone Skills
│   ├── git-workflow (universal)
│   ├── docker-patterns (devops)
│   ├── react-hooks (frontend)
│   └── api-design (backend)
│
└── Tools
    ├── plugin-validator (quality)
    ├── skill-generator (development)
    ├── markdown-linter (quality)
    └── version-manager (automation)
```

## Implementation Roadmap

### Phase 1: Foundation (Current)
- ✅ Plugin structure and validation
- ✅ Skill registry
- ✅ Basic versioning

### Phase 2: Skill Independence (Next)
- [ ] Standalone skill installation
- [ ] Skill extraction from plugins
- [ ] Skill dependency management
- [ ] Skill marketplace registry

### Phase 3: Tool Ecosystem
- [ ] Tool installation and management
- [ ] Tool dependency resolution
- [ ] Tool marketplace registry
- [ ] Global tool access

### Phase 4: Marketplace Platform
- [ ] Centralized marketplace API
- [ ] Web-based marketplace browser
- [ ] Automated publishing workflows
- [ ] Community ratings and reviews

### Phase 5: Advanced Features
- [ ] Plugin composition from skills
- [ ] Dynamic skill loading
- [ ] Version conflict resolution
- [ ] Analytics and usage tracking

## Next Steps

1. **Implement skill extraction:** Allow skills to be used standalone
2. **Create tool registry:** Manage utilities independently
3. **Build marketplace CLI:** Unified installation and management
4. **Develop registry API:** Centralized discovery and distribution
5. **Community platform:** Enable contributions and sharing
