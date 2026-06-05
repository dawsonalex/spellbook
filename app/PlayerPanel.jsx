/* ===== Player panel ===== */
function ColorEditor({ colors, onChange, onClose }) {
  return (
    <div className="color-editor" onClick={(e) => e.stopPropagation()}>
      <div className="ce-h">Color identity</div>
      <div className="ce-pips">
        {window.COLOR_ORDER.map((c) => {
          const on = colors.includes(c);
          return (
            <button key={c} className={"ce-pip" + (on ? " on" : "")}
              onClick={() => {
                const next = on ? colors.filter((x) => x !== c) : [...colors, c].sort((a, b) => window.COLOR_ORDER.indexOf(a) - window.COLOR_ORDER.indexOf(b));
                onChange(next);
              }}>
              <window.ManaPip c={c} size={26} />
            </button>
          );
        })}
      </div>
      <button className="btn-ghost ce-done" onClick={onClose}>Done</button>
    </div>
  );
}

function PlayerPanel({ player, isActive, others, onLife, onCmdr, onRename, onColors, onRevive }) {
  const [editingColors, setEditingColors] = React.useState(false);
  const nameRef = React.useRef(null);
  const maxCmdr = Math.max(0, ...Object.values(player.cmdr || {}));
  const dead = player.life <= 0 || maxCmdr >= 21;
  const low = player.life > 0 && player.life <= 5;

  const commitName = () => {
    const t = nameRef.current.textContent.trim() || "Player";
    onRename(t);
  };

  return (
    <div className={"frame player" + (isActive ? " active" : "") + (dead ? " dead" : "")}>
      <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />

      <div className="p-top">
        <div style={{ minWidth: 0 }}>
          <div
            ref={nameRef}
            className="p-name"
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }}
          >{player.name}</div>
          <div className="p-pips">
            {(player.colors.length ? player.colors : ["C"]).map((c, i) => <window.ManaPip key={c + i} c={c} size={16} />)}
            <button className="edit-colors" title="Edit colors" onClick={() => setEditingColors((v) => !v)}>✎</button>
            {editingColors && <ColorEditor colors={player.colors} onChange={onColors} onClose={() => setEditingColors(false)} />}
          </div>
        </div>
        {isActive && <span className="seal">◆ Active turn</span>}
      </div>

      <div className="p-life">
        <button className="lbtn" onClick={() => onLife(-1)} aria-label="lose life">–</button>
        <span className={"life-num" + (low ? " low" : "")}>{player.life}</span>
        <button className="lbtn" onClick={() => onLife(1)} aria-label="gain life">+</button>
      </div>

      <div className="p-cmd">
        <div className="p-cmd-h">Commander damage taken</div>
        <div className="cmd-row">
          {others.map((o) => {
            const v = (player.cmdr && player.cmdr[o.id]) || 0;
            const cls = v >= 21 ? " lethal" : v >= 15 ? " warn" : "";
            return (
              <span key={o.id} className={"cmd-chip" + cls} title={"From " + o.name}>
                <span className="dot" style={{ background: window.MANA[(o.colors[0] || "C")].bg, boxShadow: o.colors[0] === "W" ? "inset 0 0 0 1px var(--w-ring,#c9bf86)" : undefined }} />
                <button className="cmd-mini" onClick={() => onCmdr(o.id, -1)}>–</button>
                <span className="v">{v}</span>
                <button className="cmd-mini" onClick={() => onCmdr(o.id, 1)}>+</button>
              </span>
            );
          })}
        </div>
      </div>

      {dead && (
        <div className="dead-banner">
          <span className="lbl">Eliminated</span>
          <button onClick={onRevive}>Bring back</button>
        </div>
      )}
    </div>
  );
}

window.PlayerPanel = PlayerPanel;
