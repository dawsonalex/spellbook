export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G'

export interface Player {
  id: string
  name: string
  colors: ManaColor[]
  life: number
  cmdr: Record<string, number>
}

export interface GameState {
  players: Player[]
  activeIdx: number
  phaseIdx: number
  startLife: number
}

export interface Phase {
  key: string
  name: string
  tag: string
  one: string
  detail: (string | { tip: string })[]
}

export interface CombatStep {
  name: string
  one: string
  body: string
  stack: string
}

export interface GlossaryGroup {
  group: string
  items: [string, string][]
}

export type DamageMap = Record<string, { total: number; cmdr: number }>

export type ModalKey = 'combat' | 'anatomy' | 'glossary' | 'dice' | 'random' | 'newgame' | null

export type SheetKey = null | 'tools' | { type: 'player'; id: string }
