---
mode: subagent
model: openai/gpt-6-astra
# dual peer: kimi-code-plan-global/k3
# fallback pair: openai/gpt-5.6-sol + kimi-code-plan-global/k3-256k
color: warning
temperature: 0.4
permission:
  question: allow
  websearch: allow
  webfetch: allow
  edit: allow
  task:
    "*": deny
    system-architect-gpt: allow
    system-architect-sonnet: allow
  external_directory:
    "{{references_dir}}/**": allow
---
