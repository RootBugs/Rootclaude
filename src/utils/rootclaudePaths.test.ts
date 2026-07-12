import { afterEach, describe, expect, mock, test } from 'bun:test'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'fs'
import * as fsPromises from 'fs/promises'
import { homedir, tmpdir } from 'os'
import { join } from 'path'
import { acquireEnvMutex, releaseEnvMutex } from '../entrypoints/sdk/shared.js'

const originalEnv = { ...process.env }
const originalArgv = [...process.argv]

async function importFreshEnvUtils() {
  return import(`./envUtils.ts?ts=${Date.now()}-${Math.random()}`)
}

async function importFreshSettings() {
  return import(`./settings/settings.ts?ts=${Date.now()}-${Math.random()}`)
}

async function importFreshLocalInstaller() {
  return import(`./localInstaller.ts?ts=${Date.now()}-${Math.random()}`)
}

async function importFreshPlans() {
  return import(`./plans.ts?ts=${Date.now()}-${Math.random()}`)
}

afterEach(() => {
  try {
    process.env = { ...originalEnv }
    process.argv = [...originalArgv]
    mock.restore()
  } finally {
    releaseEnvMutex()
  }
})

describe('RootClaude paths', () => {
  test('defaults user config home to ~/.RootClaude', async () => {
    await acquireEnvMutex()
    delete process.env.RootClaude_CONFIG_DIR
    delete process.env.CLAUDE_CONFIG_DIR
    const { resolveClaudeConfigHomeDir } = await importFreshEnvUtils()

    expect(
      resolveClaudeConfigHomeDir({
        homeDir: homedir(),
      }),
    ).toBe(join(homedir(), '.RootClaude'))
  })

  test('hard-cuts user config home to ~/.RootClaude by default', async () => {
    await acquireEnvMutex()
    delete process.env.RootClaude_CONFIG_DIR
    delete process.env.CLAUDE_CONFIG_DIR
    const { resolveClaudeConfigHomeDir } = await importFreshEnvUtils()

    expect(
      resolveClaudeConfigHomeDir({
        homeDir: homedir(),
      }),
    ).toBe(join(homedir(), '.RootClaude'))
  })

  test('does not migrate legacy .claude config into .RootClaude', async () => {
    await acquireEnvMutex()
    const tempHome = mkdtempSync(join(tmpdir(), 'rootclaude-paths-test-'))
    try {
      mkdirSync(join(tempHome, '.claude', 'skills', 'legacy-skill'), {
        recursive: true,
      })
      writeFileSync(
        join(tempHome, '.claude', 'skills', 'legacy-skill', 'SKILL.md'),
        'legacy skill',
      )
      writeFileSync(join(tempHome, '.claude', 'settings.json'), '{}')
      writeFileSync(join(tempHome, '.claude.json'), '{"legacy":true}')
      writeFileSync(
        join(tempHome, '.claude-custom-oauth.json'),
        '{"custom":true}',
      )
      expect(existsSync(join(tempHome, '.RootClaude'))).toBe(false)
    } finally {
      rmSync(tempHome, { recursive: true, force: true })
    }
  })

  test('config home does not fall back to legacy .claude', async () => {
    await acquireEnvMutex()
    const tempHome = mkdtempSync(join(tmpdir(), 'rootclaude-paths-test-'))
    try {
      writeFileSync(join(tempHome, '.RootClaude'), 'not a directory')
      mkdirSync(join(tempHome, '.claude'), { recursive: true })
      mock.module('os', () => ({
        homedir: () => tempHome,
        tmpdir,
      }))
      delete process.env.RootClaude_CONFIG_DIR
      delete process.env.CLAUDE_CONFIG_DIR

      const { getClaudeConfigHomeDir } = await importFreshEnvUtils()

      expect(getClaudeConfigHomeDir()).toBe(join(tempHome, '.RootClaude'))
    } finally {
      rmSync(tempHome, { recursive: true, force: true })
    }
  })

  test('default plans directory uses ~/.RootClaude/plans', async () => {
    await acquireEnvMutex()
    delete process.env.RootClaude_CONFIG_DIR
    delete process.env.CLAUDE_CONFIG_DIR
    const { getDefaultPlansDirectory } = await importFreshPlans()

    expect(getDefaultPlansDirectory({ homeDir: homedir() })).toBe(
      join(homedir(), '.RootClaude', 'plans'),
    )
  })

  test('default plans directory respects explicit configDirEnv argument', async () => {
    await acquireEnvMutex()
    const { getDefaultPlansDirectory } = await importFreshPlans()

    expect(
      getDefaultPlansDirectory({ configDirEnv: '/tmp/custom-RootClaude' }),
    ).toBe(join('/tmp/custom-RootClaude', 'plans'))
  })

  test('default plans directory respects RootClaude_CONFIG_DIR', async () => {
    await acquireEnvMutex()
    process.env.RootClaude_CONFIG_DIR = '/tmp/preferred-RootClaude'
    delete process.env.CLAUDE_CONFIG_DIR
    const { getDefaultPlansDirectory } = await importFreshPlans()

    expect(getDefaultPlansDirectory()).toBe(
      join('/tmp/preferred-RootClaude', 'plans'),
    )
  })

  test('RootClaude_CONFIG_DIR wins for default plans directory', async () => {
    await acquireEnvMutex()
    process.env.RootClaude_CONFIG_DIR = '/tmp/preferred-RootClaude'
    process.env.CLAUDE_CONFIG_DIR = '/tmp/legacy-RootClaude'
    const { getDefaultPlansDirectory } = await importFreshPlans()

    expect(getDefaultPlansDirectory()).toBe(
      join('/tmp/preferred-RootClaude', 'plans'),
    )
  })

  test('default plans directory normalizes generated path to NFC', async () => {
    await acquireEnvMutex()
    const { getDefaultPlansDirectory } = await importFreshPlans()

    expect(
      getDefaultPlansDirectory({ homeDir: '/tmp/cafe\u0301' }),
    ).toBe(join('/tmp/caf\u00e9', '.RootClaude', 'plans'))
  })

  test('default plans directory normalizes explicit configDirEnv argument to NFC', async () => {
    await acquireEnvMutex()
    const { getDefaultPlansDirectory } = await importFreshPlans()

    expect(
      getDefaultPlansDirectory({ configDirEnv: '/tmp/cafe\u0301-RootClaude' }),
    ).toBe(join('/tmp/caf\u00e9-RootClaude', 'plans'))
  })

  test('ignores CLAUDE_CONFIG_DIR override when provided', async () => {
    await acquireEnvMutex()
    delete process.env.RootClaude_CONFIG_DIR
    process.env.CLAUDE_CONFIG_DIR = '/tmp/custom-RootClaude'
    mock.module('os', () => ({
      homedir: () => '/tmp/home',
      tmpdir,
    }))
    const { getClaudeConfigHomeDir } = await importFreshEnvUtils()

    expect(getClaudeConfigHomeDir()).toBe('/tmp/home/.RootClaude')
  })

  test('RootClaude_CONFIG_DIR overrides the default (issue #454)', async () => {
    await acquireEnvMutex()
    delete process.env.CLAUDE_CONFIG_DIR
    process.env.RootClaude_CONFIG_DIR = '/tmp/oc-config-only'
    const { getClaudeConfigHomeDir } = await importFreshEnvUtils()

    expect(getClaudeConfigHomeDir()).toBe('/tmp/oc-config-only')
  })

  test('RootClaude_CONFIG_DIR wins when both env vars are set with different values', async () => {
    await acquireEnvMutex()
    process.env.RootClaude_CONFIG_DIR = '/tmp/oc-wins'
    process.env.CLAUDE_CONFIG_DIR = '/tmp/legacy-loses'
    const { getClaudeConfigHomeDir } = await importFreshEnvUtils()

    expect(getClaudeConfigHomeDir()).toBe('/tmp/oc-wins')
  })

  test('CLAUDE_CONFIG_DIR is ignored when RootClaude_CONFIG_DIR is unset', async () => {
    await acquireEnvMutex()
    delete process.env.RootClaude_CONFIG_DIR
    process.env.CLAUDE_CONFIG_DIR = '/tmp/legacy-only'
    const { getClaudeConfigHomeDir } = await importFreshEnvUtils()

    expect(getClaudeConfigHomeDir()).toBe(join(homedir(), '.RootClaude'))
  })

  test('empty RootClaude_CONFIG_DIR does not fall through to CLAUDE_CONFIG_DIR', async () => {
    await acquireEnvMutex()
    process.env.RootClaude_CONFIG_DIR = ''
    process.env.CLAUDE_CONFIG_DIR = '/tmp/legacy-fallback'
    const { getClaudeConfigHomeDir } = await importFreshEnvUtils()

    expect(getClaudeConfigHomeDir()).toBe(join(homedir(), '.RootClaude'))
  })

  test('resolveConfigDirEnv ignores CLAUDE_CONFIG_DIR without warning', async () => {
    await acquireEnvMutex()
    const { resolveConfigDirEnv, __resetConfigDirEnvWarningForTesting } =
      await importFreshEnvUtils()
    __resetConfigDirEnvWarningForTesting()

    const warnings: string[] = []
    const result = resolveConfigDirEnv({
      RootClaudeConfigDir: '/a',
      legacyConfigDir: '/b',
      warn: m => warnings.push(m),
    })

    expect(result).toBe('/a')
    expect(warnings.length).toBe(0)

    resolveConfigDirEnv({
      RootClaudeConfigDir: '/x',
      legacyConfigDir: '/y',
      warn: m => warnings.push(m),
    })
    expect(warnings.length).toBe(0)
  })

  test('resolveConfigDirEnv ignores legacy env for silent and warning callers', async () => {
    await acquireEnvMutex()
    const { resolveConfigDirEnv, __resetConfigDirEnvWarningForTesting } =
      await importFreshEnvUtils()
    __resetConfigDirEnvWarningForTesting()

    expect(
      resolveConfigDirEnv({
        RootClaudeConfigDir: '/silent-open',
        legacyConfigDir: '/silent-legacy',
      }),
    ).toBe('/silent-open')

    const warnings: string[] = []
    expect(
      resolveConfigDirEnv({
        RootClaudeConfigDir: '/warn-open',
        legacyConfigDir: '/warn-legacy',
        warn: m => warnings.push(m),
      }),
    ).toBe('/warn-open')
    expect(warnings.length).toBe(0)
  })

  test('resolveConfigDirEnv does not warn when both env vars agree', async () => {
    await acquireEnvMutex()
    const { resolveConfigDirEnv, __resetConfigDirEnvWarningForTesting } =
      await importFreshEnvUtils()
    __resetConfigDirEnvWarningForTesting()

    const warnings: string[] = []
    const result = resolveConfigDirEnv({
      RootClaudeConfigDir: '/same',
      legacyConfigDir: '/same',
      warn: m => warnings.push(m),
    })

    expect(result).toBe('/same')
    expect(warnings).toEqual([])
  })

  test('resolveConfigDirEnv returns undefined when neither env var is set', async () => {
    await acquireEnvMutex()
    const { resolveConfigDirEnv } = await importFreshEnvUtils()

    expect(
      resolveConfigDirEnv({
        RootClaudeConfigDir: undefined,
        legacyConfigDir: undefined,
      }),
    ).toBeUndefined()
  })

  test('project and local settings paths use .RootClaude', async () => {
    await acquireEnvMutex()
    const { getRelativeSettingsFilePathForSource } = await importFreshSettings()

    expect(getRelativeSettingsFilePathForSource('projectSettings')).toBe(
      '.RootClaude/settings.json',
    )
    expect(getRelativeSettingsFilePathForSource('localSettings')).toBe(
      '.RootClaude/settings.local.json',
    )
  })

  test('local installer uses rootclaude wrapper path', async () => {
    await acquireEnvMutex()
    process.env.RootClaude_CONFIG_DIR = join(homedir(), '.RootClaude')
    delete process.env.CLAUDE_CONFIG_DIR
    const { getLocalClaudePath } = await importFreshLocalInstaller()

    expect(getLocalClaudePath()).toBe(
      join(homedir(), '.RootClaude', 'local', 'rootclaude'),
    )
  })

  test('local installation detection matches .RootClaude path', async () => {
    await acquireEnvMutex()
    const { isManagedLocalInstallationPath } =
      await importFreshLocalInstaller()

    expect(
      isManagedLocalInstallationPath(
        `${join(homedir(), '.RootClaude', 'local')}/node_modules/.bin/rootclaude`,
      ),
    ).toBe(true)
  })

  test('local installation detection ignores legacy .claude path', async () => {
    await acquireEnvMutex()
    const { isManagedLocalInstallationPath } =
      await importFreshLocalInstaller()

    expect(
      isManagedLocalInstallationPath(
        `${join(homedir(), '.claude', 'local')}/node_modules/.bin/rootclaude`,
      ),
    ).toBe(false)
  })

  test('candidate local install dirs include only rootclaude path', async () => {
    await acquireEnvMutex()
    const { getCandidateLocalInstallDirs } = await importFreshLocalInstaller()

    expect(
      getCandidateLocalInstallDirs({
        configHomeDir: join(homedir(), '.RootClaude'),
      }),
    ).toEqual([
      join(homedir(), '.RootClaude', 'local'),
    ])
  })

  test('legacy local installs are ignored even when they expose the claude binary', async () => {
    await acquireEnvMutex()
    mock.module('fs/promises', () => ({
      ...fsPromises,
      access: async (path: string) => {
        if (
          path === join(homedir(), '.claude', 'local', 'node_modules', '.bin', 'claude')
        ) {
          return
        }
        throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
      },
    }))

    const { getDetectedLocalInstallDir, localInstallationExists } =
      await importFreshLocalInstaller()

    expect(await localInstallationExists()).toBe(false)
    expect(await getDetectedLocalInstallDir()).toBeNull()
  })
})
