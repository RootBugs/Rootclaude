import { env } from '../utils/env.js'

// The former is better vertically aligned, but isn't usually supported on Windows/Linux
export const BLACK_CIRCLE = env.platform === 'darwin' ? 'âº' : 'â—'
export const BULLET_OPERATOR = 'âˆ™'
// Historically 'âœ»' (hence the name); now 'â—Ž' to match the dot-pulse spinner
// glyph family (Â· âˆ˜ â—‹ â—Ž â—‰ â—) introduced with the RootClaude rebrand.
export const TEARDROP_ASTERISK = 'â—Ž'
export const UP_ARROW = '\u2191' // â†‘ - used for opus 1m merge notice
export const DOWN_ARROW = '\u2193' // â†“ - used for scroll hint
export const LIGHTNING_BOLT = 'â†¯' // \u21af - used for fast mode indicator
export const EFFORT_LOW = 'â—‹' // \u25cb - effort level: low
export const EFFORT_MEDIUM = 'â—' // \u25d0 - effort level: medium
export const EFFORT_HIGH = 'â—' // \u25cf - effort level: high
export const EFFORT_MAX = 'â—‰' // \u25c9 - effort level: max (Opus 4.8/4.7/4.6 only)

// Media/trigger status indicators
export const PLAY_ICON = '\u25b6' // â–¶
export const PAUSE_ICON = '\u23f8' // â¸

// MCP subscription indicators
export const REFRESH_ARROW = '\u21bb' // â†» - used for resource update indicator
export const CHANNEL_ARROW = '\u2190' // â† - inbound channel message indicator
export const INJECTED_ARROW = '\u2192' // â†’ - cross-session injected message indicator
export const FORK_GLYPH = '\u2442' // â‘‚ - fork directive indicator

// Review status indicators (ultrareview diamond states)
export const DIAMOND_OPEN = '\u25c7' // â—‡ - running
export const DIAMOND_FILLED = '\u25c6' // â—† - completed/failed
export const REFERENCE_MARK = '\u203b' // â€» - komejirushi, away-summary recap marker

// Issue flag indicator
export const FLAG_ICON = '\u2691' // âš‘ - used for issue flag banner

// Blockquote indicator
export const BLOCKQUOTE_BAR = '\u258e' // â–Ž - left one-quarter block, used as blockquote line prefix
export const HEAVY_HORIZONTAL = '\u2501' // â” - heavy box-drawing horizontal

// Bridge status indicators
export const BRIDGE_SPINNER_FRAMES = [
  '\u00b7|\u00b7',
  '\u00b7/\u00b7',
  '\u00b7\u2014\u00b7',
  '\u00b7\\\u00b7',
]
export const BRIDGE_READY_INDICATOR = '\u00b7\u2714\ufe0e\u00b7'
export const BRIDGE_FAILED_INDICATOR = '\u00d7'
