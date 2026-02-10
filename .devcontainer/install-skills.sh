#!/bin/bash
set -e

# Target directory for skills
# The CLI looks for skills in .agents/skills or .blueprint/skills
TARGET_DIR=".agents/skills"

echo "Ensuring target directory exists: $TARGET_DIR"
mkdir -p "$TARGET_DIR"

# Navigate to target directory so skills are installed there
# (Assuming 'skills add' installs to CWD)
cd "$TARGET_DIR"

echo "Installing skills using npx..."

# Install skills using npx
# Note: This requires the 'skills' package and internet access
npx skills add https://github.com/aj-geddes/useful-ai-prompts --skill user-story-writing
npx skills add https://github.com/wshobson/agents --skill javascript-testing-patterns
npx skills add https://github.com/martinholovsky/claude-skills-generator --skill javascript-expert
npx skills add https://github.com/wshobson/agents --skill modern-javascript-patterns
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-native-skills

echo "✅ Skill installation commands executed."
echo "Checking installed skills:"
ls -F
