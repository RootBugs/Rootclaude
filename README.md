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

## Agent Routing

| Agent Type | Model | Provider |
|------------|-------|----------|
| Explore | MiMo V2.5 Free | OpenCode Zen |
| Plan | Qwen3 Coder | OpenRouter |
| General | MiMo V2.5 Free | OpenCode Zen |
| Verification | Nemotron 3 Super | OpenRouter |
| Default | MiMo V2.5 Free | OpenCode Zen |

## Supported Models

| Model | Provider | Type |
|-------|----------|------|
| DeepSeek V4 Flash | OpenCode Zen | Main |
| MiMo V2.5 Free | OpenCode Zen | Sub-agent |
| Qwen3 Coder | OpenRouter | Sub-agent |
| Nemotron 3 Super | OpenRouter | Sub-agent |
| Llama 3.3 70B | OpenRouter | Sub-agent |
| GPT-OSS 120B | OpenRouter | Sub-agent |
| Gemma 4 31B | OpenRouter | Sub-agent |
| North Mini Code | OpenRouter | Sub-agent |

## Architecture

```
RootClaude
├── Main Model (DeepSeek V4 Flash)
├── 8 Agent Models (OpenRouter)
├── 19 Skills (reasoning-enhanced)
├── Agent Routing (smart model selection)
├── Smart Routing (simple → fast, complex → powerful)
├── AutoCLI WebFetch (direct HTTP)
├── Persistent Memory (cross-session)
└── GitHub: RootBugs/Rootclaude
```

## License

MIT — See [LICENSE](LICENSE) for details.

---

*Built with ❤️ by RootBugs*
