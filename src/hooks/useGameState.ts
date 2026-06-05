import { useState, useEffect } from 'react'
import type { GameState, ManaColor, Player } from '../types'

const STORE_KEY = 'mtg-companion-v1'

const DEFAULT_CONFIGS: Array<{ name: string; colors: ManaColor[] }> = [
  { name: 'Player 1', colors: ['G', 'W'] },
  { name: 'Player 2', colors: ['U', 'B'] },
  { name: 'Player 3', colors: ['R'] },
  { name: 'Player 4', colors: ['W', 'U'] },
]

function makePlayers(
  configs: Array<{ name: string; colors: ManaColor[] }>,
  startLife: number,
): Player[] {
  return configs.map((c, i) => ({
    id: 'p' + (i + 1),
    name: c.name,
    colors: c.colors,
    life: startLife,
    cmdr: {},
  }))
}

function defaultState(): GameState {
  return {
    players: makePlayers(DEFAULT_CONFIGS, 40),
    activeIdx: 0,
    phaseIdx: 0,
    startLife: 40,
  }
}

export function useGameState(): [GameState, React.Dispatch<React.SetStateAction<GameState>>] {
  const [state, setState] = useState<GameState>(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY)
      if (raw) return JSON.parse(raw) as GameState
    } catch {
      // ignore parse errors
    }
    return defaultState()
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state])

  return [state, setState]
}

export { makePlayers }
