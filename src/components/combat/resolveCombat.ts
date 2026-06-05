export interface AttackerInput {
  power: number
  tough: number
  firstStrike: boolean
  doubleStrike: boolean
  deathtouch: boolean
  trample: boolean
}

export interface BlockerInput {
  power: number
  tough: number
  firstStrike: boolean
  doubleStrike: boolean
  deathtouch: boolean
}

export interface CombatResult {
  attackerDies: boolean
  blockers: { dies: boolean }[]
  deadCount: number
  trample: number
  anyFS: boolean
  fs: { attackerDied: boolean; blockerDeaths: number }
}

type Step = 'fs' | 'regular'
type BlockerState = BlockerInput & { marked: number; alive: boolean; dt: boolean }

function dealsInStep(c: { firstStrike: boolean; doubleStrike: boolean }, s: Step): boolean {
  return s === 'fs' ? c.firstStrike || c.doubleStrike : c.doubleStrike || !c.firstStrike
}

// Resolve one attacker vs any number of blockers. Honors first/double strike,
// deathtouch, and trample. Damage within a step is simultaneous; deaths are
// checked between steps. The attacker assigns damage in list order (lethal
// first), trampling any excess to the player.
export function resolveCombat(a: AttackerInput, blockers: BlockerInput[]): CombatResult {
  const anyFS =
    a.firstStrike ||
    a.doubleStrike ||
    blockers.some((b) => b.firstStrike || b.doubleStrike)

  let aMarked = 0
  let aAlive = true
  let aDeathtouched = false
  let tramp = 0
  const bs: BlockerState[] = blockers.map((b) => ({ ...b, marked: 0, alive: true, dt: false }))
  const fs = { attackerDied: false, blockerDeaths: 0 }
  const stepList: Step[] = anyFS ? ['fs', 'regular'] : ['regular']

  for (const s of stepList) {
    // attacker assigns damage to blockers in order
    if (aAlive && dealsInStep(a, s)) {
      let pow = a.power
      for (const b of bs) {
        if (!b.alive || pow <= 0) continue
        const lethal = a.deathtouch
          ? b.marked >= 1 ? 0 : 1
          : Math.max(0, b.tough - b.marked)
        const assign = Math.min(pow, lethal)
        b.marked += assign
        pow -= assign
        if (a.deathtouch && assign > 0) b.dt = true
      }
      if (a.trample) tramp += Math.max(0, pow)
    }

    // blockers strike back simultaneously
    for (const b of bs) {
      if (b.alive && dealsInStep(b, s)) {
        aMarked += b.power
        if (b.deathtouch && b.power > 0) aDeathtouched = true
      }
    }

    // resolve deaths after the step
    for (const b of bs) {
      if (b.dt || b.marked >= b.tough) b.alive = false
    }
    if (aDeathtouched || aMarked >= a.tough) aAlive = false

    if (s === 'fs') {
      fs.attackerDied = !aAlive
      fs.blockerDeaths = bs.filter((b) => !b.alive).length
    }
  }

  return {
    attackerDies: !aAlive,
    blockers: bs.map((b) => ({ dies: !b.alive })),
    deadCount: bs.filter((b) => !b.alive).length,
    trample: tramp,
    anyFS,
    fs,
  }
}
