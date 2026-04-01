# Claude Marketplace CLI Commands

Hierarchical command reference for managing plugins, skills, and tools.

## Installation Commands

### Plugin Installation
```bash
# Install from marketplace
claude install plugin ai-agent-saas-expert

# Install from GitHub
claude install plugin https://github.com/khiwniti/claude-plugin.git

# Install specific version
claude install plugin ai-agent-saas-expert@0.1.0

# Install to custom directory
claude install plugin ai-agent-saas-expert --dir ~/.claude/plugins/
```

### Skill Installation
```bash
# Install bundled skill as standalone
claude install skill security-checklist

# Extract skill from plugin
claude extract skill ai-agent-saas-expert:database-architecture

# Install from GitHub
claude install skill https://github.com/org/claude-skill-security

# Install to custom directory
claude install skill security-checklist --dir ~/.claude/skills/
```

### Tool Installation
```bash
# Install tool
claude install tool plugin-validator

# Install tool globally
claude install tool plugin-validator --global

# Install from GitHub
claude install tool https://github.com/org/claude-tool-validator

# Install to custom directory
claude install tool plugin-validator --dir ~/.claude/tools/
```

## Discovery Commands

### Search
```bash
# Search all types
claude search "nextjs"

# Search specific type
claude search plugin "ai agent"
claude search skill "security"
claude search tool "validator"

# Search by tag
claude search --tag security
claude search --tag "ai,llm,streaming"

# Search by category
claude search --category database
claude search --category validation
```

### List
```bash
# List all installed items
claude list installed

# List by type
claude list plugins
claude list skills
claude list tools

# List by category
claude list --category security
claude list skills --category database

# List available (not installed)
claude list available
claude list available --skills
```

## Information Commands

### Get Details
```bash
# Plugin info
claude info plugin ai-agent-saas-expert

# Skill info
claude info skill database-architecture

# Tool info
claude info tool plugin-validator

# Show dependencies
claude deps plugin ai-agent-saas-expert
claude deps skill advanced-nextjs
```

### Version Management
```bash
# Check current version
claude version plugin ai-agent-saas-expert

# List available versions
claude versions plugin ai-agent-saas-expert

# Check for updates
claude outdated
claude outdated --plugins
claude outdated --skills
```

## Update Commands

### Update Items
```bash
# Update specific item
claude update plugin ai-agent-saas-expert
claude update skill security-checklist
claude update tool plugin-validator

# Update all
claude update all
claude update --plugins
claude update --skills
claude update --tools

# Update to specific version
claude update plugin ai-agent-saas-expert@0.2.0
```

## Remove Commands

### Uninstall
```bash
# Remove plugin
claude remove plugin ai-agent-saas-expert

# Remove skill
claude remove skill security-checklist

# Remove tool
claude remove tool plugin-validator

# Remove with dependencies
claude remove plugin ai-agent-saas-expert --cascade
```

## Composition Commands

### Create Custom Plugin
```bash
# Create new plugin
claude create plugin my-custom-plugin

# Add skills
claude add skill my-custom-plugin security-checklist
claude add skill my-custom-plugin git-workflow

# Add tools
claude add tool my-custom-plugin plugin-validator

# Build plugin structure
claude build plugin my-custom-plugin

# Validate
claude validate plugin my-custom-plugin
```

### Extract Skills
```bash
# Extract bundled skill to standalone
claude extract skill ai-agent-saas-expert:security-checklist \
  --to ~/claude-skills/security-checklist

# Extract all skills from plugin
claude extract skills ai-agent-saas-expert \
  --to ~/claude-skills/

# Extract as new plugin
claude extract plugin ai-agent-saas-expert \
  --skills "security-checklist,database-architecture" \
  --name my-security-plugin
```

## Publishing Commands

### Publish Plugin
```bash
# Validate before publish
claude validate plugin my-plugin

# Publish plugin
claude publish plugin my-plugin --version 1.0.0

# Publish with changelog
claude publish plugin my-plugin \
  --version 1.0.0 \
  --changelog "Added new features"

# Publish to custom registry
claude publish plugin my-plugin \
  --registry https://my-registry.com
```

### Publish Skill
```bash
# Publish standalone skill
claude publish skill my-skill --version 1.0.0

# Publish with metadata
claude publish skill my-skill \
  --version 1.0.0 \
  --category security \
  --tags "auth,api,validation"
```

### Publish Tool
```bash
# Publish tool
claude publish tool my-tool --version 1.0.0

# Publish with dependencies
claude publish tool my-tool \
  --version 1.0.0 \
  --requires "bash,python3"
```

## Development Commands

### Initialize
```bash
# Initialize new plugin
claude init plugin my-plugin

# Initialize new skill
claude init skill my-skill

# Initialize new tool
claude init tool my-tool

# Initialize from template
claude init plugin my-plugin --template ai-saas
claude init skill my-skill --template security-patterns
```

### Validate
```bash
# Validate plugin
claude validate plugin ./my-plugin

# Validate skill
claude validate skill ./my-skill

# Validate tool
claude validate tool ./my-tool

# Validate all in directory
claude validate ./my-plugin --all
```

### Link for Development
```bash
# Link local plugin
claude link plugin ./my-plugin

# Link local skill
claude link skill ./my-skill

# Link local tool
claude link tool ./my-tool

# Unlink
claude unlink plugin my-plugin
```

## Configuration Commands

### Registry Management
```bash
# List registries
claude registry list

# Add registry
claude registry add my-registry https://registry.example.com

# Set default registry
claude registry use my-registry

# Login to registry
claude login my-registry

# Logout
claude logout my-registry
```

### Configuration
```bash
# Show configuration
claude config list

# Set config value
claude config set cache-dir ~/.claude/cache
claude config set default-registry official

# Get config value
claude config get cache-dir

# Reset to defaults
claude config reset
```

## Utility Commands

### Cache Management
```bash
# Clear cache
claude cache clear

# Clear specific type
claude cache clear --plugins
claude cache clear --skills

# Show cache info
claude cache info
```

### Dependencies
```bash
# Check dependencies
claude check deps

# Install missing dependencies
claude install deps

# List dependencies
claude deps list
claude deps tree
```

### Statistics
```bash
# Show marketplace stats
claude stats

# Show installed items stats
claude stats installed

# Show plugin usage
claude stats plugin ai-agent-saas-expert
```

## Example Workflows

### Install Complete Plugin
```bash
# Search for plugins
claude search plugin "ai agent"

# Get plugin info
claude info plugin ai-agent-saas-expert

# Install plugin
claude install plugin ai-agent-saas-expert

# Verify installation
claude list plugins
```

### Install Specific Skill Only
```bash
# Search for security skills
claude search skill "security"

# Get skill info
claude info skill security-checklist

# Install standalone
claude install skill security-checklist

# Verify
claude list skills
```

### Create Custom Plugin from Skills
```bash
# Create new plugin
claude create plugin my-security-plugin

# Add multiple skills
claude add skill my-security-plugin security-checklist
claude add skill my-security-plugin auth-patterns
claude add skill my-security-plugin api-security

# Add validation tool
claude add tool my-security-plugin plugin-validator

# Build and validate
claude build plugin my-security-plugin
claude validate plugin my-security-plugin

# Publish
claude publish plugin my-security-plugin --version 1.0.0
```

### Update Workflow
```bash
# Check for updates
claude outdated

# Update specific plugin
claude update plugin ai-agent-saas-expert

# Or update all
claude update all

# Verify updates
claude list installed --outdated
```
