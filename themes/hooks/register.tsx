import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Usage } from '../types'
// The theme table lives in palettes.js; a change there only takes effect once this file reloads too
import { DEFAULT_THEME, THEMES } from './palettes.js'

const PANE = 'themes'
const usage = atom({ plugin: 'themes', key: 'usage' } as const, null)
// The theme in use. A change redraws every row below, so `/themes` switches live.
const current = atom({ plugin: 'themes', key: 'theme' } as const, DEFAULT_THEME)

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

const themeOf = (name: string) => THEMES[name] ?? THEMES[DEFAULT_THEME]

// ok below 70%, warn from 70%, crit from 90%; idle when the account reports no limit
const tone = (t: (typeof THEMES)[string], p: number | null) =>
  p === null ? t.dim : p >= 90 ? t.crit : p >= 70 ? t.warn : t.ok

const k = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1000)}k`)

const resetIn = (iso: string | undefined, now: number) => {
  if (!iso) return ''
  const mins = Math.max(0, Math.round((Date.parse(iso) - now) / 60000))
  if (mins >= 1440) return `${Math.floor(mins / 1440)}d ${Math.floor((mins % 1440) / 60)}h`
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`

  return `${mins}m`
}

// A transcript row keeps Claude Code's own drawing (`theirs`) and gains a thin accent rail
// beside it and, where given, a small label above. No `$` in here: a helper that takes `$`
// stops the module from loading.
const framed = (Box: any, Text: any, theirs: unknown, rail: string, label?: string, labelColor?: string) => (
  <Box flexDirection="row">
    <Box width={1} flexShrink={0} backgroundColor={rail} />
    <Box flexGrow={1} flexShrink={1} paddingX={1} flexDirection="column">
      {label ? <Text bold color={labelColor}>{label}</Text> : null}
      {theirs}
    </Box>
  </Box>
)

export const register: Register = (on, options) => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'themes',
      description: 'Pick a theme, or switch with /themes <name>',
    })
    // the saved choice, else the install-time option, else the default
    const saved = await $.store.get('theme')
    const wanted = typeof saved === 'string' ? saved : String(options.theme ?? DEFAULT_THEME)
    await update($, current, () => (THEMES[wanted] ? wanted : DEFAULT_THEME))

    const u = await $.session.usage()
    await update($, usage, () => toUsage(u))
    $.clock.every(3000, async () => {
      const m = await $.session.usage()
      await update($, usage, () => toUsage(m))
    })

    return next(e)
  })

  on('command.run', { command: 'themes' }, async ($, e) => {
    const name = e.args.trim().toLowerCase()
    if (name && THEMES[name]) {
      await update($, current, () => name)
      await $.store.set('theme', name)
      $.ui.invalidate('ui.render')

      return { text: `Theme set to ${THEMES[name].label}.` }
    }
    await $.ui.open({ id: PANE, title: 'Themes', focus: true, closeOnEscape: true })

    return {
      text: name
        ? `No theme called "${name}". Available: ${Object.keys(THEMES).join(', ')}.`
        : 'Pick a theme in the pane.',
    }
  })

  on('session.measure', async ($, e, next) => {
    await update($, usage, () => toUsage(e))

    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Select } = $.ui.resolve(e)
    const name = await read($, current)
    const t = themeOf(name)
    const swatches: [string, string][] = [
      ['accent', t.accent], ['accent2', t.accent2], ['ok', t.ok], ['warn', t.warn],
      ['crit', t.crit], ['violet', t.violet],
    ]

    return (
      <Box flexDirection="column" gap={1}>
        <Select
          key="theme"
          label="Theme"
          value={name}
          options={Object.entries(THEMES).map(([value, x]) => ({ value, label: x.label }))}
          onSelect={async value => {
            await update($, current, () => value)
            await $.store.set('theme', value)
            // redraw the rows already on screen, not only the ones drawn from now on
            $.ui.invalidate('ui.render')
          }}
        />
        <Text color={t.dim}>{t.description}</Text>
        <Box flexDirection="row" gap={1} flexWrap="wrap">
          {swatches.map(([label, color]) => (
            <Box key={label} backgroundColor={color} paddingX={1}>
              <Text color={t.panel}>{label}</Text>
            </Box>
          ))}
        </Box>
        <Text color={t.dim}>The terminal colour theme is picked with /theme; this pane styles the rest.</Text>
      </Box>
    )
  })

  // Transcript, tool rows and spinner: these sites draw in the terminal, the desktop app
  // and the VS Code extension alike.
  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    const { Box, Text } = $.ui.resolve(e)
    const t = themeOf(await read($, current))

    return framed(Box, Text, await next(e), t.accent2, 'You', t.accent2)
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    const { Box, Text } = $.ui.resolve(e)
    const t = themeOf(await read($, current))
    const isFirst = e.props.isFirstOfReply

    return framed(Box, Text, await next(e), isFirst ? t.accent : t.faint, isFirst ? `${t.spinner} Claude` : undefined, t.accent)
  })

  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    const { Box, Text } = $.ui.resolve(e)
    const t = themeOf(await read($, current))
    const p = e.props
    const rail = p.isErrored ? t.crit : p.isRunning ? t.warn : t.ok

    return framed(Box, Text, await next(e), rail)
  })

  on('ui.render', { component: 'ToolResult' }, async ($, e, next) => {
    const { Box, Text } = $.ui.resolve(e)
    const t = themeOf(await read($, current))

    return framed(Box, Text, await next(e), t.faint)
  })

  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    const { Box, Text } = $.ui.resolve(e)
    const t = themeOf(await read($, current))

    return (
      <Box>
        <Text color={t.accent} bold>{`${t.spinner} `}</Text>
        {await next(e)}
      </Box>
    )
  })

  // The usage bar above the prompt: Context, 5h and Week.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const u = await read($, usage)
    if (u === null) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const t = themeOf(await read($, current))
    const now = await $.clock.now()
    // Other surfaces draw proportional text, so a reported column holds less than a terminal cell
    const reported = e.viewport?.columns ?? 100
    const cols = e.surface === 'terminal' ? reported : Math.floor(reported * 0.85)
    // full: notes shown; medium: bars only; narrow: percentages only, no border below 40
    const mode = cols >= 96 ? 'full' : cols >= 64 ? 'medium' : 'narrow'
    // Each meter wants at least this much room; when the row cannot hold three of them they
    // wrap onto further rows, whatever the surface reports, and grow to fill what is left.
    const basis = mode === 'full' ? 38 : mode === 'medium' ? 26 : 14

    const meter = (icon: string, name: string, p: number | null, note: string) => {
      const v = Math.max(0, Math.min(100, p ?? 0))
      const filled = Math.round((v / 100) * t.segments)

      return (
        <Box width={basis} flexGrow={1} flexShrink={0} alignItems="center">
          <Box flexShrink={0} width={mode === 'narrow' ? 4 : 12} alignItems="center">
            <Text bold color={t.accent2}>{mode !== 'narrow' && icon ? `${icon} ` : ''}{name}</Text>
          </Box>
          {mode !== 'narrow' && (
            <Box flexGrow={1} height={1} marginX={1} alignItems="center">
              {t.segments === 1
                ? [
                    // one solid bar: its two parts share the room by the percentage itself
                    v > 0 && <Box key="on" flexGrow={v} width={0} height={1} backgroundColor={tone(t, p)} />,
                    v < 100 && <Box key="off" flexGrow={100 - v} width={0} height={1} backgroundColor={t.track} />,
                  ]
                : Array.from({ length: t.segments }, (_, i) => {
                    const isOn = i < filled

                    return t.marks ? (
                      <Box key={i} flexGrow={1} width={0} height={1} justifyContent="center" alignItems="center">
                        <Text color={isOn ? tone(t, p) : t.track}>{t.marks[isOn ? 0 : 1]}</Text>
                      </Box>
                    ) : (
                      <Box
                        key={i}
                        flexGrow={1}
                        width={0}
                        height={1}
                        marginRight={i < t.segments - 1 ? (t.gap ?? 0) : 0}
                        backgroundColor={isOn ? tone(t, p) : t.track}
                      />
                    )
                  })}
            </Box>
          )}
          <Box flexShrink={0} width={4} justifyContent="flex-end" alignItems="center">
            <Text color={tone(t, p)} bold>{p === null ? '—' : `${Math.round(p)}%`}</Text>
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
        borderStyle={cols >= 40 && t.border ? t.border : undefined}
        borderColor={t.accent}
        paddingX={1}
      >
        {meter(t.icons[0], names[0], u.context.percent, win)}
        {meter(t.icons[1], names[1], u.fiveHour.percent, resetIn(u.fiveHour.resetsAt, now))}
        {meter(t.icons[2], names[2], u.sevenDay.percent, resetIn(u.sevenDay.resetsAt, now))}
      </Box>
    )
  })
}
