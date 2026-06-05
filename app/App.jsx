/* ===== Main app ===== */
const STORE_KEY = "mtg-companion-v1";
const DEFAULT_COLORS = [["G", "W"], ["U", "B"], ["R"], ["W", "U"]];

function makePlayers(configs, startLife) {
  return configs.map((c, i) => ({
    id: "p" + (i + 1),
    name: c.name,
    colors: c.colors,
    life: startLife,
    cmdr: {},
  }));
}
function defaultState() {
  const configs = DEFAULT_COLORS.map((colors, i) => ({ name: "Player " + (i + 1), colors }));
  return { players: makePlayers(configs, 40), activeIdx: 0, phaseIdx: 0, startLife: 40 };
}

function App() {
  const [state, setState] = React.useState(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return defaultState();
  });
  const [modal, setModal] = React.useState(null);
  const { players, activeIdx, phaseIdx, startLife } = state;

  React.useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }, [state]);

  const patch = (p) => setState((s) => ({ ...s, ...p }));
  const setPlayers = (fn) => setState((s) => ({ ...s, players: fn(s.players) }));

  const adjustLife = (id, d) => setPlayers((ps) => ps.map((p) => p.id === id ? { ...p, life: p.life + d } : p));
  const adjustCmdr = (targetId, sourceId, d) => setPlayers((ps) => ps.map((p) => {
    if (p.id !== targetId) return p;
    const cur = (p.cmdr && p.cmdr[sourceId]) || 0;
    const next = Math.max(0, cur + d);
    const applied = next - cur; // commander damage is real damage
    return { ...p, cmdr: { ...p.cmdr, [sourceId]: next }, life: p.life - applied };
  }));
  const rename = (id, name) => setPlayers((ps) => ps.map((p) => p.id === id ? { ...p, name } : p));
  const setColors = (id, colors) => setPlayers((ps) => ps.map((p) => p.id === id ? { ...p, colors } : p));
  const revive = (id) => setPlayers((ps) => ps.map((p) => p.id === id ? { ...p, life: startLife, cmdr: {} } : p));

  const nextPhase = () => {
    if (phaseIdx >= window.PHASES.length - 1) { endTurn(); return; }
    patch({ phaseIdx: phaseIdx + 1 });
  };
  const endTurn = () => {
    const n = players.length;
    let next = (activeIdx + 1) % n;
    let guard = 0;
    while (guard < n && (players[next].life <= 0 || Math.max(0, ...Object.values(players[next].cmdr || {})) >= 21)) {
      next = (next + 1) % n; guard++;
    }
    patch({ activeIdx: next, phaseIdx: 0 });
  };

  const applyCombat = (map) => setPlayers((ps) => ps.map((p) => {
    const m = map[p.id];
    if (!m) return p;
    const cmdr = { ...p.cmdr };
    if (m.cmdr > 0) cmdr[players[activeIdx].id] = (cmdr[players[activeIdx].id] || 0) + m.cmdr;
    return { ...p, life: p.life - m.total, cmdr };
  }));

  const startGame = (configs, life) => {
    setState({ players: makePlayers(configs, life), activeIdx: 0, phaseIdx: 0, startLife: life });
    setModal(null);
  };

  const n = players.length;
  const half = Math.ceil(n / 2);
  const left = players.slice(0, half);
  const right = players.slice(half);
  const others = (pid) => players.filter((p) => p.id !== pid);

  const renderPlayer = (p) => (
    <window.PlayerPanel key={p.id} player={p} isActive={players[activeIdx].id === p.id} others={others(p.id)}
      onLife={(d) => adjustLife(p.id, d)}
      onCmdr={(srcId, d) => adjustCmdr(p.id, srcId, d)}
      onRename={(name) => rename(p.id, name)}
      onColors={(cols) => setColors(p.id, cols)}
      onRevive={() => revive(p.id)} />
  );

  return (
    <div id="app">
      <div className="app-head">
        <div className="brand">
          <h1>Spellbook</h1>
          <span className="fmt">Commander · {n} players</span>
        </div>
        <div className="tools">
          <button className="tool" onClick={() => setModal("anatomy")}>Card anatomy</button>
          <button className="tool" onClick={() => setModal("glossary")}>Glossary</button>
          <button className="tool" onClick={() => setModal("dice")}>Dice</button>
          <button className="tool" onClick={() => setModal("random")}>Who goes first</button>
          <button className="tool" onClick={() => setModal("newgame")}>New game</button>
        </div>
      </div>

      <div className={"board p" + n}>
        <div className="col">{left.map(renderPlayer)}</div>
        <div className="col-center">
          <window.PhaseTracker
            phaseIdx={phaseIdx}
            activeName={players[activeIdx].name}
            onJump={(i) => patch({ phaseIdx: i })}
            onNext={nextPhase}
            onEnd={endTurn}
            onOpenCombat={() => setModal("combat")} />
        </div>
        <div className="col">{right.map(renderPlayer)}</div>
      </div>

      {modal === "combat" && <window.CombatModal players={players} activeIdx={activeIdx} onApply={applyCombat} onClose={() => setModal(null)} />}
      {modal === "anatomy" && <window.CardAnatomyModal onClose={() => setModal(null)} />}
      {modal === "glossary" && <window.GlossaryModal onClose={() => setModal(null)} />}
      {modal === "dice" && <window.DiceModal onClose={() => setModal(null)} />}
      {modal === "random" && <window.RandomizerModal players={players} onSetActive={(i) => patch({ activeIdx: i })} onClose={() => setModal(null)} />}
      {modal === "newgame" && <window.NewGameModal initial={{ players, startLife }} onStart={startGame} onClose={() => setModal(null)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
