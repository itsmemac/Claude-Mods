import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Usage } from '../types'

const usage = atom({ plugin: 'usage-bar', key: 'usage' } as const, null)

type Measured = {
  context: { percent?: number; tokens?: number; window: number }
  rateLimits: { kind: string; percentUsed: number; resetsAt?: string }[]
}

const toUsage = (u: Measured): Usage => {
  const rate = (kind: string) => {
    const l = u.rateLimits.find(x => x.kind === kind)

    return { percent: l?.percentUsed ?? null, resetsAt: l?.resetsAt }
  }

  return {
    context: { percent: u.context.percent ?? null },
    contextTokens: u.context.tokens ?? null,
    contextWindow: u.context.window,
    fiveHour: rate('five_hour'),
    sevenDay: rate('seven_day'),
  }
}

type Style = {
  border: 'round' | 'single' | 'double' | 'bold' | 'dashed' | undefined
  borderColor: string
  label: string
  track: string
  ok: string
  warn: string
  crit: string
  idle: string
  icons: [string, string, string]
  // the bar is this many blocks, each `gap` cells apart (gap 0 and one block: a solid bar)
  segments: number
  gap: 0 | 1
  // a glyph pair (filled, empty) drawn once per block instead of a coloured block
  marks?: [string, string]
}

// Colours are Claude theme keys (they follow the person's theme) or raw hex.
const THEMES: Record<string, Style> = {
  classic: {
    border: 'round', borderColor: 'promptBorder', label: 'claude', track: 'promptBorder',
    ok: 'success', warn: 'warning', crit: 'error', idle: 'inactive',
    icons: ['◉', '◷', '◈'], segments: 12, gap: 1,
  },
  cyberpunk: {
    border: 'bold', borderColor: '#fcee0a', label: '#00f0ff', track: '#6b6b4a',
    ok: '#00f0ff', warn: '#fcee0a', crit: '#ff003c', idle: '#5c5c4a',
    icons: ['⚡', '◷', '☢'], segments: 10, gap: 0, marks: ['▰', '▱'],
  },
  neon: {
    border: 'dashed', borderColor: '#ff2bd6', label: '#00f0ff', track: '#5a3f8a',
    ok: '#39ff14', warn: '#ffe600', crit: '#ff2b55', idle: '#6b6b8a',
    icons: ['✦', '◷', '✧'], segments: 10, gap: 0, marks: ['◉', '○'],
  },
  ocean: {
    border: 'round', borderColor: '#2b6cb0', label: '#4fd1c5', track: '#3b6ea8',
    ok: '#4fd1c5', warn: '#63b3ed', crit: '#f6ad55', idle: '#4a5568',
    icons: ['≈', '◷', '◈'], segments: 16, gap: 0, marks: ['▬', '·'],
  },
  sunset: {
    border: 'round', borderColor: '#ed8936', label: '#f6ad55', track: '#7a4a40',
    ok: '#f6ad55', warn: '#ed64a6', crit: '#e53e3e', idle: '#718096',
    icons: ['☀', '◷', '❂'], segments: 10, gap: 0, marks: ['◆', '◇'],
  },
  forest: {
    border: 'single', borderColor: '#38a169', label: '#9ae6b4', track: '#2f6b4f',
    ok: '#68d391', warn: '#ecc94b', crit: '#fc8181', idle: '#4a5568',
    icons: ['❖', '◷', '✿'], segments: 12, gap: 0, marks: ['■', '□'],
  },
  dracula: {
    border: 'round', borderColor: '#bd93f9', label: '#bd93f9', track: '#6272a4',
    ok: '#50fa7b', warn: '#f1fa8c', crit: '#ff5555', idle: '#6272a4',
    icons: ['◆', '◷', '◇'], segments: 12, gap: 0, marks: ['▮', '▯'],
  },
  nord: {
    border: 'double', borderColor: '#81a1c1', label: '#88c0d0', track: '#3b4252',
    ok: '#a3be8c', warn: '#ebcb8b', crit: '#bf616a', idle: '#4c566a',
    icons: ['❄', '◷', '◈'], segments: 5, gap: 1,
  },
  gruvbox: {
    border: 'single', borderColor: '#d79921', label: '#fabd2f', track: '#665c54',
    ok: '#b8bb26', warn: '#fe8019', crit: '#fb4934', idle: '#665c54',
    icons: ['▣', '◷', '▤'], segments: 20, gap: 0, marks: ['■', '▪'],
  },
  synthwave: {
    border: 'bold', borderColor: '#ff6ac1', label: '#36f9f6', track: '#5b4a7a',
    ok: '#72f1b8', warn: '#fede5d', crit: '#fe4450', idle: '#495495',
    icons: ['♪', '◷', '♫'], segments: 8, gap: 0, marks: ['▶', '▷'],
  },
  candy: {
    border: 'round', borderColor: '#ff9ecd', label: '#ff79c6', track: '#8a6a82',
    ok: '#7ee8fa', warn: '#ffd166', crit: '#ff5d8f', idle: '#7d6b7a',
    icons: ['♥', '◷', '♡'], segments: 10, gap: 0, marks: ['♥', '♡'],
  },
  matrix: {
    border: 'single', borderColor: '#00ff41', label: '#00ff41', track: '#1f6b35',
    ok: '#00ff41', warn: '#ccff00', crit: '#ff3b3b', idle: '#2f6b3f',
    icons: ['λ', '◷', 'Σ'], segments: 16, gap: 0, marks: ['1', '0'],
  },
  solarized: {
    border: 'round', borderColor: '#268bd2', label: '#2aa198', track: '#31616e',
    ok: '#859900', warn: '#b58900', crit: '#dc322f', idle: '#586e75',
    icons: ['☼', '◷', '☾'], segments: 10, gap: 0, marks: ['▲', '△'],
  },
  mono: {
    border: 'single', borderColor: 'subtle', label: 'text', track: '#6b6b66',
    ok: 'text', warn: 'text', crit: 'text', idle: 'inactive',
    icons: ['•', '•', '•'], segments: 12, gap: 0, marks: ['█', '░'],
  },
  minimal: {
    border: undefined, borderColor: 'subtle', label: 'inactive', track: 'promptBorder',
    ok: 'success', warn: 'warning', crit: 'error', idle: 'inactive',
    icons: ['', '', ''], segments: 1, gap: 0,
  },
}

const k = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1000)}k`)

const resetIn = (iso: string | undefined, now: number) => {
  if (!iso) return ''
  const mins = Math.max(0, Math.round((Date.parse(iso) - now) / 60000))
  if (mins >= 1440) return `${Math.floor(mins / 1440)}d ${Math.floor((mins % 1440) / 60)}h`
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`

  return `${mins}m`
}

export const register: Register = (on, options) => {
  const style = THEMES[String(options.theme ?? 'classic')] ?? THEMES.classic
  const tone = (p: number | null) =>
    p === null ? style.idle : p >= 90 ? style.crit : p >= 70 ? style.warn : style.ok

  on('session.start', async ($, e, next) => {
    const u = await $.session.usage()
    await update($, usage, () => toUsage(u))
    $.clock.every(3000, async () => {
      const m = await $.session.usage()
      await update($, usage, () => toUsage(m))
    })

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await update($, usage, () => toUsage(e))

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const u = await read($, usage)
    if (u === null) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const now = await $.clock.now()
    // Other surfaces draw proportional text, so a reported column holds less than a terminal cell
    const reported = e.viewport?.columns ?? 100
    const cols = e.surface === 'terminal' ? reported : Math.floor(reported * 0.85)
    // full: notes shown; medium: bars only; narrow: percentages only, no border below 40
    const mode = cols >= 96 ? 'full' : cols >= 64 ? 'medium' : 'narrow'
    // Each meter wants at least this much room; when the row cannot hold three of them they
    // wrap onto further rows, whatever the surface reports, and grow to fill what is left.
    const basis = mode === 'full' ? 38 : mode === 'medium' ? 26 : 14

    // A bar is a row of background-coloured blocks that share the room left in the row, so
    // it stretches to use all the space and the three come out the same length. The blocks
    // hold no text, so nothing wraps; the theme sets how many there are and how far apart.
    const meter = (icon: string, name: string, p: number | null, note: string) => {
      const v = Math.max(0, Math.min(100, p ?? 0))
      const filled = Math.round((v / 100) * style.segments)

      return (
        <Box width={basis} flexGrow={1} flexShrink={0} alignItems="center">
          <Box flexShrink={0} width={mode === 'narrow' ? 4 : 12} alignItems="center">
            <Text bold color={style.label}>{icon !== '' && mode !== 'narrow' ? `${icon} ` : ''}{name}</Text>
          </Box>
          {mode !== 'narrow' && (
            <Box flexGrow={1} height={1} marginX={1} alignItems="center">
              {style.segments === 1 ? (
                // one solid bar: the two parts share the room by the percentage itself
                [
                  v > 0 && <Box key="on" flexGrow={v} width={0} height={1} backgroundColor={tone(p)} />,
                  v < 100 && <Box key="off" flexGrow={100 - v} width={0} height={1} backgroundColor={style.track} />,
                ]
              ) : (
                Array.from({ length: style.segments }, (_, i) => {
                  const isOn = i < filled
                  const gap = i < style.segments - 1 ? style.gap : 0
  
                  return style.marks ? (
                    <Box key={i} flexGrow={1} width={0} height={1} justifyContent="center" alignItems="center">
                      <Text color={isOn ? tone(p) : style.track}>{style.marks[isOn ? 0 : 1]}</Text>
                    </Box>
                  ) : (
                    <Box
                      key={i}
                      flexGrow={1}
                      width={0}
                      height={1}
                      marginRight={gap}
                      backgroundColor={isOn ? tone(p) : style.track}
                    />
                  )
                })
              )}
            </Box>
          )}
          <Box flexShrink={0} width={4} justifyContent="flex-end" alignItems="center">
            <Text color={tone(p)} bold>{p === null ? '—' : `${Math.round(p)}%`}</Text>
          </Box>
          {mode === 'full' && (
            <Box flexShrink={0} width={10} alignItems="center">
              <Text dimColor>{` ${note}`}</Text>
            </Box>
          )}
        </Box>
      )
    }

    const win = u.contextTokens === null ? '' : `${k(u.contextTokens)}/${k(u.contextWindow)}`
    const names = mode === 'narrow' ? ['Ctx', '5h', 'Wk'] : ['Context', '5h', 'Week']

    return (
      <Box
        width="100%"
        flexWrap="wrap"
        alignItems="center"
        columnGap={3}
        borderStyle={cols >= 40 ? style.border : undefined}
        borderColor={style.borderColor}
        paddingX={1}
      >
        {meter(style.icons[0], names[0], u.context.percent, win)}
        {meter(style.icons[1], names[1], u.fiveHour.percent, resetIn(u.fiveHour.resetsAt, now))}
        {meter(style.icons[2], names[2], u.sevenDay.percent, resetIn(u.sevenDay.resetsAt, now))}
      </Box>
    )
  })
}
