/**
 * RootClaude brand identity — single source of truth for the product name,
 * tagline, accent color, and wordmark art used across the TUI.
 *
 * The accent is RootClaude red. Theme entries derived from it MUST stay
 * in `rgb(r,g,b)` form (never hex): the spinner's shimmer/stall interpolation
 * parses theme values with `parseRGB`, which only matches `rgb(...)` strings.
 */

export const BRAND_NAME = 'RootClaude'

export const BRAND_TAGLINE = 'Root terminal for any LLM'

/** RootClaude red (#ef4444) in the rgb() form required by theme consumers. */
export const BRAND_ACCENT_RGB = 'rgb(239,68,68)'

/**
 * Premium ASCII art logo using ░▒▓█ block characters.
 * Rendered in terminal with gradient shading effect.
 */
export const ASCII_LOGO = [
  '░▒▓███████▓▒░ ░▒▓██████▓▒░ ░▒▓██████▓▒░▒▓████████▓▒░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░ ░▒▓███████▓▒░',
  '░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░',
  '░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░',
  '░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒▒▓███▓▒░░▒▓██████▓▒░',
  '░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░',
  '░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░',
  '░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░ ░▒▓██████▓▒░  ░▒▓█▓▒░   ░▒▓███████▓▒░ ░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓███████▓▒░',
] as const

/**
 * Two-row Unicode half-block wordmark, split so the two halves can be
 * rendered in different accent shades. Block characters (█ ▄ ▀) render
 * correctly in Apple Terminal. Rendered side by side with a 1-col gap:
 *
 *   █▀█ █▀█ █▀▀ █▄ █ █ █▀▀ █   ▄▀█ █ █ █ █▀▄ █▀▀
 *   █▄█ █▀▀ █▄█ █ ▀█ █ █▄█ █▄█ █▀█ █▄█ █ ▀█ █▄█
 */
export const WORDMARK_ROOT = [
  '█▀█ █▀█ █▀▀ █▄ █',
  '█▄█ █▀▀ █▄█ █ ▀█',
] as const

export const WORDMARK_CLAUDE = [
  '█▀▀ █   ▄▀█ █ █ █▀▄ █▀▀',
  '█▄█ █▄█ █▀█ █▄█ █ ▀█ █▄█',
] as const

/** Rendered width of the full wordmark: root half + 1-col gap + claude half. */
export const WORDMARK_WIDTH =
  WORDMARK_ROOT[0].length + 1 + WORDMARK_CLAUDE[0].length