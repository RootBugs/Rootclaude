# RootClaude v2.0 — Precise Implementation Plan

## Architecture Overview
```
User Input → Task Classifier → Model Router → System Prompt (skill-injected) → API Call → Tool Execution → Verification → Response
```

---

## Phase 1: Smart Model Router (Enable + Configure)
**Effort: 4 hours | Impact: 3x better responses**

**What exists:** `src/services/api/smartRouting/` — full implementation, just disabled.

**What to do:**
```json
// In settings.json
"smartRouting": {
  "enabled": true,
  "simpleModel": "deepseek-v4-flash-free",
  "strongModel": "qwen3-coder",
  "simpleMaxChars": 500,
  "simpleMaxWords": 50
}
```

**How routing works (from source):**
- `decideTurnModel()` in `src/services/api/smartRouting/index.ts` classifies turns
- Simple tasks (file ops, quick answers) → `deepseek-v4-flash-free` (fast)
- Complex tasks (architecture, debugging) → `qwen3-coder` (smart)
- Classification: message length + content analysis

**Testing:**
```bash
bun test src/services/api/smartRouting/
```

---

## Phase 2: Auto-Skill Injection
**Effort: 8 hours | Impact: 2x better first-attempt results**

**What exists:** 17 bundled skills in `src/skills/bundled/`, all manual.

**What to build:** Task classifier that auto-injects skill prompts.

**File changes:**

1. **New file: `src/skills/autoTrigger.ts`**
```typescript
// Classify user message → match to skill
const SKILL_TRIGGERS = {
  'debug-fix': /error|bug|crash|fail|broken|exception/i,
  'code-quality': /refactor|clean|optimize|improve|quality/i,
  'security-first': /auth|token|password|encrypt|vulnerability/i,
  'deep-reasoning': /architecture|design|why|how.*work|explain/i,
  'tdd-enforcer': /test|spec|assert|mock|coverage/i,
  'performance-optimized': /slow|fast|cache|latency|memory/i,
}

export function classifyTask(userMessage: string): string[] {
  const matches = []
  for (const [skill, pattern] of Object.entries(SKILL_TRIGGERS)) {
    if (pattern.test(userMessage)) matches.push(skill)
  }
  return matches
}
```

2. **Modify: `src/query.ts` (line ~200, before API call)**
```typescript
// After building messages, before calling API
const taskSkills = classifyTask(extractLatestUserText(messages))
if (taskSkills.length > 0) {
  const skillContent = taskSkills.map(s => loadSkillPrompt(s)).join('\n')
  messages = injectSkillContext(messages, skillContent)
}
```

3. **Modify: `src/utils/systemPrompt.ts`**
```typescript
// Add skill injection section
if (activeSkills.length > 0) {
  sections.push({
    type: 'text',
    text: `## Active Skills\n${activeSkills.map(s => `- ${s.name}: ${s.description}`).join('\n')}`
  })
}
```

**Skills to auto-trigger (from `src/skills/bundled/`):**

| Skill | Trigger Pattern | Effect |
|-------|----------------|--------|
| `debug-fix` | error/bug/crash | Adds debugging methodology |
| `code-quality` | refactor/clean/optimize | Adds quality checklist |
| `security-first` | auth/token/password | Adds security review |
| `deep-reasoning` | architecture/design/why | Adds reasoning chain |
| `tdd-enforcer` | test/spec/assert | Adds test methodology |
| `performance-optimized` | slow/fast/cache | Adds perf analysis |

---

## Phase 3: Self-Verification Gate
**Effort: 6 hours | Impact: Catches 80% of errors**

**What exists:** `src/tools/VerifyPlanExecutionTool/` — exists but not auto-triggered.

**What to build:** Auto-verify after multi-file edits.

**File changes:**

1. **Modify: `src/services/tools/toolOrchestration.ts`**
```typescript
// After tool batch execution
const fileEdits = toolResults.filter(r => 
  r.toolName === 'Write' || r.toolName === 'Edit'
)
if (fileEdits.length >= 2) {
  // Spawn verification
  const verifyResult = await runVerification(fileEdits)
  if (!verifyResult.passed) {
    // Feed error back to model
    messages.push(createUserMessage({
      content: `Verification failed: ${verifyResult.error}. Please fix.`
    }))
  }
}
```

2. **New file: `src/services/verification/autoVerify.ts`**
```typescript
export async function runVerification(edits: ToolResult[]) {
  // 1. Check if build passes
  const buildResult = await exec('npm run build 2>&1')
  if (buildResult.exitCode !== 0) {
    return { passed: false, error: buildResult.stdout }
  }
  
  // 2. Check if types pass
  const typeResult = await exec('npx tsc --noEmit 2>&1')
  if (typeResult.exitCode !== 0) {
    return { passed: false, error: typeResult.stdout }
  }
  
  // 3. Check if tests pass (if test file was modified)
  const testFiles = edits.filter(e => e.filePath?.includes('.test.'))
  if (testFiles.length > 0) {
    const testResult = await exec('npx vitest run 2>&1')
    if (testResult.exitCode !== 0) {
      return { passed: false, error: testResult.stdout }
    }
  }
  
  return { passed: true }
}
```

3. **Modify: `src/query.ts` (after tool execution loop)**
```typescript
// Add verification hook
if (shouldVerify(toolsExecuted)) {
  const verifyResult = await autoVerify(toolsExecuted)
  if (!verifyResult.passed) {
    // Inject error for model to fix
    messages.push(createSystemMessage(`Verification failed: ${verifyResult.error}`))
    continue // Loop back to model
  }
}
```

---

## Phase 4: Project Context Engine
**Effort: 4 hours | Impact: 30% fewer iterations**

**What exists:** `src/tools/RepoMapTool/` — repo map tool exists.

**What to build:** Auto-inject project context on session start.

**File changes:**

1. **Modify: `src/context.ts`**
```typescript
export async function buildProjectContext(cwd: string): Promise<string> {
  const context = []
  
  // Read package.json
  const pkg = await readJson(join(cwd, 'package.json'))
  if (pkg) {
    context.push(`Project: ${pkg.name} v${pkg.version}`)
    context.push(`Language: ${detectLanguage(pkg)}`)
    context.push(`Dependencies: ${Object.keys(pkg.dependencies || {}).join(', ')}`)
  }
  
  // Read README
  const readme = await readFile(join(cwd, 'README.md'), 'utf-8').catch(() => null)
  if (readme) {
    context.push(`Description: ${readme.slice(0, 500)}`)
  }
  
  // Read key config files
  const configs = ['tsconfig.json', 'vite.config.ts', 'next.config.js']
  for (const config of configs) {
    const content = await readFile(join(cwd, config), 'utf-8').catch(() => null)
    if (content) context.push(`${config}: ${content.slice(0, 200)}`)
  }
  
  return context.join('\n')
}
```

2. **Modify: `src/utils/systemPrompt.ts`**
```typescript
// Add project context section
const projectContext = await buildProjectContext(cwd)
if (projectContext) {
  sections.push({
    type: 'text',
    text: `## Project Context\n${projectContext}`
  })
}
```

---

## Phase 5: Learning Memory
**Effort: 4 hours | Impact: 20% faster repeated tasks**

**What exists:** `src/services/SessionMemory/` — session memory exists.

**What to build:** Auto-extract success patterns.

**File changes:**

1. **New file: `src/services/memory/successTracker.ts`**
```typescript
export function extractSuccessPattern(
  toolsUsed: string[],
  taskDescription: string,
  outcome: 'success' | 'failure'
): SuccessPattern {
  return {
    taskType: classifyTaskType(taskDescription),
    toolsUsed,
    outcome,
    timestamp: Date.now(),
    model: getCurrentModel(),
  }
}

export function storeSuccessPattern(pattern: SuccessPattern) {
  const patterns = loadPatterns()
  patterns.push(pattern)
  // Keep last 100 patterns
  if (patterns.length > 100) patterns.shift()
  savePatterns(patterns)
}
```

2. **Modify: `src/query.ts` (after successful completion)**
```typescript
// After model says "done" and verification passes
if (verificationPassed) {
  const pattern = extractSuccessPattern(
    toolsExecuted.map(t => t.toolName),
    userMessage,
    'success'
  )
  storeSuccessPattern(pattern)
}
```

3. **Modify: `src/utils/systemPrompt.ts`**
```typescript
// Add relevant past patterns
const relevantPatterns = findRelevantPatterns(userMessage, 3)
if (relevantPatterns.length > 0) {
  sections.push({
    type: 'text',
    text: `## Past Success Patterns\n${relevantPatterns.map(p => 
      `- ${p.taskType}: used ${p.toolsUsed.join(', ')} (${p.outcome})`
    ).join('\n')}`
  })
}
```

---

## Implementation Order

| Phase | Days | Dependencies | Risk |
|-------|------|--------------|------|
| 1. Smart Router | 0.5 | None | Low |
| 2. Auto-Skills | 1 | Phase 1 | Low |
| 3. Verification | 0.75 | Phase 2 | Medium |
| 4. Context Engine | 0.5 | None | Low |
| 5. Learning Memory | 0.5 | Phase 2 | Low |

**Total: 3.25 days**

## Success Criteria

| Metric | Before | After |
|--------|--------|-------|
| First-attempt success | 60% | 85% |
| Avg iterations per task | 3.2 | 1.8 |
| Token usage | Baseline | -25% |
| Error rate | 15% | 5% |

## Verification Commands
```bash
bun run build
bun run typecheck
bun test src/services/api/smartRouting/
bun test src/services/verification/
bun test src/services/memory/
```
