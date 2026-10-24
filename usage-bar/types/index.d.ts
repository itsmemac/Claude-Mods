export type Meter = { percent: number | null; resetsAt?: string }
export type Usage = {
  context: Meter
  contextTokens: number | null
  contextWindow: number
  fiveHour: Meter
  sevenDay: Meter
}

declare module 'claude-code' {
  interface PluginState {
    'usage-bar': { usage: Usage | null }
  }
}
