# RootClaude VS Code Extension

A practical VS Code companion for RootClaude with a project-aware **Control Center**, predictable terminal launch behavior, and quick access to useful RootClaude workflows.

## Features

- **Real Control Center status** in the Activity Bar:
  - whether the configured `RootClaude` command is installed
  - the launch command being used
  - whether the launch shim injects `CLAUDE_CODE_USE_OPENAI=1`
  - the current workspace folder
  - the launch cwd that will be used for terminal sessions
  - whether `.RootClaude-profile.json` exists in the current workspace root
  - a conservative provider summary derived from the workspace profile or known environment flags
- **Project-aware launch behavior**:
  - `Launch RootClaude` launches from the active editor's workspace when possible
  - falls back to the first workspace folder when needed
  - avoids launching from an arbitrary default cwd when a project is open
- **Practical sidebar actions**:
  - Launch RootClaude
  - Launch in Workspace Root
  - Open Workspace Profile
  - Open Repository
  - Open Setup Guide
  - Open Command Palette
- **Built-in dark theme**: `RootClaude Terminal Black`
- **Microsoft Foundry / Azure OpenAI**: optional wizard and settings store endpoint, API version, deployment name, and API key (Secret Storage); launch injects `OPENAI_*` and `AZURE_OPENAI_API_VERSION` into the RootClaude terminal (see `docs/advanced-setup.md` on the repo).

## Requirements

- VS Code `1.95+`
- `RootClaude` available in your terminal PATH (`npm install -g @gitlawb/RootClaude@latest`)

## Commands

- `RootClaude: Open Control Center`
- `RootClaude: Launch in Terminal`
- `RootClaude: Launch in Workspace Root`
- `RootClaude: Open Repository`
- `RootClaude: Open Setup Guide`
- `RootClaude: Open Workspace Profile`
- `RootClaude: New Chat` / `RootClaude: Open Chat Panel` / `RootClaude: Resume Session` / `RootClaude: Abort Generation`
- `RootClaude: Configure Azure / Foundry Chat (wizard)`
- `RootClaude: Set Azure / Foundry API Key (Secret Storage)`
- `RootClaude: Clear Azure / Foundry API Key`
- `RootClaude: Open Azure / Foundry Settings`

## Microsoft Foundry / Azure OpenAI (terminal chat)

1. Command Palette → **RootClaude: Configure Azure / Foundry Chat (wizard)** and enter endpoint, API version, deployment name, and API key; or set `RootClaude.azure.*` in Settings and use **RootClaude: Set Azure / Foundry API Key**.
2. Enable **RootClaude: Azure: Enabled** (the wizard turns this on).
3. **RootClaude: Launch in Terminal** — the extension merges env vars the OpenAI shim expects (`CLAUDE_CODE_USE_OPENAI`, `OPENAI_BASE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `AZURE_OPENAI_API_VERSION`, and `OPENAI_AZURE_STYLE` when forced).

If you use `.RootClaude-profile.json` for the same workspace, leave Azure injection off to avoid conflicting provider configuration.

## Settings

- `RootClaude.launchCommand` (default: `RootClaude`)
- `RootClaude.terminalName` (default: `RootClaude`)
- `RootClaude.useOpenAIShim` (default: `false`)
- `RootClaude.azure.*` — Foundry / Azure OpenAI terminal injection (see Settings UI)
- `RootClaude.permissionMode` — chat permission mode

`RootClaude.useOpenAIShim` only injects `CLAUDE_CODE_USE_OPENAI=1` when Azure injection did not already set it. It does not configure endpoints or keys by itself.

## Notes on Status Detection

- Provider status prefers the real workspace `.RootClaude-profile.json` file when present.
- If no saved profile exists, the extension falls back to known environment flags available to the VS Code extension host.
- If the source of truth is unclear, the extension shows `unknown` instead of guessing.

## Development

From this folder:

```bash
npm run test
npm run lint
```

To package (optional):

```bash
npm run package
```

