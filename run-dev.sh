#!/bin/bash

echo "🟠 planning"
opencode run --model opencode-go/glm-5.1 "@prompts/plan.prompt.md"
echo "🟡 introspect"
opencode run --model opencode-go/glm-5.1 "@prompts/plan-validate.prompt.md"
echo "🟢 dev"
opencode run --model opencode-go/glm-5.1 "@prompts/dev.prompt.md"

echo "🚀 pushing to remote"
git push origin

