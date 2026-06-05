/* ===== Combat walkthrough + "who damages whom" resolver ===== */

// Resolve one attacker against any number of blockers. Honors first/double
// strike, deathtouch and trample. Damage within a step is simultaneous;
// deaths are checked between steps. The attacker assigns damage to blockers
// in list order (lethal first), trampling any excess to the player.
function resolveCombat(a, blockers) {
  const anyFS = a.firstStrike || a.doubleStrike || blockers.some((b) => b.firstStrike || b.doubleStrike);
  const dealsInStep = (c, s) => s === "fs" ? (c.firstStrike || c.doubleStrike) : (c.doubleStrike || !c.firstStrike);
  let aMarked = 0, aAlive = true, aDeathtouched = false, tramp = 0;
  const bs = blockers.map((b) => ({ ...b, marked: 0, alive: true, dt: false }));
  const fs = { attackerDied: false, blockerDeaths: 0 };
  const stepList = anyFS ? ["fs", "regular"] : ["regular"];

  stepList.forEach((s) => {
    // attacker assigns damage
    if (aAlive && dealsInStep(a, s)) {
      let pow = a.power;
      for (const b of bs) {
        if (!b.alive || pow <= 0) continue;
        const lethal = a.deathtouch ? (b.marked >= 1 ? 0 : 1) : Math.max(0, b.tough - b.marked);
        const assign = Math.min(pow, lethal);
        b.marked += assign; pow -= assign;
        if (a.deathtouch && assign > 0) b.dt = true;
      }
      if (a.trample) tramp += Math.max(0, pow);
    }
    // blockers strike back
    bs.forEach((b) => {
      if (b.alive && dealsInStep(b, s)) {
        aMarked += b.power;
        if (b.deathtouch && b.power > 0) aDeathtouched = true;
      }
    });
    // resolve deaths after the step
    bs.forEach((b) => { if (b.dt || b.marked >= b.tough) b.alive = false; });
    if (aDeathtouched || aMarked >= a.tough) aAlive = false;
    if (s === "fs") { fs.attackerDied = !aAlive; fs.blockerDeaths = bs.filter((b) => !b.alive).length; }
  });

  return {
    attackerDies: !aAlive,
    blockers: bs.map((b) => ({ dies: !b.alive })),
    deadCount: bs.filter((b) => !b.alive).length,
    trample: tramp, anyFS, fs,
  };
}

function CStepper({ value, onChange, min = 0 }) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(min, (+value || 0) - 1))}>–</button>
      <input type="number" value={value} min={min} onChange={(e) => onChange(e.target.value)} />
      <button onClick={() => onChange((+value || 0) + 1)}>+</button>
    </div>
  );
}

let _bid = 0;
const newBlocker = () => ({ bid: "b" + (++_bid), power: 2, tough: 2, firstStrike: false, doubleStrike: false, deathtouch: false });

function CombatModal({ players, activeIdx, onApply, onClose }) {
  const steps = window.COMBAT_STEPS;
  const [step, setStep] = React.useState(0);
  const [showSteps, setShowSteps] = React.useState(true);
  const active = players[activeIdx];
  const opponents = players.filter((p, i) => i !== activeIdx && p.life > 0 && Math.max(0, ...Object.values(p.cmdr || {})) < 21);

  const newAttacker = () => ({
    uid: Math.random().toString(36).slice(2),
    power: 3, tough: 3, isCommander: false,
    firstStrike: false, doubleStrike: false, deathtouch: false, trample: false,
    blocked: false, blockers: [newBlocker()],
    target: opponents[0] ? opponents[0].id : null,
  });
  const [atk, setAtk] = React.useState([newAttacker()]);
  const update = (uid, patch) => setAtk((a) => a.map((x) => x.uid === uid ? { ...x, ...patch } : x));
  const remove = (uid) => setAtk((a) => a.filter((x) => x.uid !== uid));
  const toggleBlocked = (r) => update(r.uid, { blocked: !r.blocked, blockers: (r.blockers && r.blockers.length) ? r.blockers : [newBlocker()] });
  const updateBlocker = (uid, bid, patch) => setAtk((a) => a.map((x) => x.uid !== uid ? x : { ...x, blockers: x.blockers.map((b) => b.bid === bid ? { ...b, ...patch } : b) }));
  const addBlocker = (uid) => setAtk((a) => a.map((x) => x.uid !== uid ? x : { ...x, blockers: [...x.blockers, newBlocker()] }));
  const removeBlocker = (uid, bid) => setAtk((a) => a.map((x) => x.uid !== uid ? x : { ...x, blockers: x.blockers.filter((b) => b.bid !== bid) }));

  const rowOut = (r) => {
    const p = Math.max(0, +r.power || 0);
    if (!r.blocked) return { toPlayer: p, blocked: false };
    const a = { power: p, tough: Math.max(0, +r.tough || 0), firstStrike: r.firstStrike, doubleStrike: r.doubleStrike, deathtouch: r.deathtouch, trample: r.trample };
    const bl = (r.blockers || []).map((b) => ({ power: Math.max(0, +b.power || 0), tough: Math.max(0, +b.tough || 0), firstStrike: b.firstStrike, doubleStrike: b.doubleStrike, deathtouch: b.deathtouch }));
    const fight = resolveCombat(a, bl);
    return { toPlayer: r.trample ? fight.trample : 0, blocked: true, fight };
  };

  // damage map for the summary
  const map = {};
  opponents.forEach((o) => (map[o.id] = { total: 0, cmdr: 0 }));
  atk.forEach((r) => {
    if (!r.target || !map[r.target]) return;
    const { toPlayer } = rowOut(r);
    map[r.target].total += toPlayer;
    if (r.isCommander) map[r.target].cmdr += toPlayer;
  });

  const apply = () => { onApply(map); onClose(); };
  const cur = steps[step];
  const Chip = ({ on, onClick, label }) => (
    <button className={"chk sm" + (on ? " on" : "")} onClick={onClick}><i />{label}</button>
  );

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal combat-modal" style={{ "--mw": "1180px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Combat</h2>
            <div className="sub">Step through it together — both players may respond before anything resolves.</div>
          </div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>

        <div className={"modal-body combat-grid" + (showSteps ? "" : " solo")}>
          {/* re-open tab when guide is hidden */}
          {!showSteps && <button className="cw-reopen" onClick={() => setShowSteps(true)}>Show guide ›</button>}

          {/* ---- walkthrough ---- */}
          <div className="cw">
            <div className="cw-bar">
              <div className="cw-h" style={{ margin: 0 }}>The five steps</div>
              <button className="cw-collapse" onClick={() => setShowSteps(false)}>‹ Hide</button>
            </div>
            <ol className="cw-steps">
              {steps.map((s, i) => (
                <li key={i} className={"cw-step" + (i === step ? " on" : i < step ? " done" : "")}>
                  <button onClick={() => setStep(i)}>
                    <span className="cw-num">{i + 1}</span>
                    <span className="cw-stepname">{s.name}<em>{s.one}</em></span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="cw-detail">
              <div className="cw-detail-name">{cur.name}</div>
              <p>{cur.body}</p>
              <div className="cw-stack"><span className="cw-stack-tag">When can people add to the stack?</span>{cur.stack}</div>
              <div className="cw-nav">
                <button className="btn-ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>◂ Prev</button>
                <button className="btn-gold" disabled={step === steps.length - 1} onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>Next ▸</button>
              </div>
            </div>
          </div>

          {/* ---- resolver ---- */}
          <div className="cr">
            <div className="cw-h">Who deals damage to whom</div>
            <p className="cr-intro"><strong>{active.name}</strong> is attacking. Add each attacking creature and set its power. Mark it blocked to enter the blockers’ stats and see how the fight resolves.</p>

            {opponents.length === 0 && <p className="cr-empty">No eligible opponents to attack.</p>}

            <div className="cr-rows">
              {atk.map((r, idx) => {
                const out = rowOut(r);
                const tgtName = (opponents.find((o) => o.id === r.target) || {}).name;
                return (
                  <div className="cr-row" key={r.uid}>
                    <div className="cr-row-top">
                      <span className="cr-rowlbl">Attacker {idx + 1}</span>
                      {atk.length > 1 && <button className="cr-del" onClick={() => remove(r.uid)}>remove</button>}
                    </div>
                    <div className="cr-fields">
                      <label className="cr-field cr-pow">
                        <span>Power</span>
                        <CStepper value={r.power} onChange={(v) => update(r.uid, { power: v })} />
                      </label>
                      <label className="cr-field cr-tgt">
                        <span>Attacks</span>
                        <select value={r.target || ""} disabled={r.blocked && !r.trample}
                          onChange={(e) => update(r.uid, { target: e.target.value })}>
                          {opponents.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                      </label>
                    </div>
                    <div className="cr-toggles">
                      <Chip on={r.isCommander} onClick={() => update(r.uid, { isCommander: !r.isCommander })} label="Commander" />
                      <Chip on={r.blocked} onClick={() => toggleBlocked(r)} label="Blocked" />
                    </div>

                    {r.blocked && (
                      <div className="fight">
                        <div className="fight-cols">
                          <div className="fcol atkcol">
                            <div className="fcol-h">Your attacker <b>{r.power}/{r.tough || 0}</b>
                              <span className={"stat " + (out.fight.attackerDies ? "dead" : "live")}>{out.fight.attackerDies ? "destroyed" : "survives"}</span>
                            </div>
                            <label className="fline"><span>Toughness</span><CStepper value={r.tough} onChange={(v) => update(r.uid, { tough: v })} /></label>
                            <div className="chiprow">
                              <Chip on={r.firstStrike} onClick={() => update(r.uid, { firstStrike: !r.firstStrike })} label="First strike" />
                              <Chip on={r.doubleStrike} onClick={() => update(r.uid, { doubleStrike: !r.doubleStrike })} label="Double strike" />
                              <Chip on={r.deathtouch} onClick={() => update(r.uid, { deathtouch: !r.deathtouch })} label="Deathtouch" />
                              <Chip on={r.trample} onClick={() => update(r.uid, { trample: !r.trample })} label="Trample" />
                            </div>
                          </div>

                          <div className="fcol blkcol">
                            <div className="fcol-h">Blockers <b>{r.blockers.length}</b>
                              {r.blockers.length > 1 && <span className="fcol-note">damage assigned top → bottom</span>}
                            </div>
                            <div className="blkcards">
                              {r.blockers.map((b, bi) => (
                                <div className="blkcard" key={b.bid}>
                                  <div className="blkcard-top">
                                    <span className="blkcard-name">Blocker {bi + 1} <b>{(+b.power || 0)}/{(+b.tough || 0)}</b></span>
                                    <span className={"stat " + (out.fight.blockers[bi] && out.fight.blockers[bi].dies ? "dead" : "live")}>
                                      {out.fight.blockers[bi] && out.fight.blockers[bi].dies ? "destroyed" : "survives"}
                                    </span>
                                    {r.blockers.length > 1 && <button className="blk-x" onClick={() => removeBlocker(r.uid, b.bid)}>✕</button>}
                                  </div>
                                  <div className="blk-stats">
                                    <label className="fline"><span>P</span><CStepper value={b.power} onChange={(v) => updateBlocker(r.uid, b.bid, { power: v })} /></label>
                                    <label className="fline"><span>T</span><CStepper value={b.tough} onChange={(v) => updateBlocker(r.uid, b.bid, { tough: v })} /></label>
                                  </div>
                                  <div className="chiprow">
                                    <Chip on={b.firstStrike} onClick={() => updateBlocker(r.uid, b.bid, { firstStrike: !b.firstStrike })} label="First strike" />
                                    <Chip on={b.doubleStrike} onClick={() => updateBlocker(r.uid, b.bid, { doubleStrike: !b.doubleStrike })} label="Double strike" />
                                    <Chip on={b.deathtouch} onClick={() => updateBlocker(r.uid, b.bid, { deathtouch: !b.deathtouch })} label="Deathtouch" />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <button className="add-blk" onClick={() => addBlocker(r.uid)}>+ add blocker (gang block)</button>
                          </div>
                        </div>

                        <div className="fight-res">
                          <div className={"res-line " + (out.fight.attackerDies ? "dead" : "live")}>
                            {out.fight.attackerDies ? "✗" : "✓"} Your attacker {out.fight.attackerDies ? "is destroyed" : "survives"}
                          </div>
                          <div className={"res-line " + (out.fight.deadCount > 0 ? "dead" : "live")}>
                            {out.fight.deadCount > 0 ? "✗" : "✓"} {out.fight.deadCount} of {r.blockers.length} blocker{r.blockers.length > 1 ? "s" : ""} destroyed
                          </div>
                          {out.fight.anyFS && (out.fight.fs.attackerDied || out.fight.fs.blockerDeaths > 0) && (
                            <div className="res-note">First strike: {out.fight.fs.attackerDied
                              ? "your attacker dies before it can deal damage."
                              : `${out.fight.fs.blockerDeaths} blocker${out.fight.fs.blockerDeaths > 1 ? "s die" : " dies"} before striking back.`}</div>
                          )}
                          {r.trample && (
                            <div className={"res-trample" + (out.fight.trample > 0 ? "" : " muted")}>
                              {out.fight.trample > 0
                                ? <span>⮕ <b>{out.fight.trample}</b> tramples through to {tgtName}{r.isCommander ? " (commander)" : ""}</span>
                                : <span>No damage tramples through.</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!r.blocked && (
                      <div className="cr-out">→ {out.toPlayer > 0
                        ? <span><b>{out.toPlayer}</b> damage to {tgtName}{r.isCommander ? " (commander)" : ""}</span>
                        : <span className="muted">no damage</span>}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {opponents.length > 0 && (
              <button className="cr-add" onClick={() => setAtk((a) => [...a, newAttacker()])}>+ Add another attacker</button>
            )}

            <div className="cr-summary">
              <div className="cw-h" style={{ marginBottom: 8 }}>Damage to apply to players</div>
              {opponents.map((o) => {
                const m = map[o.id];
                return (
                  <div className="cr-sumrow" key={o.id}>
                    <window.ManaPip c={o.colors[0] || "C"} size={16} />
                    <span className="cr-sumname">{o.name}</span>
                    <span className="cr-sumval">{m.total > 0 ? `−${m.total} life` : "—"}{m.cmdr > 0 ? `  ·  +${m.cmdr} cmdr` : ""}</span>
                  </div>
                );
              })}
            </div>

            <button className="btn-gold cr-apply" disabled={opponents.length === 0} onClick={apply}>Apply damage to life totals</button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.CombatModal = CombatModal;
