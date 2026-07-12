import { feature } from 'bun:bundle'
import memoize from 'lodash-es/memoize.js'
import {
  getAdditionalDirectoriesForClaudeMd,
  setCachedClaudeMdContent,
} from './bootstrap/state.js'
import { getLocalISODate } from './constants/common.js'
import {
  filterInjectedMemoryFiles,
  getClaudeMds,
  getMemoryFiles,
} from './utils/claudemd.js'
import { logForDiagnosticsNoPII } from './utils/diagLogs.js'
import { isBareMode, isEnvTruthy } from './utils/envUtils.js'
import { execFileNoThrow } from './utils/execFileNoThrow.js'
import { getBranch, getDefaultBranch, getIsGit, gitExe } from './utils/git.js'
import { shouldIncludeGitInstructions } from './utils/gitSettings.js'
import { logError } from './utils/log.js'
import { getCwd } from './utils/cwd.js'
import type { RepoMapResult } from './context/repoMap/index.js'
import { readFile } from 'fs/promises'
import { join } from 'path'

const MAX_STATUS_CHARS = 2000
const REPO_MAP_CONTEXT_TIMEOUT_MS = 5000
const REPO_MAP_TIMEOUT = Symbol('repo_map_timeout')
const REPO_MAP_CANCELLED = Symbol('repo_map_cancelled')

type RepoMapBuildFn = (options: {
  root: string
  maxTokens: number
  shouldContinue?: () => void
}) => Promise<RepoMapResult>

export async function runRepoMapBuildWithTimeout({
  buildRepoMap,
  root,
  maxTokens,
  timeoutMs,
}: {
  buildRepoMap: RepoMapBuildFn
  root: string
  maxTokens: number
  timeoutMs: number
}): Promise<{ result: RepoMapResult | null; timedOut: boolean }> {
  let timeout: ReturnType<typeof setTimeout> | undefined
  let timedOut = false
  const result = await Promise.race([
    buildRepoMap({
      root,
      maxTokens,
      shouldContinue: () => {
        if (timedOut) throw REPO_MAP_CANCELLED
      },
    }).catch(err => {
      if (err === REPO_MAP_CANCELLED) return REPO_MAP_TIMEOUT
      throw err
    }),
    new Promise<typeof REPO_MAP_TIMEOUT>(resolve => {
      timeout = setTimeout(
        () => {
          timedOut = true
          resolve(REPO_MAP_TIMEOUT)
        },
        timeoutMs,
      )
    }),
  ]).finally(() => {
    if (timeout) clearTimeout(timeout)
  }) as RepoMapResult | typeof REPO_MAP_TIMEOUT

  if (result === REPO_MAP_TIMEOUT) {
    return { result: null, timedOut: true }
  }
  return { result, timedOut: false }
}

// System prompt injection for cache breaking (internal-only, ephemeral debugging state)
let systemPromptInjection: string | null = null

export function getSystemPromptInjection(): string | null {
  return systemPromptInjection
}

export function setSystemPromptInjection(value: string | null): void {
  systemPromptInjection = value
  // Clear context caches immediately when injection changes
  getUserContext.cache.clear?.()
  getSystemContext.cache.clear?.()
  getRepoMapContext.cache.clear?.()
}

export const getGitStatus = memoize(async (): Promise<string | null> => {
  if (process.env.NODE_ENV === 'test') {
    // Avoid cycles in tests
    return null
  }

  const startTime = Date.now()
  logForDiagnosticsNoPII('info', 'git_status_started')

  const isGitStart = Date.now()
  const isGit = await getIsGit()
  logForDiagnosticsNoPII('info', 'git_is_git_check_completed', {
    duration_ms: Date.now() - isGitStart,
    is_git: isGit,
  })

  if (!isGit) {
    logForDiagnosticsNoPII('info', 'git_status_skipped_not_git', {
      duration_ms: Date.now() - startTime,
    })
    return null
  }

  try {
    const gitCmdsStart = Date.now()
    const [branch, mainBranch, status, log, userName] = await Promise.all([
      getBranch(),
      getDefaultBranch(),
      execFileNoThrow(gitExe(), ['--no-optional-locks', 'status', '--short'], {
        preserveOutputOnError: false,
      }).then(({ stdout }) => stdout.trim()),
      execFileNoThrow(
        gitExe(),
        ['--no-optional-locks', 'log', '--oneline', '-n', '5'],
        {
          preserveOutputOnError: false,
        },
      ).then(({ stdout }) => stdout.trim()),
      execFileNoThrow(gitExe(), ['config', 'user.name'], {
        preserveOutputOnError: false,
      }).then(({ stdout }) => stdout.trim()),
    ])

    logForDiagnosticsNoPII('info', 'git_commands_completed', {
      duration_ms: Date.now() - gitCmdsStart,
      status_length: status.length,
    })

    // Check if status exceeds character limit
    const truncatedStatus =
      status.length > MAX_STATUS_CHARS
        ? status.substring(0, MAX_STATUS_CHARS) +
          '\n... (truncated because it exceeds 2k characters. If you need more information, run "git status" using BashTool)'
        : status

    logForDiagnosticsNoPII('info', 'git_status_completed', {
      duration_ms: Date.now() - startTime,
      truncated: status.length > MAX_STATUS_CHARS,
    })

    return [
      `This is the git status at the start of the conversation. Note that this status is a snapshot in time, and will not update during the conversation.`,
      `Current branch: ${branch}`,
      `Main branch (you will usually use this for PRs): ${mainBranch}`,
      ...(userName ? [`Git user: ${userName}`] : []),
      `Status:\n${truncatedStatus || '(clean)'}`,
      `Recent commits:\n${log}`,
    ].join('\n\n')
  } catch (error) {
    logForDiagnosticsNoPII('error', 'git_status_failed', {
      duration_ms: Date.now() - startTime,
    })
    logError(error)
    return null
  }
})

export const getRepoMapContext = memoize(
  async (): Promise<string | null> => {
    // Enable via compile-time feature flag OR runtime env var.
    // The runtime env var lets users enable auto-injection without rebuilding.
    const runtimeEnabled = isEnvTruthy(process.env.REPO_MAP)
    if (!feature('REPO_MAP') && !runtimeEnabled) return null
    if (isBareMode()) return null
    if (isEnvTruthy(process.env.CLAUDE_CODE_REMOTE)) return null

    try {
      const startTime = Date.now()
      logForDiagnosticsNoPII('info', 'repo_map_started')
      const { buildRepoMap } = await import('./context/repoMap/index.js')
      const { result, timedOut } = await runRepoMapBuildWithTimeout({
        buildRepoMap,
        root: getCwd(),
        maxTokens: 1024,
        timeoutMs: REPO_MAP_CONTEXT_TIMEOUT_MS,
      })
      if (timedOut) {
        logForDiagnosticsNoPII('warn', 'repo_map_timeout', {
          duration_ms: Date.now() - startTime,
        })
        getRepoMapContext.cache.clear?.()
        getSystemContext.cache.clear?.()
        return null
      }
      if (result === null) return null
      if (!result.map || result.map.length === 0) {
        return null
      }
      logForDiagnosticsNoPII('info', 'repo_map_completed', {
        duration_ms: Date.now() - startTime,
        token_count: result.tokenCount,
        file_count: result.fileCount,
        cache_hit: result.cacheHit,
      })
      return `This is a structural map of the repository, ranked by importance. Use it to understand the codebase architecture.\n\n${result.map}`
    } catch (err) {
      logForDiagnosticsNoPII('warn', 'repo_map_failed', {
        error: String(err),
      })
      getRepoMapContext.cache.clear?.()
      getSystemContext.cache.clear?.()
      return null
    }
  },
)

/**
 * This context is prepended to each conversation, and cached for the duration of the conversation.
 */
export const getSystemContext = memoize(
  async (): Promise<{
    [k: string]: string
  }> => {
    const startTime = Date.now()
    logForDiagnosticsNoPII('info', 'system_context_started')

    const gitStatusPromise =
      isEnvTruthy(process.env.CLAUDE_CODE_REMOTE) ||
      !shouldIncludeGitInstructions()
        ? Promise.resolve(null)
        : getGitStatus()

    const [gitStatus, repoMap] = await Promise.all([
      gitStatusPromise,
      getRepoMapContext(),
    ])

    // Include system prompt injection if set (for cache breaking, internal-only)
    const injection = feature('BREAK_CACHE_COMMAND')
      ? getSystemPromptInjection()
      : null

    logForDiagnosticsNoPII('info', 'system_context_completed', {
      duration_ms: Date.now() - startTime,
      has_git_status: gitStatus !== null,
      has_repo_map: repoMap !== null,
      has_injection: injection !== null,
    })

    return {
      ...(gitStatus && { gitStatus }),
      ...(repoMap && { repoMap }),
      ...(feature('BREAK_CACHE_COMMAND') && injection
        ? {
            cacheBreaker: `[CACHE_BREAKER: ${injection}]`,
          }
        : {}),
    }
  },
)

/**
 * Build project-level context from package.json, README, and key config files.
 * Returns a human-readable summary or null if no project metadata is found.
 */
async function buildProjectContext(cwd: string): Promise<string | null> {
  const parts: string[] = []

  // Read package.json
  try {
    const pkgRaw = await readFile(join(cwd, 'package.json'), 'utf-8')
    const pkg = JSON.parse(pkgRaw)
    const lines: string[] = []
    if (pkg.name) lines.push(`Project: ${pkg.name}${pkg.version ? ` v${pkg.version}` : ''}`)
    if (pkg.description) lines.push(`Description: ${pkg.description}`)
    if (pkg.scripts) {
      const scripts = Object.keys(pkg.scripts)
      if (scripts.length > 0) {
        lines.push(`Available scripts: ${scripts.slice(0, 10).join(', ')}${scripts.length > 10 ? '...' : ''}`)
      }
    }
    if (pkg.dependencies) {
      const deps = Object.keys(pkg.dependencies)
      if (deps.length > 0) lines.push(`Dependencies (${deps.length}): ${deps.slice(0, 15).join(', ')}${deps.length > 15 ? '...' : ''}`)
    }
    if (pkg.devDependencies) {
      const devDeps = Object.keys(pkg.devDependencies)
      if (devDeps.length > 0) lines.push(`Dev dependencies (${devDeps.length}): ${devDeps.slice(0, 10).join(', ')}${devDeps.length > 10 ? '...' : ''}`)
    }
    if (lines.length > 0) parts.push(lines.join('\n'))
  } catch { /* no package.json */ }

  // Read README
  for (const name of ['README.md', 'README', 'Readme.md']) {
    try {
      const content = await readFile(join(cwd, name), 'utf-8')
      const summary = content.replace(/^#+\s*/, '').split('\n\n').find(p => p.trim().length > 20) ?? ''
      parts.push(`README: ${summary.slice(0, 400).trim()}`)
      break
    } catch { /* try next */ }
  }

  // Detect language/framework from key config files
  const configChecks: Record<string, string> = {
    'tsconfig.json': 'TypeScript',
    'tsconfig.app.json': 'TypeScript (app)',
    'vite.config.ts': 'Vite',
    'next.config.js': 'Next.js',
    'next.config.ts': 'Next.js',
    'nuxt.config.ts': 'Nuxt',
    'svelte.config.js': 'Svelte',
    'angular.json': 'Angular',
    'Cargo.toml': 'Rust/Cargo',
    'go.mod': 'Go',
    'pyproject.toml': 'Python',
    'Gemfile': 'Ruby',
    'composer.json': 'PHP',
  }
  for (const [file, label] of Object.entries(configChecks)) {
    try {
      await readFile(join(cwd, file), 'utf-8')
      parts.push(`Framework: ${label}`)
      break
    } catch { /* not this config */ }
  }

  return parts.length > 0 ? parts.join('\n\n') : null
}

/**
 * This context is prepended to each conversation, and cached for the duration of the conversation.
 */
export const getUserContext = memoize(
  async (): Promise<{
    [k: string]: string
  }> => {
    const startTime = Date.now()
    logForDiagnosticsNoPII('info', 'user_context_started')

    // CLAUDE_CODE_DISABLE_CLAUDE_MDS: hard off, always.
    // --bare: skip auto-discovery (cwd walk), BUT honor explicit --add-dir.
    // --bare means "skip what I didn't ask for", not "ignore what I asked for".
    const shouldDisableClaudeMd =
      isEnvTruthy(process.env.CLAUDE_CODE_DISABLE_CLAUDE_MDS) ||
      (isBareMode() && getAdditionalDirectoriesForClaudeMd().length === 0)
    // Await the async I/O (readFile/readdir directory walk) so the event
    // loop yields naturally at the first fs.readFile.
    const claudeMd = shouldDisableClaudeMd
      ? null
      : getClaudeMds(filterInjectedMemoryFiles(await getMemoryFiles()))
    // Cache for the auto-mode classifier (yoloClassifier.ts reads this
    // instead of importing claudemd.ts directly, which would create a
    // cycle through permissions/filesystem → permissions → yoloClassifier).
    setCachedClaudeMdContent(claudeMd || null)

    logForDiagnosticsNoPII('info', 'user_context_completed', {
      duration_ms: Date.now() - startTime,
      claudemd_length: claudeMd?.length ?? 0,
      claudemd_disabled: Boolean(shouldDisableClaudeMd),
    })

    return {
      ...(claudeMd && { claudeMd }),
      currentDate: `Today's date is ${getLocalISODate()}.`,
      ...(await buildProjectContext(getCwd()).then(ctx => ctx ? { projectContext: ctx } : {})),
    }
  },
)
