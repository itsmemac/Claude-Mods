// Draws the preview images used in the README: node docs/generate-previews.mjs
// The theme table mirrors THEMES in hooks/register.tsx (classic's theme-key colours are
// stand-ins); keep the two in step. Each bar is a row of blocks or glyph marks, as the mod draws it.
import { writeFileSync, mkdirSync } from 'node:fs'

const T = {
  classic: { b: 'round', bc: '#8a8a85', l: '#d97757', t: '#3d3d3a', ok: '#4eba65', w: '#ffc107', c: '#ff6b80', i: ['◉', '◷', '◈'], s: 12, g: 1 },
  cyberpunk: { b: 'bold', bc: '#fcee0a', l: '#00f0ff', t: '#6b6b4a', ok: '#00f0ff', w: '#fcee0a', c: '#ff003c', i: ['⚡', '◷', '☢'], s: 10, g: 0, m: ['▰', '▱'] },
  neon: { b: 'dashed', bc: '#ff2bd6', l: '#00f0ff', t: '#5a3f8a', ok: '#39ff14', w: '#ffe600', c: '#ff2b55', i: ['✦', '◷', '✧'], s: 10, g: 0, m: ['◉', '○'] },
  ocean: { b: 'round', bc: '#2b6cb0', l: '#4fd1c5', t: '#3b6ea8', ok: '#4fd1c5', w: '#63b3ed', c: '#f6ad55', i: ['≈', '◷', '◈'], s: 16, g: 0, m: ['▬', '·'] },
  sunset: { b: 'round', bc: '#ed8936', l: '#f6ad55', t: '#7a4a40', ok: '#f6ad55', w: '#ed64a6', c: '#e53e3e', i: ['☀', '◷', '❂'], s: 10, g: 0, m: ['◆', '◇'] },
  forest: { b: 'single', bc: '#38a169', l: '#9ae6b4', t: '#2f6b4f', ok: '#68d391', w: '#ecc94b', c: '#fc8181', i: ['❖', '◷', '✿'], s: 12, g: 0, m: ['■', '□'] },
  dracula: { b: 'round', bc: '#bd93f9', l: '#bd93f9', t: '#6272a4', ok: '#50fa7b', w: '#f1fa8c', c: '#ff5555', i: ['◆', '◷', '◇'], s: 12, g: 0, m: ['▮', '▯'] },
  nord: { b: 'double', bc: '#81a1c1', l: '#88c0d0', t: '#3b4252', ok: '#a3be8c', w: '#ebcb8b', c: '#bf616a', i: ['❄', '◷', '◈'], s: 5, g: 1 },
  gruvbox: { b: 'single', bc: '#d79921', l: '#fabd2f', t: '#665c54', ok: '#b8bb26', w: '#fe8019', c: '#fb4934', i: ['▣', '◷', '▤'], s: 20, g: 0, m: ['■', '▪'] },
  synthwave: { b: 'bold', bc: '#ff6ac1', l: '#36f9f6', t: '#5b4a7a', ok: '#72f1b8', w: '#fede5d', c: '#fe4450', i: ['♪', '◷', '♫'], s: 8, g: 0, m: ['▶', '▷'] },
  candy: { b: 'round', bc: '#ff9ecd', l: '#ff79c6', t: '#8a6a82', ok: '#7ee8fa', w: '#ffd166', c: '#ff5d8f', i: ['♥', '◷', '♡'], s: 10, g: 0, m: ['♥', '♡'] },
  matrix: { b: 'single', bc: '#00ff41', l: '#00ff41', t: '#1f6b35', ok: '#00ff41', w: '#ccff00', c: '#ff3b3b', i: ['λ', '◷', 'Σ'], s: 16, g: 0, m: ['1', '0'] },
  solarized: { b: 'round', bc: '#268bd2', l: '#2aa198', t: '#31616e', ok: '#859900', w: '#b58900', c: '#dc322f', i: ['☼', '◷', '☾'], s: 10, g: 0, m: ['▲', '△'] },
  mono: { b: 'single', bc: '#55554f', l: '#e6e6e0', t: '#6b6b66', ok: '#e6e6e0', w: '#e6e6e0', c: '#e6e6e0', i: ['•', '•', '•'], s: 12, g: 0, m: ['█', '░'] },
  minimal: { b: 'none', bc: '#55554f', l: '#8a8a85', t: '#3d3d3a', ok: '#4eba65', w: '#ffc107', c: '#ff6b80', i: ['', '', ''], s: 1, g: 0 },
}
const DATA = [['Context', 'Ctx', 34, '68k/200k'], ['5h', '5h', 72, '1h 48m'], ['Week', 'Wk', 93, '2d 6h']]
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

// One bar drawn into `w` pixels at `mode` ('full' | 'medium' | 'narrow')
const bar = (t, w, y, mode) => {
  const pad = 14
  const slot = (w - pad * 2 - 40) / 3
  let out = ''
  DATA.forEach(([name, short, p, note], k) => {
    const x0 = pad + k * (slot + 20)
    const col = p >= 90 ? t.c : p >= 70 ? t.w : t.ok
    const label = (mode === 'narrow' ? short : name)
    const icon = t.i[k] && mode !== 'narrow' ? t.i[k] + ' ' : ''
    const lw = mode === 'narrow' ? 34 : 72
    const pw = 36, nw = mode === 'full' ? 64 : 0
    out += `<text x="${x0}" y="${y + 5}" fill="${t.l}" font-weight="bold">${esc(icon + label)}</text>`
    const bx = x0 + lw + 4
    const bw = slot - lw - pw - nw - 8
    if (mode !== 'narrow' && bw > 20) {
      const n = t.s, gap = t.g * 8
      const sw = (bw - gap * (n - 1)) / n
      const filled = Math.round((p / 100) * n)
      if (n === 1) {
        const fw = (bw * p) / 100
        out += `<rect x="${bx}" y="${y - 8}" width="${fw.toFixed(1)}" height="14" fill="${col}"/><rect x="${(bx + fw).toFixed(1)}" y="${y - 8}" width="${(bw - fw).toFixed(1)}" height="14" fill="${t.t}"/>`
      } else
      for (let i = 0; i < n; i++) {
        const x = bx + i * (sw + gap)
        if (t.m) out += `<text x="${(x + sw / 2).toFixed(1)}" y="${y + 5}" text-anchor="middle" fill="${i < filled ? col : t.t}">${t.m[i < filled ? 0 : 1]}</text>`
        else out += `<rect x="${x.toFixed(1)}" y="${y - 8}" width="${sw.toFixed(1)}" height="14" fill="${i < filled ? col : t.t}"/>`
      }
    }
    const px = mode === 'narrow' ? x0 + lw : bx + Math.max(bw, 0) + 6
    out += `<text x="${px}" y="${y + 5}" fill="${col}" font-weight="bold">${p}%</text>`
    if (mode === 'full') out += `<text x="${px + pw}" y="${y + 5}" fill="#8a8a85" font-size="12">${esc(note)}</text>`
  })
  return out
}

const frame = (t, w, y0) => {
  const h = 36
  if (t.b === 'none') return ''
  const sw = t.b === 'bold' ? 3 : 1.2
  const rx = t.b === 'round' ? 10 : 2
  const dash = t.b === 'dashed' ? ' stroke-dasharray="6 4"' : ''
  let s = `<rect x="2" y="${y0}" width="${w - 4}" height="${h}" rx="${rx}" fill="none" stroke="${t.bc}" stroke-width="${sw}"${dash}/>`
  if (t.b === 'double') s += `<rect x="6" y="${y0 + 4}" width="${w - 12}" height="${h - 8}" rx="1" fill="none" stroke="${t.bc}" stroke-width="1"/>`
  return s
}

const svg = (body, w, h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-size="14">
<rect width="${w}" height="${h}" rx="12" fill="#1f1f1e"/>
${body}
</svg>
`

mkdirSync('docs/img', { recursive: true })
const W = 940
for (const [name, t] of Object.entries(T)) {
  writeFileSync(`docs/img/${name}.svg`, svg(frame(t, W, 12) + bar(t, W, 30, 'full'), W, 60))
}

// the three widths, drawn in the classic theme
let body = '', y = 12
for (const [w, mode, label] of [[940, 'full', 'wide, 96+ columns'], [700, 'medium', 'medium, 64 to 95'], [420, 'narrow', 'narrow, under 64']]) {
  body += `<text x="14" y="${y + 6}" fill="#8a8a85" font-size="12">${label}</text>`
  body += `<g transform="translate(0,${y + 12})">${frame(T.classic, w, 0)}${bar(T.classic, w, 18, mode)}</g>`
  y += 66
}
writeFileSync('docs/img/responsive.svg', svg(body, W, y + 4))
console.log('done')
