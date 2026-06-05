/* ===== Shared data + helpers ===== */

// WUBRG palette (parchment-tuned)
const MANA = {
  W:{ bg:"var(--w)", fg:"#5b4318", ring:"#c9bf86", name:"White" },
  U:{ bg:"var(--u)", fg:"#fff", name:"Blue" },
  B:{ bg:"var(--b)", fg:"#fff", name:"Black" },
  R:{ bg:"var(--r)", fg:"#fff", name:"Red" },
  G:{ bg:"var(--g)", fg:"#fff", name:"Green" },
  C:{ bg:"var(--c)", fg:"#3a2c12", name:"Colorless" },
};
const COLOR_ORDER = ["W","U","B","R","G"];

// A stylized mana pip (a colored disc with the color's letter).
function ManaPip({ c, size = 22, label }) {
  const m = MANA[c] || MANA.C;
  return (
    <span className="pip" title={m.name}
      style={{ width: size, height: size, fontSize: size * 0.56, background: m.bg, color: m.fg,
               boxShadow: c === "W" ? `inset 0 0 0 1.5px ${m.ring}, 0 1px 2px rgba(0,0,0,.25)` : undefined }}>
      {label != null ? label : c}
    </span>
  );
}

// Turn phases (Commander / standard turn structure)
const PHASES = [
  { key:"untap", name:"Untap", tag:"Begin the turn", one:"Untap all your permanents. Nobody can act during this step.",
    detail:[
      "You untap every tapped permanent you control, all at once.",
      "Players don’t receive priority here, so no spells or abilities can be cast or activated during the untap step.",
      { tip:"Tip: effects that say “doesn’t untap” apply now." } ] },
  { key:"upkeep", name:"Upkeep", tag:"First window to respond", one:"A window for triggered abilities and instants before you draw.",
    detail:[
      "Any ability that triggers “at the beginning of your upkeep” goes on the stack now.",
      "All players get priority, so this is a common moment to cast instants or use activated abilities.",
      { tip:"Tip: pay any “upkeep cost” reminders here (e.g. cumulative upkeep, Phyrexian-style payments)." } ] },
  { key:"draw", name:"Draw", tag:"Draw for turn", one:"Draw one card from your library.",
    detail:[
      "You draw a single card for the turn.",
      "The player who takes the very first turn of the game skips their first draw step.",
      "After the draw, players get priority again." ] },
  { key:"main1", name:"Main 1", tag:"Build your board", one:"Play a land and cast spells. The only time for sorcery-speed effects.",
    detail:[
      "Your first main phase. You may play one land this turn, and cast creatures, sorceries, artifacts, enchantments, and planeswalkers — but only while the stack is empty and it’s your turn.",
      "This is usually where you develop your board before combat.",
      { tip:"Tip: hold up instants for later if you might need to react during combat." } ] },
  { key:"combat", name:"Combat", tag:"Attack!", one:"Creatures attack and deal damage. Open the walkthrough to step through it.",
    detail:[
      "Combat has five steps: Beginning of Combat, Declare Attackers, Declare Blockers, Combat Damage, and End of Combat.",
      "This is the only time creatures deal combat damage.",
      { tip:"Open the combat walkthrough for a step-by-step guide and a damage resolver." } ] },
  { key:"main2", name:"Main 2", tag:"Second main", one:"A second main phase — cast more spells after combat.",
    detail:[
      "Works exactly like your first main phase. You can still play your one land for the turn here if you haven’t already.",
      "A good moment to commit spells once you’ve seen how combat resolved." ] },
  { key:"end", name:"End", tag:"Wrap up", one:"End-step triggers happen, then cleanup — discard down to seven.",
    detail:[
      "“At the beginning of the end step” abilities trigger and resolve now.",
      "Then, during cleanup, if you have more than seven cards in hand you discard down to seven.",
      "“Until end of turn” effects wear off and damage is removed from creatures." ] },
];

// Combat steps
const COMBAT_STEPS = [
  { name:"Beginning of Combat", one:"Last quiet moment before attackers are chosen.",
    body:"Nothing has attacked yet. All players get priority — this is the spot to cast instants or activate abilities before attacks are declared (e.g. tap down a blocker, or pump a creature).",
    stack:"Priority passes around the table. Anyone may add to the stack." },
  { name:"Declare Attackers", one:"The active player chooses attackers and taps them.",
    body:"The attacking player picks which untapped creatures attack, and what each one attacks — a player or a planeswalker. Those creatures become tapped (unless they have vigilance). “Attack triggers” go on the stack now.",
    stack:"After attackers are declared, all players get priority before blockers." },
  { name:"Declare Blockers", one:"Each defender assigns blockers.",
    body:"Every defending player chooses which of their untapped creatures block, and which attacker each one blocks. If several creatures block one attacker, the attacking player chooses the damage order. Blocked attackers stay blocked even if the blocker leaves.",
    stack:"After blocks are set, all players get priority before damage." },
  { name:"Combat Damage", one:"All creatures deal damage at the same time.",
    body:"Each creature deals damage equal to its power. Unblocked attackers hit the player or planeswalker they’re attacking; blocked attackers and their blockers deal damage to each other. Lethal damage (≥ toughness) destroys a creature. If any creature has first/double strike, there’s an extra damage step first.",
    stack:"Players get priority after damage is dealt." },
  { name:"End of Combat", one:"Final combat triggers, then on to Main 2.",
    body:"“At end of combat” abilities trigger. “Until end of combat” effects end. Then combat is over and the turn moves to your second main phase.",
    stack:"Players get priority once more before leaving combat." },
];

// Glossary — keywords + core concepts
const GLOSSARY = [
  { group:"Combat keywords", items:[
    ["Flying","Can only be blocked by creatures with flying or reach."],
    ["Reach","Can block creatures with flying (e.g. spiders)."],
    ["First strike","Deals its combat damage before creatures without first strike."],
    ["Double strike","Deals combat damage twice — once with first strike, once normally."],
    ["Deathtouch","Any amount of damage it deals to a creature is lethal."],
    ["Trample","Excess damage past a blocker’s toughness carries over to the player/planeswalker."],
    ["Lifelink","Damage it deals also gains you that much life."],
    ["Vigilance","Doesn’t tap when attacking."],
    ["Menace","Must be blocked by two or more creatures."],
    ["Defender","Can’t attack."],
    ["Haste","Can attack and use tap abilities the turn it comes under your control."],
    ["Indestructible","Can’t be destroyed by damage or “destroy” effects."],
  ]},
  { group:"Evasion & protection", items:[
    ["Hexproof","Can’t be targeted by spells or abilities your opponents control."],
    ["Shroud","Can’t be targeted by any spells or abilities, including your own."],
    ["Ward","Opponents must pay an extra cost to target it."],
    ["Protection","Can’t be blocked, targeted, dealt damage, or enchanted/equipped by the named quality."],
  ]},
  { group:"Core concepts", items:[
    ["The Stack","Where spells and abilities wait to resolve, last-in-first-out. Players respond before anything resolves."],
    ["Priority","The right to act. It passes around the table; the stack only resolves when everyone passes."],
    ["Tapped","Turned sideways — used to show a creature attacked, or a resource was spent."],
    ["Summoning sickness","A creature can’t attack or use tap-abilities until you’ve controlled it since your last turn began (unless it has haste)."],
    ["Mana","The resource used to cast spells, made mostly by lands. Comes in five colors plus colorless."],
    ["Commander","Your legendary leader. It starts in the command zone and you can cast it from there."],
    ["Commander tax","Each time you re-cast your commander from the command zone it costs {2} more."],
    ["Commander damage","21 combat damage from a single commander eliminates a player — tracked separately per source."],
    ["Counter (on a permanent)","A marker like +1/+1 that changes a creature’s stats or grants abilities."],
    ["Token","A creature/permanent created by an effect that isn’t a real card."],
    ["Instant vs. Sorcery","Instants can be cast almost any time; sorceries only on your own turn with an empty stack."],
  ]},
];

Object.assign(window, { MANA, COLOR_ORDER, ManaPip, PHASES, COMBAT_STEPS, GLOSSARY });
