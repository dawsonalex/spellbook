import { PHASES } from '../../data/phases'
import styles from './PhaseTracker.module.css'

interface PhaseTrackerProps {
  phaseIdx: number
  activeName: string
  onJump: (i: number) => void
  onNext: () => void
  onEnd: () => void
  onOpenCombat: () => void
}

export default function PhaseTracker({
  phaseIdx,
  activeName,
  onJump,
  onNext,
  onEnd,
  onOpenCombat,
}: PhaseTrackerProps) {
  const ph = PHASES[phaseIdx]!
  const isCombat = ph.key === 'combat'

  return (
    <>
      <div className={`frame ${styles.track}`}>
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <div className={styles.trackH}>
          — <span className={styles.who}>{activeName}</span>'s turn —
        </div>
        <div className={styles.stops}>
          {PHASES.map((p, i) => {
            const cls = [
              styles.stop,
              i === phaseIdx ? styles.on : i < phaseIdx ? styles.done : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button key={p.key} className={cls} onClick={() => onJump(i)}>
                <span className={styles.dot} />
                <span className={styles.lbl}>{p.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className={`frame ${styles.phaseCard}`}>
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <div className={styles.phaseScroll}>
          <div className={styles.phaseName}>
            {ph.name}
            <small>{ph.tag}</small>
          </div>
          <p className={styles.phaseOne}>{ph.one}</p>

          <div className={styles.phaseDetail}>
            {ph.detail.map((d, i) =>
              typeof d === 'string' ? (
                <p key={i}>{d}</p>
              ) : (
                <p key={i} className={styles.tip}>{d.tip}</p>
              ),
            )}
          </div>
        </div>

        <div className={styles.phaseActions}>
          {isCombat && (
            <button className={styles.combatCta} onClick={onOpenCombat}>
              Open combat walkthrough →
            </button>
          )}
        </div>
      </div>

      <div className={styles.turnBar}>
        <button className={`${styles.turnBtn} ${styles.next}`} onClick={onNext}>
          {phaseIdx >= PHASES.length - 1 ? 'Finish turn ▸' : 'Next phase ▸'}
        </button>
        <button className={`${styles.turnBtn} ${styles.end}`} onClick={onEnd}>
          End turn ⤿
        </button>
      </div>
    </>
  )
}
