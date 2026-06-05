/* ===== Phase tracker + detail + turn controls ===== */
function PhaseTracker({ phaseIdx, activeName, onJump, onNext, onEnd, onOpenCombat }) {
  const [open, setOpen] = React.useState(false);
  const phases = window.PHASES;
  const ph = phases[phaseIdx];
  const isCombat = ph.key === "combat";

  React.useEffect(() => { setOpen(false); }, [phaseIdx]);

  return (
    <React.Fragment>
      <div className="frame track">
        <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
        <div className="track-h">— <span className="who">{activeName}</span>’s turn —</div>
        <div className="stops">
          {phases.map((p, i) => (
            <button key={p.key} className={"stop " + (i === phaseIdx ? "on" : i < phaseIdx ? "done" : "")} onClick={() => onJump(i)}>
              <span className="dot" />
              <span className="lbl">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="frame phase-card">
        <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
        <div className="phase-name">{ph.name}<small>{ph.tag}</small></div>
        <p className="phase-one">{ph.one}</p>

        {!open && (
          <button className="phase-more-btn" onClick={() => setOpen(true)}>✦ Tell me more</button>
        )}
        {open && (
          <div className="phase-detail">
            {ph.detail.map((d, i) =>
              typeof d === "string"
                ? <p key={i}>{d}</p>
                : <p key={i} className="tip">{d.tip}</p>
            )}
            <button className="phase-more-btn" style={{ marginTop: 2 }} onClick={() => setOpen(false)}>▲ Show less</button>
          </div>
        )}

        <div className="phase-actions">
          {isCombat && <button className="combat-cta" onClick={onOpenCombat}>Open combat walkthrough →</button>}
        </div>
      </div>

      <div className="turn-bar">
        <button className="turn-btn next" onClick={onNext}>
          {phaseIdx >= phases.length - 1 ? "Finish turn ▸" : "Next phase ▸"}
        </button>
        <button className="turn-btn end" onClick={onEnd}>End turn ⤿</button>
      </div>
    </React.Fragment>
  );
}

window.PhaseTracker = PhaseTracker;
