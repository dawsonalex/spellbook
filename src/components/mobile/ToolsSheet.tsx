import type { ModalKey } from '../../types'
import styles from './ToolsSheet.module.css'

const TOOLS: Array<{ key: NonNullable<ModalKey>; icon: string; title: string; sub: string }> = [
  { key: 'anatomy', icon: '❖', title: 'Card anatomy', sub: 'Read any card at a glance' },
  { key: 'glossary', icon: '📖', title: 'Glossary', sub: 'Keywords & core concepts' },
  { key: 'dice', icon: '⚄', title: 'Dice & coin', sub: 'Rolls, flips, random targets' },
  { key: 'random', icon: '✦', title: 'Who goes first', sub: 'Random start & mulligan' },
  { key: 'newgame', icon: '✚', title: 'New game', sub: 'Set up your pod' },
]

interface ToolsSheetProps {
  onOpen: (key: ModalKey) => void
  onClose: () => void
}

export default function ToolsSheet({ onOpen, onClose }: ToolsSheetProps) {
  return (
    <div className={styles.scrim} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.grab} />
        <div className={styles.head}>
          <div>
            <h2 className={styles.title}>Tools</h2>
            <div className={styles.sub}>Reference & helpers, any time.</div>
          </div>
          <button className={styles.xBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>
          <div className={styles.toolList}>
            {TOOLS.map(({ key, icon, title, sub }) => (
              <button
                key={key}
                className={styles.toolItem}
                onClick={() => { onClose(); onOpen(key) }}
              >
                <span className={styles.ic}>{icon}</span>
                <span className={styles.tx}>
                  <b>{title}</b>
                  <span>{sub}</span>
                </span>
                <span className={styles.chev}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
