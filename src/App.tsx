import type { ManaColor, DamageMap, ModalKey } from './types'
import { PHASES } from './data/phases'
import { useGameState, makePlayers } from './hooks/useGameState'
import PlayerPanel from './components/PlayerPanel/PlayerPanel'
import PhaseTracker from './components/PhaseTracker/PhaseTracker'
import CombatModal from './components/combat/CombatModal'
import CardAnatomyModal from './components/modals/CardAnatomyModal'
import GlossaryModal from './components/modals/GlossaryModal'
import DiceModal from './components/modals/DiceModal'
import RandomizerModal from './components/modals/RandomizerModal'
import NewGameModal from './components/modals/NewGameModal'
import { useState } from 'react'

export default function App() {
  const [state, setState] = useGameState()
  const [modal, setModal] = useState<ModalKey>(null)
  const { players, activeIdx, phaseIdx, startLife } = state

  const patch = (p: Partial<typeof state>) => setState((s) => ({ ...s, ...p }))
  const setPlayers = (fn: (ps: typeof players) => typeof players) =>
    setState((s) => ({ ...s, players: fn(s.players) }))

  const adjustLife = (id: string, d: number) =>
    setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, life: p.life + d } : p)))

  const adjustCmdr = (targetId: string, sourceId: string, d: number) =>
    setPlayers((ps) =>
      ps.map((p) => {
        if (p.id !== targetId) return p
        const cur = p.cmdr[sourceId] ?? 0
        const next = Math.max(0, cur + d)
        const applied = next - cur
        return { ...p, cmdr: { ...p.cmdr, [sourceId]: next }, life: p.life - applied }
      }),
    )

  const rename = (id: string, name: string) =>
    setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, name } : p)))

  const setColors = (id: string, colors: ManaColor[]) =>
    setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, colors } : p)))

  const revive = (id: string) =>
    setPlayers((ps) =>
      ps.map((p) => (p.id === id ? { ...p, life: startLife, cmdr: {} } : p)),
    )

  const isDead = (p: typeof players[number]) =>
    p.life <= 0 || Math.max(0, ...Object.values(p.cmdr)) >= 21

  const nextPhase = () => {
    if (phaseIdx >= PHASES.length - 1) { endTurn(); return }
    patch({ phaseIdx: phaseIdx + 1 })
  }

  const endTurn = () => {
    const n = players.length
    let next = (activeIdx + 1) % n
    let guard = 0
    while (guard < n && isDead(players[next]!)) {
      next = (next + 1) % n
      guard++
    }
    patch({ activeIdx: next, phaseIdx: 0 })
  }

  const applyCombat = (map: DamageMap) =>
    setPlayers((ps) =>
      ps.map((p) => {
        const m = map[p.id]
        if (!m) return p
        const cmdr = { ...p.cmdr }
        if (m.cmdr > 0) {
          const srcId = players[activeIdx]!.id
          cmdr[srcId] = (cmdr[srcId] ?? 0) + m.cmdr
        }
        return { ...p, life: p.life - m.total, cmdr }
      }),
    )

  const startGame = (
    configs: Array<{ name: string; colors: ManaColor[] }>,
    life: number,
  ) => {
    setState({ players: makePlayers(configs, life), activeIdx: 0, phaseIdx: 0, startLife: life })
    setModal(null)
  }

  const n = players.length
  const half = Math.ceil(n / 2)
  const left = players.slice(0, half)
  const right = players.slice(half)
  const others = (pid: string) => players.filter((p) => p.id !== pid)

  const renderPlayer = (p: typeof players[number]) => (
    <PlayerPanel
      key={p.id}
      player={p}
      isActive={players[activeIdx]!.id === p.id}
      others={others(p.id)}
      onLife={(d) => adjustLife(p.id, d)}
      onCmdr={(srcId, d) => adjustCmdr(p.id, srcId, d)}
      onRename={(name) => rename(p.id, name)}
      onColors={(cols) => setColors(p.id, cols)}
      onRevive={() => revive(p.id)}
    />
  )

  return (
    <div id="app">
      <div className="app-head">
        <div className="brand">
          <h1>Spellbook</h1>
          <span className="fmt">Commander · {n} players</span>
        </div>
        <div className="tools">
          <button className="tool" onClick={() => setModal('anatomy')}>Card anatomy</button>
          <button className="tool" onClick={() => setModal('glossary')}>Glossary</button>
          <button className="tool" onClick={() => setModal('dice')}>Dice</button>
          <button className="tool" onClick={() => setModal('random')}>Who goes first</button>
          <button className="tool" onClick={() => setModal('newgame')}>New game</button>
        </div>
      </div>

      <div className={`board p${n}`}>
        <div className="col">{left.map(renderPlayer)}</div>
        <div className="col-center">
          <PhaseTracker
            phaseIdx={phaseIdx}
            activeName={players[activeIdx]!.name}
            onJump={(i) => patch({ phaseIdx: i })}
            onNext={nextPhase}
            onEnd={endTurn}
            onOpenCombat={() => setModal('combat')}
          />
        </div>
        <div className="col">{right.map(renderPlayer)}</div>
      </div>

      {modal === 'combat' && (
        <CombatModal
          players={players}
          activeIdx={activeIdx}
          onApply={applyCombat}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'anatomy' && <CardAnatomyModal onClose={() => setModal(null)} />}
      {modal === 'glossary' && <GlossaryModal onClose={() => setModal(null)} />}
      {modal === 'dice' && <DiceModal onClose={() => setModal(null)} />}
      {modal === 'random' && (
        <RandomizerModal
          players={players}
          onSetActive={(i) => patch({ activeIdx: i })}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'newgame' && (
        <NewGameModal
          initial={{ players, startLife }}
          onStart={startGame}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
