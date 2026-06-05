export interface ManaInfo {
  bg: string
  fg: string
  ring?: string
  name: string
}

export const MANA: Record<string, ManaInfo> = {
  W: { bg: 'var(--w)', fg: '#5b4318', ring: '#c9bf86', name: 'White' },
  U: { bg: 'var(--u)', fg: '#fff', name: 'Blue' },
  B: { bg: 'var(--b)', fg: '#fff', name: 'Black' },
  R: { bg: 'var(--r)', fg: '#fff', name: 'Red' },
  G: { bg: 'var(--g)', fg: '#fff', name: 'Green' },
  C: { bg: 'var(--c)', fg: '#3a2c12', name: 'Colorless' },
}

export const COLOR_ORDER = ['W', 'U', 'B', 'R', 'G'] as const
