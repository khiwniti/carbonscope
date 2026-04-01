# Quick Start Guide - Plugin Management

Practical guide for using the AI Agent SaaS Expert plugin and managing plugin ecosystems.

## Plugin Installation

### Method 1: GitHub Installation (Recommended)

```bash
# Install from GitHub repository
cc plugin install https://github.com/khiwniti/claude-plugin.git

# Or specify subdirectory if in monorepo
cc plugin install https://github.com/khiwniti/claude-plugin.git#ai-agent-saas-expert
```

### Method 2: Local Development

```bash
# Clone repository
git clone https://github.com/khiwniti/claude-plugin.git
cd claude-plugin/ai-agent-saas-expert

# Link for development
cc --plugin-dir .

# Or install globally
cc plugin link
```

### Method 3: Manual Installation

```bash
# Download and extract
wget https://github.com/khiwniti/claude-plugin/archive/main.zip
unzip main.zip
cd claude-plugin-main/ai-agent-saas-expert

# Use with Claude Code
cc --plugin-dir /path/to/ai-agent-saas-expert
```

## Using the Plugin

### Agent Activation

Agents activate automatically based on your queries:

**Architecture Review:**
```
You: "Can you review my monorepo architecture?"
Claude: *Activates architecture-auditor agent*
        *Analyzes package.json, workspace structure, routing patterns*
        *Provides health score and recommendations*
```

**Production Readiness:**
```
You: "Is my project ready for production?"
Claude: *Activates production-readiness agent*
        *Checks security, observability, error handling*
        *Generates comprehensive readiness report*
```

**Security Audit:**
```
You: "Review my authentication implementation"
Claude: *Activates security-hardening agent*
        *Audits auth patterns, API security, input validation*
        *Identifies vulnerabilities and provides fixes*
```

**Performance Analysis:**
```
You: "Why are my pages loading slowly?"
Claude: *Activates performance-tuning agent*
        *Analyzes Core Web Vitals, database queries, caching*
        *Provides optimization recommendations*
```

### Skill Usage

Skills load automatically when relevant topics are discussed:

**Sandbox Integration:**
```
You: "I need to set up Daytona for my AI agent"
Claude: *Loads sandbox-integration-guide skill*
        *Provides Daytona setup patterns, health checks*
```

**LLM Integration:**
```
You: "How do I integrate multiple LLM providers?"
Claude: *Loads llm-integration-patterns skill*
        *Shows AI SDK v6 multi-provider setup*
```

**Database Design:**
```
You: "Should I use PostgreSQL or Neo4j for my agent data?"
Claude: *Loads database-architecture skill*
        *Explains multi-database pattern for AI SaaS*
```

## Plugin Management Tools

### Skill Discovery

**Find skill by name:**
```bash
./scripts/find-skill.sh database-architecture
```

**Find skills by tag:**
```bash
./scripts/find-skill.sh nextjs
./scripts/find-skill.sh security
./scripts/find-skill.sh ai
```

**Find skills by category:**
```bash
./scripts/find-skill.sh database
./scripts/find-skill.sh devops
./scripts/find-skill.sh security
```

### Plugin Validation

**Validate plugin structure:**
```bash
# Validate current directory
./scripts/validate-plugin.sh

# Validate specific plugin
./scripts/validate-plugin.sh /path/to/plugin
```

**What it checks:**
- ✅ .claude-plugin/ directory exists
- ✅ plugin.json is valid JSON
- ✅ Required fields (name, version)
- ✅ All agents have valid frontmatter
- ✅ All skills have valid frontmatter
- ✅ Supporting directories (examples/, references/)

### Version Management

**Bump version (semantic versioning):**

```bash
# Patch version (0.1.0 -> 0.1.1)
./scripts/version-bump.sh patch

# Minor version (0.1.0 -> 0.2.0)
./scripts/version-bump.sh minor

# Major version (0.1.0 -> 1.0.0)
./scripts/version-bump.sh major
```

**What it does:**
1. Updates version in plugin.json
2. Updates version in all skill SKILL.md files
3. Creates git commit
4. Creates git tag (v0.1.1)
5. Ready to push to GitHub

**After version bump:**
```bash
git push origin main
git push origin v0.1.1
```

## Development Workflow

### Creating New Skills

**1. Create skill directory structure:**
```bash
mkdir -p skills/new-skill-name/{references,examples}
```

**2. Create SKILL.md:**
```bash
cat > skills/new-skill-name/SKILL.md << 'EOF'
---
name: New Skill Name
description: This skill should be used when the user asks about "trigger phrase 1", "trigger phrase 2". Description of skill purpose.
version: 0.1.0
---

# New Skill Name

[Skill content following progressive disclosure pattern]
EOF
```

**3. Update skill-registry.json:**
```json
{
  "skills": {
    "new-skill-name": {
      "id": "new-skill-name",
      "name": "New Skill Name",
      "version": "0.1.0",
      "plugins": ["ai-agent-saas-expert"],
      "category": "your-category",
      "tags": ["tag1", "tag2"],
      "description": "Brief description",
      "dependencies": [],
      "reusableIn": ["target-projects"],
      "complexity": "low|medium|high"
    }
  }
}
```

**4. Validate and commit:**
```bash
./scripts/validate-plugin.sh
git add skills/new-skill-name skill-registry.json
git commit -m "feat(skills): add new-skill-name"
```

### Creating New Agents

**1. Create agent file:**
```bash
cat > agents/new-agent.md << 'EOF'
---
name: new-agent
description: Use this agent when [trigger scenarios]. Examples: <example>Context: [scenario] user: "[user query]" assistant: "I'll use the new-agent to [action]."</example>
model: inherit
color: blue
tools: ["Read", "Glob", "Grep", "Bash"]
---

[Agent system prompt]
EOF
```

**2. Validate and commit:**
```bash
./scripts/validate-plugin.sh
git add agents/new-agent.md
git commit -m "feat(agents): add new-agent"
```

## Git Workflow

### Standard Commit Flow

```bash
# Check status
git status

# Stage changes
git add <files>

# Commit with conventional format
git commit -m "type(scope): subject

Body explaining what and why

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to GitHub
git push origin main
```

### Conventional Commit Types

- `feat`: New skill or agent
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code restructuring
- `test`: Test additions
- `chore`: Maintenance

### Example Commits

```bash
# New feature
git commit -m "feat(skills): add deployment-strategies skill"

# Bug fix
git commit -m "fix(agents): correct YAML formatting in routing-optimizer"

# Documentation
git commit -m "docs: update README with installation instructions"

# Version bump
git commit -m "chore: bump version to 0.2.0"
```

## Maintenance Schedule

### Weekly Checks
- [ ] Review skill trigger phrases for clarity
- [ ] Check for framework/API updates affecting examples
- [ ] Review GitHub issues and discussions

### Monthly Tasks
- [ ] Update code examples for latest framework versions
- [ ] Review and update model references (e.g., gpt-4o → gpt-5.4)
- [ ] Validate all skills still load correctly
- [ ] Update dependencies in examples

### Quarterly Reviews
- [ ] Comprehensive skill content audit
- [ ] Update reference documentation
- [ ] Performance optimization review
- [ ] User feedback integration

## Troubleshooting

### Plugin Not Loading

**Check Claude Code plugin directory:**
```bash
cc plugin list
```

**Verify plugin structure:**
```bash
./scripts/validate-plugin.sh
```

**Check plugin.json:**
```bash
cat .claude-plugin/plugin.json | python3 -m json.tool
```

### Agent Not Activating

**Check agent triggers:**
1. Read agent's `description` field in frontmatter
2. Verify your query matches trigger patterns
3. Use exact phrases from `<example>` blocks

**Debug activation:**
- Try more specific queries matching example scenarios
- Mention the agent name explicitly: "Use the architecture-auditor agent"
- Check Claude Code logs for agent selection

### Skill Not Loading

**Check skill location:**
```bash
ls -la skills/skill-name/SKILL.md
```

**Validate frontmatter:**
```bash
head -n 10 skills/skill-name/SKILL.md
```

**Check description triggers:**
- Ensure your query matches trigger phrases in `description` field
- Use exact phrases from skill description

## Advanced Usage

### Custom Plugin Configuration

**Create project-specific settings:**
```bash
# In your project directory
mkdir -p .claude
cat > .claude/plugin-config.json << 'EOF'
{
  "plugins": {
    "ai-agent-saas-expert": {
      "enabled": true,
      "agents": {
        "architecture-auditor": { "priority": "high" },
        "security-hardening": { "priority": "high" }
      },
      "skills": {
        "security-checklist": { "auto-load": true }
      }
    }
  }
}
EOF
```

### Extending Plugins

**Add custom agents to existing plugin:**
```bash
# Copy plugin locally
git clone https://github.com/khiwniti/claude-plugin.git
cd claude-plugin/ai-agent-saas-expert

# Create custom agent
cat > agents/custom-agent.md << 'EOF'
[Your custom agent definition]
EOF

# Validate
./scripts/validate-plugin.sh

# Commit and push to your fork
git remote add fork https://github.com/your-username/claude-plugin.git
git push fork main
```

## Next Steps

1. **Install the plugin** using one of the methods above
2. **Try example queries** to activate different agents
3. **Explore skills** by discussing relevant topics
4. **Customize** for your specific needs
5. **Contribute** improvements back to the community

## Resources

- **Plugin Repository:** https://github.com/khiwniti/claude-plugin
- **Plugin Management Strategy:** PLUGIN-MANAGEMENT-STRATEGY.md
- **Skill Registry:** skill-registry.json
- **Validation Scripts:** scripts/

## Support

For issues, questions, or contributions:
1. Check existing GitHub issues
2. Review PLUGIN-MANAGEMENT-STRATEGY.md
3. Open a new issue with detailed description
4. Submit PRs for improvements
