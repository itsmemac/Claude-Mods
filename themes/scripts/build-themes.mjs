// Writes themes/<slug>.json (the terminal colour theme), docs/img/<slug>.svg and the theme
// table and sections of README.md from hooks/palettes.js.
// Run from the themes folder: node scripts/build-themes.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { THEMES } from '../hooks/palettes.js'

const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16))
const mix = (a, b, t) =>
  '#' + hex(a).map((v, i) => Math.round(v * t + hex(b)[i] * (1 - t)).toString(16).padStart(2, '0')).join('')
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

mkdirSync('themes', { recursive: true })
mkdirSync('docs/img', { recursive: true })

for (const [slug, t] of Object.entries(THEMES)) {
  const overrides = {
    claude: t.accent, claudeShimmer: mix('#ffffff', t.accent, 0.35), text: t.text,
    inverseText: t.panel, inactive: t.dim, inactiveShimmer: mix('#ffffff', t.dim, 0.3), subtle: t.faint,
    suggestion: t.accent2, permission: t.accent2, permissionShimmer: mix('#ffffff', t.accent2, 0.35),
    remember: t.violet, success: t.ok, error: t.crit, warning: t.warn,
    warningShimmer: mix('#ffffff', t.warn, 0.35), merged: t.violet,
    promptBorder: t.accent, promptBorderShimmer: mix('#ffffff', t.accent, 0.35),
    planMode: t.accent2, autoAccept: t.ok, bashBorder: t.warn, ide: t.accent2,
    diffAdded: mix(t.ok, t.panel, 0.22), diffRemoved: mix(t.crit, t.panel, 0.22),
    diffAddedDimmed: mix(t.ok, t.panel, 0.12), diffRemovedDimmed: mix(t.crit, t.panel, 0.12),
    diffAddedWord: mix(t.ok, t.panel, 0.45), diffRemovedWord: mix(t.crit, t.panel, 0.45),
    userMessageBackground: t.userBg, userMessageBackgroundHover: mix(t.accent, t.userBg, 0.12),
    bashMessageBackgroundColor: mix(t.warn, t.panel, 0.15), memoryBackgroundColor: mix(t.violet, t.panel, 0.15),
    selectionBg: mix(t.accent, t.panel, 0.3), composerSidebarBackground: t.panel,
    rate_limit_fill: t.ok, rate_limit_empty: t.faint, briefLabelYou: t.accent2, briefLabelClaude: t.accent,
    red_FOR_SUBAGENTS_ONLY: t.crit, blue_FOR_SUBAGENTS_ONLY: t.accent2, green_FOR_SUBAGENTS_ONLY: t.ok,
    yellow_FOR_SUBAGENTS_ONLY: t.warn, purple_FOR_SUBAGENTS_ONLY: t.violet, orange_FOR_SUBAGENTS_ONLY: t.warn,
    pink_FOR_SUBAGENTS_ONLY: t.accent, cyan_FOR_SUBAGENTS_ONLY: t.accent2,
  }
  writeFileSync(`themes/${slug}.json`, JSON.stringify({ name: t.label, base: 'dark', overrides }, null, 2) + '\n')

  // a small mock of the interface in this theme
  const n = Math.min(t.segments, 12)
  const meter = (x, name, icon, p, col) => {
    const label = esc((icon ? icon + ' ' : '') + name)
    let bar = ''
    if (t.segments === 1) {
      const w = n === 1 ? 160 : 0
      const fw = (w * p) / 100
      bar = `<rect x="0" y="-12" width="${fw}" height="14" fill="${col}"/><rect x="${fw}" y="-12" width="${w - fw}" height="14" fill="${t.track}"/>`
    } else {
      bar = Array.from({ length: n }, (_, i) => {
        const on = i < Math.round((p / 100) * n)
        return t.marks
          ? `<text x="${i * 22 + 11}" y="0" fill="${on ? col : t.track}" text-anchor="middle">${t.marks[on ? 0 : 1]}</text>`
          : `<rect x="${i * 22}" y="-12" width="18" height="14" fill="${on ? col : t.track}"/>`
      }).join('')
    }
    const width = t.segments === 1 ? 160 : n * 22
    return `<g transform="translate(${x},0)"><text x="0" y="0" fill="${t.accent2}" font-weight="bold">${label}</text>` +
      `<g transform="translate(96,0)">${bar}</g>` +
      `<text x="${96 + width + 8}" y="0" fill="${col}" font-weight="bold">${p}%</text></g>`
  }
  const bw = t.border === 'bold' ? 3 : 1.2
  const dash = t.border === 'dashed' ? ' stroke-dasharray="6 4"' : ''
  const frame = t.border
    ? `<rect x="2" y="166" width="936" height="36" rx="${t.border === 'round' ? 10 : 2}" fill="none" stroke="${t.accent}" stroke-width="${bw}"${dash}/>`
    : ''
  const swatches = [['accent', t.accent], ['accent2', t.accent2], ['ok', t.ok], ['warn', t.warn], ['crit', t.crit], ['violet', t.violet], ['dim', t.dim], ['faint', t.faint]]
    .map(([name, c], i) => `<rect x="${16 + i * 112}" y="214" width="12" height="12" fill="${c}"/><text x="${34 + i * 112}" y="224" fill="${t.dim}" font-size="11">${name}</text>`)
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="940" height="236" viewBox="0 0 940 236" font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-size="14">
<rect width="940" height="236" rx="12" fill="${t.panel}"/>
<rect x="16" y="14" width="3" height="28" fill="${t.accent2}"/>
<text x="28" y="34" fill="${t.accent2}" font-weight="bold">You</text>
<text x="72" y="34" fill="${t.text}">make the build faster</text>
<rect x="16" y="52" width="3" height="76" fill="${t.accent}"/>
<text x="28" y="72" fill="${t.accent}" font-weight="bold">${esc(t.spinner)} Claude</text>
<text x="28" y="96" fill="${t.text}">Done: cached the dependency step.</text>
<rect x="28" y="106" width="3" height="16" fill="${t.ok}"/><text x="40" y="119" fill="${t.dim}" font-size="12">Edit  ci.yml</text>
<rect x="16" y="134" width="448" height="20" fill="${mix(t.ok, t.panel, 0.22)}"/><text x="24" y="149" fill="${t.ok}" font-size="12">+ cache: node_modules</text>
<rect x="470" y="134" width="454" height="20" fill="${mix(t.crit, t.panel, 0.22)}"/><text x="478" y="149" fill="${t.crit}" font-size="12">- run: npm install</text>
${frame}
<g transform="translate(16,189)">${meter(0, 'Context', t.icons[0], 34, t.ok)}${meter(300, '5h', t.icons[1], 72, t.warn)}${meter(600, 'Week', t.icons[2], 93, t.crit)}</g>
${swatches}
</svg>
`
  writeFileSync(`docs/img/${slug}.svg`, svg)
}

// the theme table and one section per theme in README.md, between the markers
const entries = Object.entries(THEMES)
let table = '| Theme | Look | Bar |\n| --- | --- | --- |\n'
let sections = ''
for (const [slug, t] of entries) {
  table += `| [\`${slug}\`](#${slug}) | ${t.description} | ${t.shape} |\n`
  sections += `### ${slug}\n\n![${slug} theme](docs/img/${slug}.svg)\n\n${t.description} ${t.border ? `A ${t.border === 'bold' ? 'bold' : t.border} border, ` : 'No border, '}${t.shape}, a \`${t.spinner}\` spinner.\n\n`
}
const block = `<!-- themes:start -->\n${table}\n${sections}<!-- themes:end -->`
const readme = readFileSync('README.md', 'utf8')
const next = readme.replace(/<!-- themes:start -->[\s\S]*<!-- themes:end -->/, () => block)
if (next === readme && !readme.includes('<!-- themes:start -->')) throw new Error('README.md has no themes markers')
writeFileSync('README.md', next)
console.log(`built ${entries.length} themes`)
