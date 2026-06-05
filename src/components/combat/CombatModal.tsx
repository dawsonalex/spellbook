import { useState, useRef } from 'react'
import type { Player, DamageMap } from '../../types'
import { COMBAT_STEPS } from '../../data/combatSteps'
import ManaPip from '../shared/ManaPip'
import Stepper from '../shared/Stepper'
import Chip from '../shared/Chip'
import { resolveCombat } from './resolveCombat'
import type { CombatResult } from './resolveCombat'
import styles from './CombatModal.module.css'

interface BlockerRow {
  bid: string
  power: number
  tough: number
  firstStrike: boolean
  doubleStrike: boolean
  deathtouch: boolean
}

interface AttackerRow {
  uid: string
  power: number
  tough: number
  isCommander: boolean
  firstStrike: boolean
  doubleStrike: boolean
  deathtouch: boolean
  trample: boolean
  blocked: boolean
  blockers: BlockerRow[]
  target: string | null
}

type RowOutput =
  | { toPlayer: number; blocked: false }
  | { toPlayer: number; blocked: true; fight: CombatResult }

interface CombatModalProps {
  players: Player[]
  activeIdx: number
  onApply: (map: DamageMap) => void
  onClose: () => void
}

export default function CombatModal({ players, activeIdx, onApply, onClose }: CombatModalProps) {
  const [step, setStep] = useState(0)
  const [showSteps, setShowSteps] = useState(true)
  const bidRef = useRef(0)

  const active = players[activeIdx]!
  const opponents = players.filter(
    (p, i) =>
      i !== activeIdx &&
      p.life > 0 &&
      Math.max(0, ...Object.values(p.cmdr)) < 21,
  )

  const newAttacker = (): AttackerRow => ({
    uid: Math.random().toString(36).slice(2),
    power: 3,
    tough: 3,
    isCommander: false,
    firstStrike: false,
    doubleStrike: false,
    deathtouch: false,
    trample: false,
    blocked: false,
    blockers: [{ bid: 'b' + (++bidRef.current), power: 2, tough: 2, firstStrike: false, doubleStrike: false, deathtouch: false }],
    target: opponents[0]?.id ?? null,
  })

  const [atk, setAtk] = useState<AttackerRow[]>([newAttacker()])

  const updateAtk = (uid: string, patch: Partial<AttackerRow>) =>
    setAtk((a) => a.map((x) => (x.uid === uid ? { ...x, ...patch } : x)))

  const removeAtk = (uid: string) => setAtk((a) => a.filter((x) => x.uid !== uid))

  const toggleBlocked = (r: AttackerRow) =>
    updateAtk(r.uid, {
      blocked: !r.blocked,
      blockers: r.blockers.length ? r.blockers : [{ bid: 'b' + (++bidRef.current), power: 2, tough: 2, firstStrike: false, doubleStrike: false, deathtouch: false }],
    })

  const updateBlocker = (uid: string, bid: string, patch: Partial<BlockerRow>) =>
    setAtk((a) =>
      a.map((x) =>
        x.uid !== uid
          ? x
          : { ...x, blockers: x.blockers.map((b) => (b.bid === bid ? { ...b, ...patch } : b)) },
      ),
    )

  const addBlocker = (uid: string) =>
    setAtk((a) =>
      a.map((x) =>
        x.uid !== uid ? x : { ...x, blockers: [...x.blockers, { bid: 'b' + (++bidRef.current), power: 2, tough: 2, firstStrike: false, doubleStrike: false, deathtouch: false }] },
      ),
    )

  const removeBlocker = (uid: string, bid: string) =>
    setAtk((a) =>
      a.map((x) =>
        x.uid !== uid ? x : { ...x, blockers: x.blockers.filter((b) => b.bid !== bid) },
      ),
    )

  function rowOut(r: AttackerRow): RowOutput {
    const p = Math.max(0, r.power)
    if (!r.blocked) return { toPlayer: p, blocked: false }
    const a = {
      power: p,
      tough: Math.max(0, r.tough),
      firstStrike: r.firstStrike,
      doubleStrike: r.doubleStrike,
      deathtouch: r.deathtouch,
      trample: r.trample,
    }
    const bl = r.blockers.map((b) => ({
      power: Math.max(0, b.power),
      tough: Math.max(0, b.tough),
      firstStrike: b.firstStrike,
      doubleStrike: b.doubleStrike,
      deathtouch: b.deathtouch,
    }))
    const fight = resolveCombat(a, bl)
    return { toPlayer: r.trample ? fight.trample : 0, blocked: true, fight }
  }

  const map: DamageMap = {}
  for (const o of opponents) map[o.id] = { total: 0, cmdr: 0 }
  for (const r of atk) {
    if (!r.target || !map[r.target]) continue
    const out = rowOut(r)
    map[r.target]!.total += out.toPlayer
    if (r.isCommander) map[r.target]!.cmdr += out.toPlayer
  }

  const apply = () => { onApply(map); onClose() }
  const cur = COMBAT_STEPS[step]!

  const bodyClass = `modal-body ${styles.combatGrid}${showSteps ? '' : ' ' + styles.solo}`

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 1180 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Combat</h2>
            <div className="sub">
              Step through it together — both players may respond before anything resolves.
            </div>
          </div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>

        <div className={bodyClass}>
          {!showSteps && (
            <button className={styles.cwReopen} onClick={() => setShowSteps(true)}>
              Show guide ›
            </button>
          )}

          {/* walkthrough guide */}
          <div className={styles.cw}>
            <div className={styles.cwBar}>
              <div className={styles.cwH} style={{ marginBottom: 0 }}>The five steps</div>
              <button className={styles.cwCollapse} onClick={() => setShowSteps(false)}>
                ‹ Hide
              </button>
            </div>
            <ol className={styles.cwSteps}>
              {COMBAT_STEPS.map((s, i) => {
                const cls = `${styles.cwStep}${i === step ? ' ' + styles.on : i < step ? ' ' + styles.done : ''}`
                return (
                  <li key={i} className={cls}>
                    <button onClick={() => setStep(i)}>
                      <span className={styles.cwNum}>{i + 1}</span>
                      <span className={styles.cwStepname}>
                        {s.name}
                        <em>{s.one}</em>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            <div className={styles.cwDetail}>
              <div className={styles.cwDetailName}>{cur.name}</div>
              <p>{cur.body}</p>
              <div className={styles.cwStack}>
                <span className={styles.cwStackTag}>When can people add to the stack?</span>
                {cur.stack}
              </div>
              <div className={styles.cwNav}>
                <button
                  className="btn-ghost"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                >
                  ◂ Prev
                </button>
                <button
                  className="btn-gold"
                  disabled={step === COMBAT_STEPS.length - 1}
                  onClick={() => setStep((s) => Math.min(COMBAT_STEPS.length - 1, s + 1))}
                >
                  Next ▸
                </button>
              </div>
            </div>
          </div>

          {/* damage resolver */}
          <div className={styles.cr}>
            <div className={styles.cwH}>Who deals damage to whom</div>
            <p className={styles.crIntro}>
              <strong>{active.name}</strong> is attacking. Add each attacking creature and set its
              power. Mark it blocked to enter the blockers' stats and see how the fight resolves.
            </p>

            {opponents.length === 0 && (
              <p className={styles.crEmpty}>No eligible opponents to attack.</p>
            )}

            <div className={styles.crRows}>
              {atk.map((r, idx) => {
                const out = rowOut(r)
                const tgtName = opponents.find((o) => o.id === r.target)?.name
                return (
                  <div className={styles.crRow} key={r.uid}>
                    <div className={styles.crRowTop}>
                      <span className={styles.crRowlbl}>Attacker {idx + 1}</span>
                      {atk.length > 1 && (
                        <button className={styles.crDel} onClick={() => removeAtk(r.uid)}>
                          remove
                        </button>
                      )}
                    </div>
                    <div className={styles.crFields}>
                      <label className={styles.crField}>
                        <span>Power</span>
                        <Stepper value={r.power} onChange={(v) => updateAtk(r.uid, { power: v })} />
                      </label>
                      <label className={`${styles.crField} ${styles.crTgt}`}>
                        <span>Attacks</span>
                        <select
                          value={r.target ?? ''}
                          disabled={r.blocked && !r.trample}
                          onChange={(e) => updateAtk(r.uid, { target: e.target.value })}
                        >
                          {opponents.map((o) => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className={styles.crToggles}>
                      <Chip
                        small
                        on={r.isCommander}
                        onClick={() => updateAtk(r.uid, { isCommander: !r.isCommander })}
                        label="Commander"
                      />
                      <Chip
                        small
                        on={r.blocked}
                        onClick={() => toggleBlocked(r)}
                        label="Blocked"
                      />
                    </div>

                    {out.blocked && (
                      <div className={styles.fight}>
                        <div className={styles.fightCols}>
                          <div className={`${styles.fcol} ${styles.atkcol}`}>
                            <div className={styles.fcolH}>
                              Your attacker <b>{r.power}/{r.tough}</b>
                              <span className={`${styles.stat} ${out.fight.attackerDies ? styles.dead : styles.live}`}>
                                {out.fight.attackerDies ? 'destroyed' : 'survives'}
                              </span>
                            </div>
                            <label className={styles.fline}>
                              <span>Toughness</span>
                              <Stepper value={r.tough} onChange={(v) => updateAtk(r.uid, { tough: v })} />
                            </label>
                            <div className={styles.chiprow}>
                              <Chip small on={r.firstStrike} onClick={() => updateAtk(r.uid, { firstStrike: !r.firstStrike })} label="First strike" />
                              <Chip small on={r.doubleStrike} onClick={() => updateAtk(r.uid, { doubleStrike: !r.doubleStrike })} label="Double strike" />
                              <Chip small on={r.deathtouch} onClick={() => updateAtk(r.uid, { deathtouch: !r.deathtouch })} label="Deathtouch" />
                              <Chip small on={r.trample} onClick={() => updateAtk(r.uid, { trample: !r.trample })} label="Trample" />
                            </div>
                          </div>

                          <div className={`${styles.fcol} ${styles.blkcol}`}>
                            <div className={styles.fcolH}>
                              Blockers <b>{r.blockers.length}</b>
                              {r.blockers.length > 1 && (
                                <span className={styles.fcolNote}>damage assigned top → bottom</span>
                              )}
                            </div>
                            <div className={styles.blkcards}>
                              {r.blockers.map((b, bi) => {
                                const bResult = out.fight.blockers[bi]
                                return (
                                  <div className={styles.blkcard} key={b.bid}>
                                    <div className={styles.blkcardTop}>
                                      <span className={styles.blkcardName}>
                                        Blocker {bi + 1} <b>{b.power}/{b.tough}</b>
                                      </span>
                                      <span className={`${styles.stat} ${bResult?.dies ? styles.dead : styles.live}`}>
                                        {bResult?.dies ? 'destroyed' : 'survives'}
                                      </span>
                                      {r.blockers.length > 1 && (
                                        <button
                                          className={styles.blkX}
                                          onClick={() => removeBlocker(r.uid, b.bid)}
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </div>
                                    <div className={styles.blkStats}>
                                      <label className={styles.fline}>
                                        <span>P</span>
                                        <Stepper value={b.power} onChange={(v) => updateBlocker(r.uid, b.bid, { power: v })} />
                                      </label>
                                      <label className={styles.fline}>
                                        <span>T</span>
                                        <Stepper value={b.tough} onChange={(v) => updateBlocker(r.uid, b.bid, { tough: v })} />
                                      </label>
                                    </div>
                                    <div className={styles.chiprow}>
                                      <Chip small on={b.firstStrike} onClick={() => updateBlocker(r.uid, b.bid, { firstStrike: !b.firstStrike })} label="First strike" />
                                      <Chip small on={b.doubleStrike} onClick={() => updateBlocker(r.uid, b.bid, { doubleStrike: !b.doubleStrike })} label="Double strike" />
                                      <Chip small on={b.deathtouch} onClick={() => updateBlocker(r.uid, b.bid, { deathtouch: !b.deathtouch })} label="Deathtouch" />
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            <button className={styles.addBlk} onClick={() => addBlocker(r.uid)}>
                              + add blocker (gang block)
                            </button>
                          </div>
                        </div>

                        <div className={styles.fightRes}>
                          <span className={`${styles.resLine} ${out.fight.attackerDies ? styles.dead : styles.live}`}>
                            {out.fight.attackerDies ? '✗' : '✓'} Your attacker{' '}
                            {out.fight.attackerDies ? 'is destroyed' : 'survives'}
                          </span>
                          <span className={`${styles.resLine} ${out.fight.deadCount > 0 ? styles.dead : styles.live}`}>
                            {out.fight.deadCount > 0 ? '✗' : '✓'} {out.fight.deadCount} of{' '}
                            {r.blockers.length} blocker{r.blockers.length > 1 ? 's' : ''} destroyed
                          </span>
                          {out.fight.anyFS &&
                            (out.fight.fs.attackerDied || out.fight.fs.blockerDeaths > 0) && (
                              <div className={styles.resNote}>
                                First strike:{' '}
                                {out.fight.fs.attackerDied
                                  ? 'your attacker dies before it can deal damage.'
                                  : `${out.fight.fs.blockerDeaths} blocker${out.fight.fs.blockerDeaths > 1 ? 's die' : ' dies'} before striking back.`}
                              </div>
                            )}
                          {r.trample && (
                            <div
                              className={`${styles.resTrample}${out.fight.trample > 0 ? '' : ' ' + styles.muted}`}
                            >
                              {out.fight.trample > 0 ? (
                                <span>
                                  ⮕ <b>{out.fight.trample}</b> tramples through to {tgtName}
                                  {r.isCommander ? ' (commander)' : ''}
                                </span>
                              ) : (
                                <span>No damage tramples through.</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!out.blocked && (
                      <div className={styles.crOut}>
                        →{' '}
                        {out.toPlayer > 0 ? (
                          <span>
                            <b>{out.toPlayer}</b> damage to {tgtName}
                            {r.isCommander ? ' (commander)' : ''}
                          </span>
                        ) : (
                          <span className={styles.muted}>no damage</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {opponents.length > 0 && (
              <button className={styles.crAdd} onClick={() => setAtk((a) => [...a, newAttacker()])}>
                + Add another attacker
              </button>
            )}

            <div className={styles.crSummary}>
              <div className={styles.cwH} style={{ marginBottom: 8 }}>
                Damage to apply to players
              </div>
              {opponents.map((o) => {
                const m = map[o.id]!
                return (
                  <div className={styles.crSumrow} key={o.id}>
                    <ManaPip c={o.colors[0] ?? 'C'} size={16} />
                    <span className={styles.crSumname}>{o.name}</span>
                    <span className={styles.crSumval}>
                      {m.total > 0 ? `−${m.total} life` : '—'}
                      {m.cmdr > 0 ? `  ·  +${m.cmdr} cmdr` : ''}
                    </span>
                  </div>
                )
              })}
            </div>

            <button
              className={`btn-gold ${styles.crApply}`}
              disabled={opponents.length === 0}
              onClick={apply}
            >
              Apply damage to life totals
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
