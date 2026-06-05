import { useState } from 'react'
import Modal from '../shared/Modal'
import styles from './DiceModal.module.css'

interface DiceResult {
  v: number | string
  label: string
}

const DICE: [number, string][] = [[4, 'd4'], [6, 'd6'], [8, 'd8'], [10, 'd10'], [20, 'd20'], [100, 'd100']]

interface DiceModalProps {
  onClose: () => void
}

export default function DiceModal({ onClose }: DiceModalProps) {
  const [res, setRes] = useState<DiceResult | null>(null)
  const [tick, setTick] = useState(0)

  const roll = (sides: number, label: string) => {
    const v =
      label === 'coin'
        ? Math.random() < 0.5 ? 'Heads' : 'Tails'
        : 1 + Math.floor(Math.random() * sides)
    setRes({ v, label: label === 'coin' ? 'coin flip' : 'd' + sides })
    setTick((t) => t + 1)
  }

  return (
    <Modal
      title="Dice & coin"
      subtitle="For coin flips, random targets, and dice effects."
      maxWidth={560}
      onClose={onClose}
    >
      <div className={styles.diceGrid}>
        {DICE.map(([s, l]) => (
          <button key={l} className={styles.dieBtn} onClick={() => roll(s, l)}>
            {l}
          </button>
        ))}
        <button className={styles.dieBtn} onClick={() => roll(2, 'coin')}>Coin</button>
      </div>
      <div className={styles.diceResult}>
        {res ? (
          <>
            <div className={`${styles.diceBig} ${styles.diceRoll}`} key={tick}>
              {res.v}
            </div>
            <div className={styles.diceLbl}>{res.label}</div>
          </>
        ) : (
          <div className={styles.diceLbl}>Pick a die or flip a coin.</div>
        )}
      </div>
    </Modal>
  )
}
