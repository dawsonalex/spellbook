import type { Player } from '../../types'
import { MANA } from '../../data/mana'
import ManaPip from '../shared/ManaPip'
import styles from './PlayerSheet.module.css'

interface PlayerSheetProps {
  player: Player
  isActive: boolean
  others: Player[]
  onLife: (delta: number) => void
  onCmdr: (sourceId: string, delta: number) => void
  onRevive: () => void
  onClose: () => void
}

export default function PlayerSheet({
  player,
  isActive,
  others,
  onLife,
  onCmdr,
  onRevive,
  onClose,
}: PlayerSheetProps) {
  const maxCmdr = Math.max(0, ...Object.values(player.cmdr))
  const dead = player.life <= 0 || maxCmdr >= 21
  const low = player.life > 0 && player.life <= 12

  return (
    <div className={styles.scrim} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.grab} />
        <div className={styles.head}>
          <div>
            <div className={styles.pcName}>{player.name}</div>
            <div className={styles.pcPips}>
              {(player.colors.length ? player.colors : ['C']).map((c, i) => (
                <ManaPip key={c + i} c={c} size={18} />
              ))}
            </div>
          </div>
          <div className={styles.headRight}>
            {isActive && <span className={styles.seal}>◆ Active turn</span>}
            <button className={styles.xBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.pcLife}>
            <button className={styles.lbtn} onClick={() => onLife(-1)} aria-label="lose life">–</button>
            <span className={`${styles.lifeNum}${low ? ' ' + styles.low : ''}`}>{player.life}</span>
            <button className={styles.lbtn} onClick={() => onLife(1)} aria-label="gain life">+</button>
          </div>

          {others.length > 0 && (
            <div className={styles.pcCmd}>
              <div className={styles.pcCmdH}>Commander damage taken</div>
              <div className={styles.cmdRow}>
                {others.map((o) => {
                  const v = player.cmdr[o.id] ?? 0
                  const chipCls = [
                    styles.cmdChip,
                    v >= 21 ? styles.lethal : v >= 15 ? styles.warn : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                  const dotColor = MANA[o.colors[0] ?? 'C'] ?? MANA['C']!
                  return (
                    <span key={o.id} className={chipCls} title={`From ${o.name}`}>
                      <span
                        className={styles.dot}
                        style={{
                          background: dotColor.bg,
                          boxShadow: o.colors[0] === 'W' ? 'inset 0 0 0 1px #c9bf86' : undefined,
                        }}
                      />
                      <button className={styles.cmdMini} onClick={() => onCmdr(o.id, -1)}>–</button>
                      <span className={styles.v}>{v}</span>
                      <button className={styles.cmdMini} onClick={() => onCmdr(o.id, 1)}>+</button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {dead && (
            <div className={styles.deadRow}>
              <span className={styles.deadLbl}>Eliminated</span>
              <button
                className={styles.reviveBtn}
                onClick={() => { onRevive(); onClose() }}
              >
                Bring back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
