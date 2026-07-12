import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

// ── Types ────────────────────────────────────────────────────────────────────

export type ToolExecutionRecord = {
  toolName: string
  filePath?: string
  success: boolean
  error?: string
}

export type VerificationResult = {
  passed: boolean
  errors: string[]
  details: {
    build?: { passed: boolean; output: string }
    typecheck?: { passed: boolean; output: string }
    lint?: { passed: boolean; output: string }
    test?: { passed: boolean; output: string }
  }
}

// ── Core verification logic ──────────────────────────────────────────────────

/**
 * Determine if verification should run based on the tools that executed.
 * Triggers on 2+ file writes/edits, or any write + test combination.
 */
export function shouldVerify(executedTools: ToolExecutionRecord[]): boolean {
  const fileWrites = executedTools.filter(
    t =>
      (t.toolName === 'Write' || t.toolName === 'Edit' || t.toolName === 'FileWriteTool' || t.toolName === 'FileEditTool') &&
      t.filePath &&
      !t.filePath.includes('node_modules'),
  )
  if (fileWrites.length >= 2) return true

  const hasFileChange = fileWrites.length > 0
  const hasTestRun = executedTools.some(
    t => t.toolName === 'Bash' && t.filePath?.includes('test'),
  )
  return hasFileChange && hasTestRun
}

/**
 * Run project-specific verification checks based on what files were modified.
 * - Always runs build and typecheck
 * - Runs lint if the project has a lint config
 * - Runs tests only if test files were modified
 */
export async function runVerification(
  cwd: string,
  modifiedFiles: string[],
  timeoutMs = 60_000,
): Promise<VerificationResult> {
  const errors: string[] = []
  const details: VerificationResult['details'] = {}

  // 1. Build check ────────────────────────────────────────────────────────────
  if (hasScript(cwd, 'build')) {
    const buildResult = runCommand('npm run build 2>&1', cwd, timeoutMs)
    details.build = {
      passed: buildResult.exitCode === 0,
      output: buildResult.output,
    }
    if (!details.build.passed) {
      errors.push(`Build failed:\n${truncateOutput(buildResult.output)}`)
    }
  }

  // 2. TypeScript check ───────────────────────────────────────────────────────
  const hasTsConfig = existsSync(join(cwd, 'tsconfig.json'))
  if (hasTsConfig) {
    const typeResult = runCommand('npx tsc --noEmit 2>&1', cwd, timeoutMs)
    details.typecheck = {
      passed: typeResult.exitCode === 0,
      output: typeResult.output,
    }
    if (!details.typecheck.passed) {
      errors.push(`Typecheck failed:\n${truncateOutput(typeResult.output)}`)
    }
  }

  // 3. Lint check ─────────────────────────────────────────────────────────────
  if (hasScript(cwd, 'lint') || hasConfig(cwd, '.eslintrc', '.eslintrc.json', '.eslintrc.js')) {
    const lintResult = runCommand('npm run lint 2>&1', cwd, timeoutMs)
    details.lint = {
      passed: lintResult.exitCode === 0,
      output: lintResult.output,
    }
    if (!details.lint.passed) {
      errors.push(`Lint failed:\n${truncateOutput(lintResult.output)}`)
    }
  }

  // 4. Test check (only if test files were modified) ──────────────────────────
  const testFilesModified = modifiedFiles.some(f => f.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/))
  if (testFilesModified && (hasScript(cwd, 'test') || hasScript(cwd, 'test:run'))) {
    const testCmd = hasScript(cwd, 'test:run') ? 'npm run test:run 2>&1' : 'npm test 2>&1'
    const testResult = runCommand(testCmd, cwd, timeoutMs)
    details.test = {
      passed: testResult.exitCode === 0,
      output: testResult.output,
    }
    if (!details.test.passed) {
      errors.push(`Tests failed:\n${truncateOutput(testResult.output)}`)
    }
  }

  return { passed: errors.length === 0, errors, details }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type CommandResult = { exitCode: number; output: string }

function runCommand(cmd: string, cwd: string, timeoutMs: number): CommandResult {
  try {
    const output = execSync(cmd, {
      cwd,
      timeout: timeoutMs,
      shell: true,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return { exitCode: 0, output: output.trim() }
  } catch (err: any) {
    return {
      exitCode: err.status ?? 1,
      output: (err.stdout || '') + '\n' + (err.stderr || '') || err.message,
    }
  }
}

function hasScript(cwd: string, scriptName: string): boolean {
  try {
    const pkg = JSON.parse(
      execSync('cat package.json 2>/dev/null', { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).toString(),
    )
    return !!(pkg.scripts && pkg.scripts[scriptName])
  } catch {
    return false
  }
}

function hasConfig(cwd: string, ...filenames: string[]): boolean {
  return filenames.some(f => existsSync(join(cwd, f)))
}

function truncateOutput(output: string, maxLines = 40): string {
  const lines = output.split('\n')
  if (lines.length <= maxLines) return output
  return lines.slice(0, maxLines).join('\n') + `\n... (${lines.length - maxLines} more lines)`
}
