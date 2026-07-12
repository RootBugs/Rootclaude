import { describe, expect, test } from 'bun:test'
import { hookSourceDescriptionDisplayString } from './hooksSettings.js'

describe('hookSourceDescriptionDisplayString', () => {
  test('uses the canonical RootClaude plugin path for plugin hooks', () => {
    const description = hookSourceDescriptionDisplayString('pluginHook')

    expect(description).toBe(
      'Plugin hooks (~/.RootClaude/plugins/*/hooks/hooks.json)',
    )
    expect(description).not.toContain('~/.claude/')
  })
})
