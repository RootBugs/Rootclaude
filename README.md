# RootClaude

**Root terminal for any LLM.**

RootClaude is an open-source coding-agent CLI with 19 premium skills, 8 free models, and deep reasoning capabilities. Built for software engineers who want powerful AI assistance without the cost.

```
░▒▓███████▓▒░ ░▒▓██████▓▒░ ░▒▓██████▓▒░▒▓████████▓▒░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░ ░▒▓███████▓▒░
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░
░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒▒▓███▓▒░░▒▓██████▓▒░
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░
░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░ ░▒▓██████▓▒░  ░▒▓█▓▒░   ░▒▓███████▓▒░ ░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓███████▓▒░
```

[![License](https://img.shields.io/badge/license-MIT-red)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-RootBugs-red?logo=github)](https://github.com/RootBugs/Rootclaude)

## Why RootClaude?

- **19 Premium Skills** — Code quality, design, security, performance, reasoning
- **8 Free Models** — MiMo, Qwen, DeepSeek, Nemotron, GPT-OSS, Gemma, North
- **Zero Cost** — All models are free tier, no API keys required
- **Smart Routing** — Simple tasks → fast model, complex tasks → powerful model
- **Deep Reasoning** — Multi-step thinking, chain-of-thought, self-verification
- **AutoCLI WebFetch** — Direct HTTP fetch without browser dependency
- **Persistent Memory** — Cross-session context and learnings

## Quick Start

### Install

```bash
git clone https://github.com/RootBugs/Rootclaude.git
cd Rootclaude
npm install
npm run build
node bin/rootclaude
```

### Start

```bash
rootclaude
```

## Default Provider

RootClaude comes with **OpenCode Zen** as the default provider — no API key setup required.

| Setting | Value |
|---------|-------|
| Provider | OpenCode Zen |
| Model | DeepSeek V4 Flash Free |
| Endpoint | `https://opencode.ai/zen/v1` |
| API Key | Not required (free tier) |

Simply run `rootclaude` and start coding. No configuration needed.

## Skills (19 Total)

| Category | Skills |
|----------|--------|
| **Code Quality** | elite-coder, ultra-prompt, code-quality, tdd-enforcer |
| **Design** | premium-design, ui-design-quality, responsive-design |
| **Security** | security-first |
| **Performance** | performance-optimized, agent-cache, context-optimizer |
| **Memory** | smart-memory |
| **Search** | multi-search |
| **Reasoning** | deep-reasoning, system-prompt-master |
| **Development** | fullstack-master, react-nextjs-master, project-builder, debug-fix |
| **Utilities** | ultra-fast, css-validator, verify-claims, render-check, memory-manager, agent-orchestrator |

## Agent Routing

| Agent Type | Model | Provider |
|------------|-------|----------|
| Explore | MiMo V2.5 Free | OpenCode Zen |
| Plan | Qwen3 Coder | OpenRouter |
| General | MiMo V2.5 Free | OpenCode Zen |
| Verification | Nemotron 3 Super | OpenRouter |
| Default | DeepSeek V4 Flash Free | OpenCode Zen |

## Supported Models

| Model | Provider | Type | Cost |
|-------|----------|------|------|
| DeepSeek V4 Flash Free | OpenCode Zen | Main | Free |
| MiMo V2.5 Free | OpenCode Zen | Sub-agent | Free |
| Qwen3 Coder | OpenRouter | Sub-agent | Free |
| Nemotron 3 Super | OpenRouter | Sub-agent | Free |
| Llama 3.3 70B | OpenRouter | Sub-agent | Free |
| GPT-OSS 120B | OpenRouter | Sub-agent | Free |
| Gemma 4 31B | OpenRouter | Sub-agent | Free |
| North Mini Code | OpenRouter | Sub-agent | Free |

## Supported Providers

RootClaude supports 200+ models across multiple providers:

| Provider | Models | API Key Required |
|----------|--------|------------------|
| OpenCode Zen | DeepSeek, MiMo, Qwen, GLM, MiniMax, Kimi | No (free tier) |
| Anthropic | Claude Opus, Sonnet, Haiku | Yes |
| OpenAI | GPT-5, GPT-4o, Codex | Yes |
| Google Gemini | Gemini 2.0, Gemini Pro | Yes |
| Ollama | Llama, Mistral, Qwen (local) | No |
| LM Studio | Any local model | No |
| GitHub Copilot | GPT-4o, Claude | Yes |
| AWS Bedrock | Claude, Llama, Mistral | Yes |
| Google Vertex | Gemini, Claude | Yes |
| DeepSeek | DeepSeek V4, V3 | Yes |

## Configuration

### Provider Profiles

Switch providers with `/provider` or set environment variables:

```bash
# OpenCode Zen (default - free)
export OPENAI_BASE_URL=https://opencode.ai/zen/v1
export OPENAI_API_KEY=public
export OPENAI_MODEL=deepseek-v4-flash-free

# OpenAI
export CLAUDE_CODE_USE_OPENAI=1
export OPENAI_API_KEY=sk-your-key
export OPENAI_MODEL=gpt-4o

# Anthropic
export ANTHROPIC_API_KEY=sk-ant-your-key
```

### Settings

Configure via `settings.json` in `~/.openclaude/`:

```json
{
  "model": "deepseek-v4-flash-free",
  "permissions": {
    "allow": ["Bash(npm:*)", "Bash(git:*)", "Read", "Edit", "Write"],
    "deny": ["Bash(rm -rf /:*)"]
  },
  "hooks": {},
  "env": {}
}
```

## Architecture

```
RootClaude
├── Main Model (DeepSeek V4 Flash Free via OpenCode Zen)
├── 8 Agent Models (OpenRouter)
├── 19 Skills (reasoning-enhanced)
├── Agent Routing (smart model selection)
├── Smart Routing (simple → fast, complex → powerful)
├── AutoCLI WebFetch (direct HTTP)
├── Persistent Memory (cross-session)
└── GitHub: RootBugs/Rootclaude
```

## Commands

| Command | Description |
|---------|-------------|
| `/help` | Show available commands |
| `/status` | Show current status |
| `/model` | Switch model |
| `/provider` | Switch provider |
| `/skills` | List available skills |
| `/compact` | Compact conversation |
| `/clear` | Clear conversation |
| `/theme` | Change theme |
| `/hooks` | Manage hooks |
| `/mcp` | MCP server management |

## License

MIT — See [LICENSE](LICENSE) for details.

---

*Built with ❤️ by RootBugs*
