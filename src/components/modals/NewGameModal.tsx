import { useState } from 'react'
import type { Player, ManaColor } from '../../types'
import { COLOR_ORDER } from '../../data/mana'
import ManaPip from '../shared/ManaPip'
import Stepper from '../shared/Stepper'
import Modal from '../shared/Modal'
import styles from './NewGameModal.module.css'

interface PlayerConfig {
  name: string
  colors: ManaColor[]
}

interface NewGameModalProps {
  initial: { players: Player[]; startLife: number }
  onStart: (configs: PlayerConfig[], life: number) => void
  onClose: () => void
}

export default function NewGameModal({ initial, onStart, onClose }: NewGameModalProps) {
  const [count, setCount] = useState(initial.players.length)
  const [life, setLife] = useState(initial.startLife)
  const [rows, setRows] = useState<PlayerConfig[]>(() => {
    const base = initial.players.map((p) => ({ name: p.name, colors: [...p.colors] }))
    while (base.length < 4) base.push({ name: 'Player ' + (base.length + 1), colors: [] })
    return base
  })

  const setRow = (i: number, patch: Partial<PlayerConfig>) =>
    setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)))

  const toggleColor = (i: number, c: ManaColor) => {
    const cur = rows[i]!.colors
    const next = cur.includes(c)
      ? cur.filter((x) => x !== c)
      : [...cur, c].sort((a, b) => COLOR_ORDER.indexOf(a) - COLOR_ORDER.indexOf(b))
    setRow(i, { colors: next })
  }

  const begin = () =>
    onStart(
      rows.slice(0, count).map((r) => ({ name: r.name.trim() || 'Player', colors: r.colors })),
      life,
    )

  return (
    <Modal
      title="New game"
      subtitle="Set up your Commander pod."
      maxWidth={560}
      onClose={onClose}
    >
      <span className={styles.sectionLabel}>Players</span>
      <div className={styles.ngCount}>
        {([2, 3, 4] as const).map((n) => (
          <button
            key={n}
            className={count === n ? styles.on : ''}
            onClick={() => setCount(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <div className={styles.ngPlayers}>
        {rows.slice(0, count).map((r, i) => (
          <div className={styles.ngProw} key={i}>
            <input
              value={r.name}
              onChange={(e) => setRow(i, { name: e.target.value })}
            />
            <div className={styles.ngColors}>
              {COLOR_ORDER.map((c) => (
                <button
                  key={c}
                  className={`${styles.ngCbtn}${r.colors.includes(c) ? ' ' + styles.on : ''}`}
                  onClick={() => toggleColor(i, c)}
                >
                  <ManaPip c={c} size={22} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.ngLife}>
        <label>Starting life</label>
        <Stepper value={life} onChange={setLife} min={1} />
        <span className={styles.ngNote}>Commander is 40.</span>
      </div>

      <button
        className="btn-gold"
        style={{ width: '100%', padding: 15, marginTop: 14 }}
        onClick={begin}
      >
        Begin game
      </button>
    </Modal>
  )
}
