import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Skill trigger patterns ──────────────────────────────────────────────────
// Maps skill name → regex to match against the user's message.
// Add or refine patterns as new skills are added to skills/ or src/skills/bundled/.

const SKILL_TRIGGERS: Record<string, RegExp> = {
  'deep-reasoning': /architecture|design|why|how\s.*work|explain|trade.?off|scalability|design pattern/i,
  'code-quality': /refactor|clean|optimize|improve|quality|technical.debt|reus/i,
  'security-first': /auth|token|password|encrypt|vulnerability|injection|xss|csrf|oauth/i,
  'tdd-enforcer': /test|spec|assert|mock|coverage|unit.test|integration.test|tdd/i,
  'debug-fix': /error|bug|crash|fail|broken|exception|stack.trace|issue/i,
  'performance-optimized': /slow|fast|cache|latency|memory|bottleneck|perf|optimize/i,
  'responsive-design': /responsive|mobile|screen|layout|breakpoint|media.query/i,
  'ui-design-quality': /ui|ux|component|style|design|visual|theme|accessibility/i,
}

// ── Skill file locations ─────────────────────────────────────────────────────
// Resolved relative to the repo root (two levels up from this file).
const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SKILL_DIR = join(REPO_ROOT, 'skills')

/** Result of loading a skill's prompt content. */
export type SkillPrompt = {
  name: string
  content: string
}

/**
 * Load the raw markdown content of a skill's prompt file.
 * Falls back silently — missing skills don't crash the turn.
 */
function loadSkillContent(name: string): string | null {
  try {
    const skillPath = join(SKILL_DIR, name, 'skill.md')
    const raw = readFileSync(skillPath, 'utf-8')
    // Strip frontmatter (everything between first --- and second ---)
    const content = raw.replace(/^---[\s\S]*?---\n?/, '').trim()
    return content || null
  } catch {
    return null
  }
}

/**
 * Classify a user message → list of matching skill names.
 * Returns skills sorted by trigger priority (first-match wins order).
 */
export function classifyTask(userMessage: string): string[] {
  const matches: string[] = []
  for (const [skill, pattern] of Object.entries(SKILL_TRIGGERS)) {
    if (pattern.test(userMessage)) {
      matches.push(skill)
    }
  }
  return matches
}

/**
 * Load prompt content for the given skill names.
 * Returns only skills that have a valid prompt file on disk.
 */
export function loadSkillPrompts(skillNames: string[]): SkillPrompt[] {
  const results: SkillPrompt[] = []
  for (const name of skillNames) {
    const content = loadSkillContent(name)
    if (content) {
      results.push({ name, content })
    }
  }
  return results
}

/**
 * Inject skill prompt content into the conversation context.
 * Returns a new array (does not mutate the original).
 *
 * Skills are injected as a single system-style message right before the
 * user's latest message so the model sees them as in-context instructions.
 */
export function injectSkillContext(
  messages: readonly any[],
  skillContent: string,
): any[] {
  if (!skillContent) return [...messages]
  return [
    ...messages.slice(0, -1),
    {
      type: 'user',
      content: [{ type: 'text', text: skillContent }],
      isMeta: true,
    },
    ...messages.slice(-1),
  ]
}
