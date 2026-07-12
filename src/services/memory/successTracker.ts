import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

// ── Types ────────────────────────────────────────────────────────────────────

export type SuccessPattern = {
  taskType: string
  toolsUsed: string[]
  outcome: 'success' | 'failure'
  timestamp: number
  model: string
  projectName?: string
}

// ── Storage ──────────────────────────────────────────────────────────────────

const MEMORY_DIR = join(homedir(), '.RootClaude', 'memory')

function ensureMemoryDir(): void {
  if (!existsSync(MEMORY_DIR)) {
    mkdirSync(MEMORY_DIR, { recursive: true })
  }
}

function getStorePath(): string {
  return join(MEMORY_DIR, 'success-patterns.json')
}

function loadPatterns(): SuccessPattern[] {
  try {
    ensureMemoryDir()
    const raw = readFileSync(getStorePath(), 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, 100) : []
  } catch {
    return []
  }
}

function savePatterns(patterns: SuccessPattern[]): void {
  ensureMemoryDir()
  writeFileSync(getStorePath(), JSON.stringify(patterns, null, 2), 'utf-8')
}

// ── Classification ───────────────────────────────────────────────────────────

const TASK_CLASSIFIERS: [RegExp, string][] = [
  [/implement|feature|add\s+\w+|create\s+\w+|build\s+/i, 'implementation'],
  [/refactor|clean|rewrite|restructure|simplif/i, 'refactoring'],
  [/debug|fix|bug|error|crash|fail|broken|exception|issue/i, 'debugging'],
  [/test|spec|assert|mock|coverage|unit/i, 'testing'],
  [/doc|readme|comment|api\s*doc|jsdoc|tsdoc/i, 'documentation'],
  [/config|setup|install|deploy|ci|cd|docker/i, 'configuration'],
  [/security|auth|token|password|encrypt|vuln/i, 'security'],
  [/perf|slow|fast|cache|latency|optimize|bottleneck/i, 'performance'],
  [/ui|ux|component|style|design|theme|layout|responsive/i, 'ui/ux'],
  [/review|audit|check|inspect|lint/i, 'review'],
]

export function classifyTaskType(description: string): string {
  for (const [regex, type] of TASK_CLASSIFIERS) {
    if (regex.test(description)) return type
  }
  return 'general'
}

// ── Core API ─────────────────────────────────────────────────────────────────

export function extractSuccessPattern(
  toolsUsed: string[],
  taskDescription: string,
  outcome: 'success' | 'failure',
  projectName?: string,
): SuccessPattern {
  return {
    taskType: classifyTaskType(taskDescription),
    toolsUsed,
    outcome,
    timestamp: Date.now(),
    model: process.env.CLAUDE_CODE_MODEL || process.env.SELECTED_MODEL || 'unknown',
    projectName,
  }
}

export function storeSuccessPattern(pattern: SuccessPattern): void {
  const patterns = loadPatterns()
  patterns.push(pattern)
  if (patterns.length > 100) {
    patterns.splice(0, patterns.length - 100)
  }
  savePatterns(patterns)
}

export function findRelevantPatterns(
  taskDescription: string,
  limit = 3,
): SuccessPattern[] {
  const taskType = classifyTaskType(taskDescription)
  const patterns = loadPatterns()
  const relevant = patterns
    .filter(p => p.taskType === taskType && p.outcome === 'success')
    .reverse()
    .slice(0, limit)
  return relevant
}

export function getPatternSummary(patterns: SuccessPattern[]): string {
  if (patterns.length === 0) return ''
  return patterns
    .map(
      p =>
        `- ${p.taskType}: used [${p.toolsUsed.slice(0, 5).join(', ')}] (${p.outcome})`,
    )
    .join('\n')
}
