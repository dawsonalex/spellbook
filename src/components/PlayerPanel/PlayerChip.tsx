import type { Player } from '../../types'
import ManaPip from '../shared/ManaPip'
import styles from './PlayerChip.module.css'

interface PlayerChipProps {
  player: Player
  isActive: boolean
  isDead: boolean
  onClick: () => void
}

export default function PlayerChip({ player, isActive, isDead, onClick }: PlayerChipProps) {
  const maxCmdr = Math.max(0, ...Object.values(player.cmdr))
  const low = player.life > 0 && player.life <= 12

  const cls = [styles.chip, isActive ? styles.active : '', isDead ? styles.dead : '']
    .filter(Boolean)
    .join(' ')

  return (
    <button className={cls} onClick={onClick}>
      {isActive && <span className={styles.crown}>◆</span>}
      <span className={styles.nm}>{player.name}</span>
      <span className={styles.pips}>
        {(player.colors.length ? player.colors : ['C']).map((c, i) => (
          <ManaPip key={c + i} c={c} size={12} />
        ))}
      </span>
      <span className={`${styles.life}${low ? ' ' + styles.low : ''}`}>{player.life}</span>
      <span className={styles.cmdr}>{maxCmdr > 0 ? `cmdr ${maxCmdr}` : ' '}</span>
    </button>
  )
}
