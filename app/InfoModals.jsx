/* ===== Glossary · Dice · Randomizer · New Game ===== */

function GlossaryModal({ onClose }) {
  const [q, setQ] = React.useState("");
  const ql = q.trim().toLowerCase();
  const groups = window.GLOSSARY.map((g) => ({
    group: g.group,
    items: g.items.filter(([t, d]) => !ql || t.toLowerCase().includes(ql) || d.toLowerCase().includes(ql)),
  })).filter((g) => g.items.length);

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" style={{ "--mw": "840px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Glossary</h2><div className="sub">Keywords &amp; core concepts, in plain language.</div></div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <input className="gl-search" placeholder="Search keywords… (e.g. trample, the stack)" value={q}
            onChange={(e) => setQ(e.target.value)} autoFocus />
          {groups.length === 0 && <p className="gl-empty">No matches for “{q}”.</p>}
          {groups.map((g) => (
            <div className="gl-group" key={g.group}>
              <h3>{g.group}</h3>
              <div className="gl-list">
                {g.items.map(([t, d]) => (
                  <div className="gl-item" key={t}><b>{t}</b><span>{d}</span></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DiceModal({ onClose }) {
  const [res, setRes] = React.useState(null);
  const [tick, setTick] = React.useState(0);
  const roll = (sides, label) => {
    const v = label === "coin" ? (Math.random() < 0.5 ? "Heads" : "Tails") : 1 + Math.floor(Math.random() * sides);
    setRes({ v, label: label === "coin" ? "coin flip" : "d" + sides });
    setTick((t) => t + 1);
  };
  const dice = [[4, "d4"], [6, "d6"], [8, "d8"], [10, "d10"], [20, "d20"], [100, "d100"]];
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" style={{ "--mw": "560px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Dice &amp; coin</h2><div className="sub">For coin flips, random targets, and dice effects.</div></div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="dice-grid">
            {dice.map(([s, l]) => <button key={l} className="die-btn" onClick={() => roll(s, l)}>{l}</button>)}
            <button className="die-btn" onClick={() => roll(2, "coin")}>Coin</button>
          </div>
          <div className="dice-result">
            {res ? (
              <React.Fragment>
                <div className="dice-big dice-roll" key={tick}>{res.v}</div>
                <div className="dice-lbl">{res.label}</div>
              </React.Fragment>
            ) : <div className="dice-lbl">Pick a die or flip a coin.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function RandomizerModal({ players, onSetActive, onClose }) {
  const [pick, setPick] = React.useState(null);
  const [tick, setTick] = React.useState(0);
  const choose = () => {
    const i = Math.floor(Math.random() * players.length);
    setPick(i); setTick((t) => t + 1);
  };
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" style={{ "--mw": "560px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Who goes first?</h2><div className="sub">Random starting player &amp; the mulligan rule.</div></div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="rand-section">
            <button className="btn-gold" style={{ width: "100%", padding: 14 }} onClick={choose}>✦ Randomize starting player</button>
            {pick != null && (
              <div className="rand-result spin" key={tick}>
                {players[pick].name} goes first
                <div style={{ marginTop: 12 }}>
                  <button className="btn-ghost" style={{ fontSize: 12, padding: "9px 14px" }}
                    onClick={() => { onSetActive(pick); onClose(); }}>Set as active turn →</button>
                </div>
              </div>
            )}
          </div>
          <div className="divider-orn">✦ ✦ ✦</div>
          <div className="rand-section">
            <h3 style={{ fontFamily: "var(--font-disp)", fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold-dark)", borderBottom: "1px solid var(--gold-dim)", paddingBottom: 6 }}>The London mulligan</h3>
            <div className="mull-text">
              <p>Don’t like your opening hand? You may <b>mulligan</b>: shuffle it back and draw seven new cards.</p>
              <p>For each mulligan you’ve taken, put that many cards from your hand on the bottom of your library after you decide to keep. (1st mulligan → bottom 1, 2nd → bottom 2, and so on.)</p>
              <p className="mull-text" style={{ fontStyle: "italic", color: "var(--ink-soft)" }}>You can keep mulliganing as much as you like, but you’ll bottom more cards each time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewGameModal({ initial, onStart, onClose }) {
  const [count, setCount] = React.useState(initial.players.length);
  const [life, setLife] = React.useState(initial.startLife);
  const [rows, setRows] = React.useState(() => {
    const base = initial.players.map((p) => ({ name: p.name, colors: [...p.colors] }));
    while (base.length < 4) base.push({ name: "Player " + (base.length + 1), colors: [] });
    return base;
  });
  const setRow = (i, patch) => setRows((r) => r.map((x, j) => j === i ? { ...x, ...patch } : x));
  const toggleColor = (i, c) => {
    const cur = rows[i].colors;
    const next = cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c].sort((a, b) => window.COLOR_ORDER.indexOf(a) - window.COLOR_ORDER.indexOf(b));
    setRow(i, { colors: next });
  };
  const begin = () => onStart(rows.slice(0, count).map((r) => ({ name: r.name.trim() || "Player", colors: r.colors })), +life);

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" style={{ "--mw": "560px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div><h2>New game</h2><div className="sub">Set up your Commander pod.</div></div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <label className="cr-rowlbl" style={{ display: "block", marginBottom: 4 }}>Players</label>
          <div className="ng-count">
            {[2, 3, 4].map((n) => <button key={n} className={count === n ? "on" : ""} onClick={() => setCount(n)}>{n}</button>)}
          </div>
          <div className="ng-players">
            {rows.slice(0, count).map((r, i) => (
              <div className="ng-prow" key={i}>
                <input value={r.name} onChange={(e) => setRow(i, { name: e.target.value })} />
                <div className="ng-colors">
                  {window.COLOR_ORDER.map((c) => (
                    <button key={c} className={"ng-cbtn" + (r.colors.includes(c) ? " on" : "")} onClick={() => toggleColor(i, c)}>
                      <window.ManaPip c={c} size={22} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="ng-life">
            <label>Starting life</label>
            <div className="stepper">
              <button onClick={() => setLife((l) => Math.max(1, +l - 1))}>–</button>
              <input type="number" value={life} onChange={(e) => setLife(e.target.value)} />
              <button onClick={() => setLife((l) => +l + 1)}>+</button>
            </div>
            <span style={{ fontStyle: "italic", color: "var(--ink-soft)", fontSize: 13 }}>Commander is 40.</span>
          </div>
          <button className="btn-gold" style={{ width: "100%", padding: 15, marginTop: 14 }} onClick={begin}>Begin game</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { GlossaryModal, DiceModal, RandomizerModal, NewGameModal });
