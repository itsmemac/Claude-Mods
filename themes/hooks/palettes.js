// The themes. One entry per theme: a palette, plus the shape of the usage bar.
// scripts/build-themes.mjs reads this file to write themes/<slug>.json (the colour theme
// for the terminal's /theme), the preview images and the README table, so they never drift.

/**
 * @typedef {{
 *   label: string, accent: string, accent2: string, ok: string, warn: string, crit: string,
 *   violet: string, dim: string, faint: string, track: string, text: string, userBg: string,
 *   panel: string, border: 'round' | 'single' | 'double' | 'bold' | 'dashed' | null,
 *   marks: [string, string] | null, segments: number, gap?: 0 | 1,
 *   icons: [string, string, string], spinner: string, shape: string, description: string
 * }} Theme
 *
 * marks: a glyph pair (filled, empty) drawn once per block, or null for coloured blocks.
 * segments: how many blocks make the bar; 1 draws one solid bar. gap: cells between blocks.
 */

/** @type {Record<string, Theme>} */
export const THEMES = {
  classic: {
    label: 'Classic', accent: '#d97757', accent2: '#8aa4c8', ok: '#4eba65', warn: '#ffc107', crit: '#ff6b80',
    violet: '#af87ff', dim: '#888888', faint: '#444444', track: '#505050', text: '#e6e6e6',
    userBg: '#262624', panel: '#1f1f1e', border: 'round', marks: null, segments: 12, gap: 1,
    icons: ['◉', '◷', '◈'], spinner: '✻', shape: 'coloured blocks',
    description: 'Claude orange on charcoal with green, amber and rose status colours.',
  },
  cyberpunk: {
    label: 'Cyberpunk', accent: '#fcee0a', accent2: '#00f0ff', ok: '#00f0ff', warn: '#fcee0a', crit: '#ff003c',
    violet: '#b967ff', dim: '#8a8a5c', faint: '#2a2a1f', track: '#6b6b4a', text: '#fffde0',
    userBg: '#1c1c0e', panel: '#12120a', border: 'bold', marks: ['▰', '▱'], segments: 10,
    icons: ['⚡', '◷', '☢'], spinner: '⚡', shape: '`▰▱` slabs',
    description: 'Yellow and cyan on near-black, hot red alarms.',
  },
  neon: {
    label: 'Neon', accent: '#ff2bd6', accent2: '#00f0ff', ok: '#39ff14', warn: '#ffe600', crit: '#ff2b55',
    violet: '#bd5cff', dim: '#7a7aa8', faint: '#3b2a5a', track: '#5a3f8a', text: '#f0f0ff',
    userBg: '#1a1030', panel: '#120a24', border: 'dashed', marks: ['◉', '○'], segments: 10,
    icons: ['✦', '◷', '✧'], spinner: '✦', shape: '`◉○` dots',
    description: 'Magenta and cyan on deep purple, acid green for success, hot red for errors.',
  },
  ocean: {
    label: 'Ocean', accent: '#4fd1c5', accent2: '#63b3ed', ok: '#4fd1c5', warn: '#63b3ed', crit: '#f6ad55',
    violet: '#9f7aea', dim: '#718096', faint: '#1a365d', track: '#3b6ea8', text: '#e6f4ff',
    userBg: '#0f2a47', panel: '#0b1d33', border: 'round', marks: ['▬', '·'], segments: 16,
    icons: ['≈', '◷', '◈'], spinner: '≈', shape: '`▬·` waterline',
    description: 'Teal and sky blue on deep navy, amber for the warnings.',
  },
  sunset: {
    label: 'Sunset', accent: '#f6ad55', accent2: '#ed64a6', ok: '#f6ad55', warn: '#ed64a6', crit: '#e53e3e',
    violet: '#b794f4', dim: '#a0826d', faint: '#4a2c2a', track: '#7a4a40', text: '#fff5eb',
    userBg: '#2a1620', panel: '#1f1018', border: 'round', marks: ['◆', '◇'], segments: 10,
    icons: ['☀', '◷', '❂'], spinner: '☀', shape: '`◆◇` diamonds',
    description: 'Orange to pink to red on a dark plum background.',
  },
  forest: {
    label: 'Forest', accent: '#68d391', accent2: '#9ae6b4', ok: '#68d391', warn: '#ecc94b', crit: '#fc8181',
    violet: '#b794f4', dim: '#6b8f7a', faint: '#22543d', track: '#2f6b4f', text: '#e6f5ea',
    userBg: '#12281d', panel: '#0b1a12', border: 'single', marks: ['■', '□'], segments: 12,
    icons: ['❖', '◷', '✿'], spinner: '❖', shape: '`■□` squares',
    description: 'Greens and mint on dark moss, yellow and coral for the warnings.',
  },
  dracula: {
    label: 'Dracula', accent: '#bd93f9', accent2: '#8be9fd', ok: '#50fa7b', warn: '#f1fa8c', crit: '#ff5555',
    violet: '#ff79c6', dim: '#6272a4', faint: '#44475a', track: '#6272a4', text: '#f8f8f2',
    userBg: '#282a36', panel: '#21222c', border: 'round', marks: ['▮', '▯'], segments: 12,
    icons: ['◆', '◷', '◇'], spinner: '◆', shape: '`▮▯` pills',
    description: 'The Dracula palette: purple accent, cyan, green, pink.',
  },
  nord: {
    label: 'Nord', accent: '#88c0d0', accent2: '#81a1c1', ok: '#a3be8c', warn: '#ebcb8b', crit: '#bf616a',
    violet: '#b48ead', dim: '#7b88a1', faint: '#3b4252', track: '#4c566a', text: '#eceff4',
    userBg: '#2e3440', panel: '#242933', border: 'double', marks: ['■', '□'], segments: 12,
    icons: ['❄', '◷', '◈'], spinner: '❄', shape: '`■□` squares',
    description: 'The Nord palette: frost blues with sage, sand and rust.',
  },
  gruvbox: {
    label: 'Gruvbox', accent: '#fabd2f', accent2: '#8ec07c', ok: '#b8bb26', warn: '#fe8019', crit: '#fb4934',
    violet: '#d3869b', dim: '#928374', faint: '#504945', track: '#665c54', text: '#ebdbb2',
    userBg: '#32302f', panel: '#1d2021', border: 'single', marks: ['■', '▪'], segments: 20,
    icons: ['▣', '◷', '▤'], spinner: '▣', shape: 'fine `■▪` bar',
    description: 'Retro warm: amber, olive, orange on a dark brown.',
  },
  synthwave: {
    label: 'Synthwave', accent: '#ff6ac1', accent2: '#36f9f6', ok: '#72f1b8', warn: '#fede5d', crit: '#fe4450',
    violet: '#b893ce', dim: '#8a7fb0', faint: '#2b213a', track: '#5b4a7a', text: '#f4eeff',
    userBg: '#241b2f', panel: '#1a1423', border: 'bold', marks: ['▶', '▷'], segments: 8,
    icons: ['♪', '◷', '♫'], spinner: '♪', shape: '`▶▷` arrows',
    description: 'Hot pink and cyan on dusk purple, mint to yellow to red.',
  },
  candy: {
    label: 'Candy', accent: '#ff79c6', accent2: '#7ee8fa', ok: '#7ee8fa', warn: '#ffd166', crit: '#ff5d8f',
    violet: '#c9a0ff', dim: '#9c7c94', faint: '#5a3a52', track: '#8a6a82', text: '#fff0f8',
    userBg: '#2a1a2a', panel: '#1f1220', border: 'round', marks: ['♥', '♡'], segments: 10,
    icons: ['♥', '◷', '♡'], spinner: '♥', shape: '`♥♡` hearts',
    description: 'Soft pink and sky blue on plum, honey and rose for the warnings.',
  },
  matrix: {
    label: 'Matrix', accent: '#00ff41', accent2: '#7dff9b', ok: '#00ff41', warn: '#ccff00', crit: '#ff3b3b',
    violet: '#5bf5a0', dim: '#2f8f4a', faint: '#0d3b1a', track: '#1f6b35', text: '#c8ffd6',
    userBg: '#06180c', panel: '#030d06', border: 'single', marks: ['1', '0'], segments: 16,
    icons: ['λ', '◷', 'Σ'], spinner: 'λ', shape: 'binary `1` and `0`',
    description: 'Green phosphor on black, lime and red warnings.',
  },
  solarized: {
    label: 'Solarized', accent: '#268bd2', accent2: '#2aa198', ok: '#859900', warn: '#b58900', crit: '#dc322f',
    violet: '#6c71c4', dim: '#586e75', faint: '#073642', track: '#31616e', text: '#eee8d5',
    userBg: '#073642', panel: '#002b36', border: 'round', marks: ['▲', '△'], segments: 10,
    icons: ['☼', '◷', '☾'], spinner: '☼', shape: '`▲△` peaks',
    description: 'The Solarized dark palette: blue, teal, olive, gold, red.',
  },
  mono: {
    label: 'Mono', accent: '#e6e6e0', accent2: '#b4b4ad', ok: '#e6e6e0', warn: '#e6e6e0', crit: '#e6e6e0',
    violet: '#cfcfc8', dim: '#7a7a75', faint: '#3a3a38', track: '#6b6b66', text: '#e6e6e0',
    userBg: '#232322', panel: '#1a1a19', border: 'single', marks: ['█', '░'], segments: 12,
    icons: ['•', '•', '•'], spinner: '•', shape: '`█░` shade',
    description: 'One colour for everything, no warning tint. Read the numbers, not the colours.',
  },
  minimal: {
    label: 'Minimal', accent: '#8a8a85', accent2: '#8a8a85', ok: '#4eba65', warn: '#ffc107', crit: '#ff6b80',
    violet: '#af87ff', dim: '#7a7a75', faint: '#3a3a38', track: '#4a4a48', text: '#e6e6e0',
    userBg: '#232322', panel: '#1a1a19', border: null, marks: null, segments: 1, gap: 0,
    icons: ['', '', ''], spinner: '›', shape: 'one solid thin bar',
    description: 'Greys with a green, amber and rose bar.',
  },
}

export const DEFAULT_THEME = 'neon'
