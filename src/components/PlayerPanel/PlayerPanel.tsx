import { useState, useRef } from 'react'
import type { Player, ManaColor } from '../../types'
import { MANA, COLOR_ORDER } from '../../data/mana'
import ManaPip from '../shared/ManaPip'
import styles from './PlayerPanel.module.css'

interface ColorEditorProps {
  colors: ManaColor[]
  onChange: (colors: ManaColor[]) => void
  onClose: () => void
}

function ColorEditor({ colors, onChange, onClose }: ColorEditorProps) {
  return (
    <div className={styles.colorEditor} onClick={(e) => e.stopPropagation()}>
      <div className={styles.ceH}>Color identity</div>
      <div className={styles.cePips}>
        {COLOR_ORDER.map((c) => {
          const on = colors.includes(c)
          return (
            <button
              key={c}
              className={`${styles.cePip}${on ? ' ' + styles.on : ''}`}
              onClick={() => {
                const next = on
                  ? colors.filter((x) => x !== c)
                  : [...colors, c].sort(
                      (a, b) => COLOR_ORDER.indexOf(a) - COLOR_ORDER.indexOf(b),
                    )
                onChange(next)
              }}
            >
              <ManaPip c={c} size={26} />
            </button>
          )
        })}
      </div>
      <button className={`btn-ghost ${styles.ceDone}`} onClick={onClose}>
        Done
      </button>
    </div>
  )
}

interface PlayerPanelProps {
  player: Player
  isActive: boolean
  others: Player[]
  onLife: (delta: number) => void
  onCmdr: (sourceId: string, delta: number) => void
  onRename: (name: string) => void
  onColors: (colors: ManaColor[]) => void
  onRevive: () => void
}

export default function PlayerPanel({
  player,
  isActive,
  others,
  onLife,
  onCmdr,
  onRename,
  onColors,
  onRevive,
}: PlayerPanelProps) {
  const [editingColors, setEditingColors] = useState(false)
  const nameRef = useRef<HTMLDivElement>(null)

  const maxCmdr = Math.max(0, ...Object.values(player.cmdr))
  const dead = player.life <= 0 || maxCmdr >= 21
  const low = player.life > 0 && player.life <= 5

  const commitName = () => {
    const t = nameRef.current?.textContent?.trim() || 'Player'
    onRename(t)
  }

  const rootClass = [
    'frame',
    styles.player,
    isActive ? styles.active : '',
    dead ? styles.dead : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />

      <div className={styles.pTop}>
        <div style={{ minWidth: 0 }}>
          <div
            ref={nameRef}
            className={styles.pName}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                e.currentTarget.blur()
              }
            }}
          >
            {player.name}
          </div>
          <div className={styles.pPips}>
            {(player.colors.length ? player.colors : ['C']).map((c, i) => (
              <ManaPip key={c + i} c={c} size={16} />
            ))}
            <button
              className={styles.editColors}
              title="Edit colors"
              onClick={() => setEditingColors((v) => !v)}
            >
              ✎
            </button>
            {editingColors && (
              <ColorEditor
                colors={player.colors}
                onChange={onColors}
                onClose={() => setEditingColors(false)}
              />
            )}
          </div>
        </div>
        {isActive && <span className={styles.seal}>◆ Active turn</span>}
      </div>

      <div className={styles.pLife}>
        <button className={styles.lbtn} onClick={() => onLife(-1)} aria-label="lose life">
          –
        </button>
        <span className={`${styles.lifeNum}${low ? ' ' + styles.low : ''}`}>{player.life}</span>
        <button className={styles.lbtn} onClick={() => onLife(1)} aria-label="gain life">
          +
        </button>
      </div>

      <div className={styles.pCmd}>
        <div className={styles.pCmdH}>Commander damage taken</div>
        <div className={styles.cmdRow}>
          {others.map((o) => {
            const v = player.cmdr[o.id] ?? 0
            const chipClass = [
              styles.cmdChip,
              v >= 21 ? styles.lethal : v >= 15 ? styles.warn : '',
            ]
              .filter(Boolean)
              .join(' ')
            const dotColor = MANA[o.colors[0] ?? 'C'] ?? MANA['C']!
            return (
              <span key={o.id} className={chipClass} title={`From ${o.name}`}>
                <span
                  className={styles.dot}
                  style={{
                    background: dotColor.bg,
                    boxShadow:
                      o.colors[0] === 'W' ? 'inset 0 0 0 1px #c9bf86' : undefined,
                  }}
                />
                <button className={styles.cmdMini} onClick={() => onCmdr(o.id, -1)}>
                  –
                </button>
                <span className={styles.v}>{v}</span>
                <button className={styles.cmdMini} onClick={() => onCmdr(o.id, 1)}>
                  +
                </button>
              </span>
            )
          })}
        </div>
      </div>

      {dead && (
        <div className={styles.deadBanner}>
          <span className={styles.deadLbl}>Eliminated</span>
          <button onClick={onRevive}>Bring back</button>
        </div>
      )}
    </div>
  )
}
