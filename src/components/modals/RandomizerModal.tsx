import { useState } from 'react'
import type { Player } from '../../types'
import Modal from '../shared/Modal'
import styles from './RandomizerModal.module.css'

interface RandomizerModalProps {
  players: Player[]
  onSetActive: (i: number) => void
  onClose: () => void
}

export default function RandomizerModal({ players, onSetActive, onClose }: RandomizerModalProps) {
  const [pick, setPick] = useState<number | null>(null)
  const [tick, setTick] = useState(0)

  const choose = () => {
    const i = Math.floor(Math.random() * players.length)
    setPick(i)
    setTick((t) => t + 1)
  }

  return (
    <Modal
      title="Who goes first?"
      subtitle="Random starting player & the mulligan rule."
      maxWidth={560}
      onClose={onClose}
    >
      <div className={styles.randSection}>
        <button className="btn-gold" style={{ width: '100%', padding: 14 }} onClick={choose}>
          ✦ Randomize starting player
        </button>
        {pick != null && (
          <div className={`${styles.randResult} ${styles.spin}`} key={tick}>
            {players[pick]!.name} goes first
            <button
              className={`btn-ghost ${styles.setActive}`}
              onClick={() => { onSetActive(pick); onClose() }}
            >
              Set as active turn →
            </button>
          </div>
        )}
      </div>

      <div className="divider-orn">✦ ✦ ✦</div>

      <div className={styles.randSection}>
        <h3 className={styles.mullSubhead}>The London mulligan</h3>
        <div className={styles.mullText}>
          <p>Don't like your opening hand? You may <b>mulligan</b>: shuffle it back and draw seven new cards.</p>
          <p>For each mulligan you've taken, put that many cards from your hand on the bottom of your library after you decide to keep. (1st mulligan → bottom 1, 2nd → bottom 2, and so on.)</p>
          <p className={styles.mullNote}>You can keep mulliganing as much as you like, but you'll bottom more cards each time.</p>
        </div>
      </div>
    </Modal>
  )
}
