import { describe, it, expect } from 'vitest'
import { resolveCombat, AttackerInput, BlockerInput } from './resolveCombat'

function atk(
  power: number,
  tough: number,
  opts: Partial<Omit<AttackerInput, 'power' | 'tough'>> = {},
): AttackerInput {
  return { power, tough, firstStrike: false, doubleStrike: false, deathtouch: false, trample: false, ...opts }
}

function blk(
  power: number,
  tough: number,
  opts: Partial<Omit<BlockerInput, 'power' | 'tough'>> = {},
): BlockerInput {
  return { power, tough, firstStrike: false, doubleStrike: false, deathtouch: false, ...opts }
}

describe('resolveCombat — basic outcomes', () => {
  it('unblocked attacker: no one dies, no trample', () => {
    const r = resolveCombat(atk(3, 3), [])
    expect(r.attackerDies).toBe(false)
    expect(r.blockers).toEqual([])
    expect(r.deadCount).toBe(0)
    expect(r.trample).toBe(0)
    expect(r.anyFS).toBe(false)
  })

  it('equal trade (2/2 vs 2/2): both die', () => {
    const r = resolveCombat(atk(2, 2), [blk(2, 2)])
    expect(r.attackerDies).toBe(true)
    expect(r.blockers).toEqual([{ dies: true }])
    expect(r.deadCount).toBe(1)
  })

  it('attacker wins (3/3 vs 2/2): blocker dies, attacker lives', () => {
    const r = resolveCombat(atk(3, 3), [blk(2, 2)])
    expect(r.attackerDies).toBe(false)
    expect(r.blockers).toEqual([{ dies: true }])
  })

  it('blocker wins (2/2 vs 3/3): attacker dies, blocker lives', () => {
    const r = resolveCombat(atk(2, 2), [blk(3, 3)])
    expect(r.attackerDies).toBe(true)
    expect(r.blockers).toEqual([{ dies: false }])
    expect(r.deadCount).toBe(0)
  })

  it('neither dies when damage does not reach toughness (1/4 vs 1/4)', () => {
    const r = resolveCombat(atk(1, 4), [blk(1, 4)])
    expect(r.attackerDies).toBe(false)
    expect(r.blockers).toEqual([{ dies: false }])
    expect(r.deadCount).toBe(0)
  })
})

describe('resolveCombat — first strike', () => {
  it('first-strike attacker kills blocker before it can deal damage', () => {
    // Attacker has first strike: it deals in the FS step and kills the blocker.
    // The blocker has no first/double strike so it never gets to deal back.
    const r = resolveCombat(atk(2, 2, { firstStrike: true }), [blk(2, 2)])
    expect(r.attackerDies).toBe(false)
    expect(r.blockers).toEqual([{ dies: true }])
    expect(r.anyFS).toBe(true)
  })

  it('first-strike blocker kills attacker before it deals regular damage', () => {
    // Blocker has first strike: it deals in the FS step and kills the attacker.
    // The attacker has no first/double strike so it never gets to deal back.
    const r = resolveCombat(atk(2, 2), [blk(2, 2, { firstStrike: true })])
    expect(r.attackerDies).toBe(true)
    expect(r.blockers).toEqual([{ dies: false }])
    expect(r.anyFS).toBe(true)
  })

  it('both have first strike: simultaneous in FS step, equal trade', () => {
    const r = resolveCombat(atk(2, 2, { firstStrike: true }), [blk(2, 2, { firstStrike: true })])
    expect(r.attackerDies).toBe(true)
    expect(r.blockers).toEqual([{ dies: true }])
  })
})

describe('resolveCombat — double strike', () => {
  it('double-strike attacker deals damage in both steps', () => {
    // 3/3 double strike vs 2/4: in FS step it deals 3 (not enough to kill 4-tough blocker).
    // In regular step it deals the remaining 1 lethal and kills it. Blocker only deals in regular.
    const r = resolveCombat(atk(3, 3, { doubleStrike: true }), [blk(2, 4)])
    expect(r.attackerDies).toBe(false)
    expect(r.blockers).toEqual([{ dies: true }])
    expect(r.anyFS).toBe(true)
  })

  it('double-strike attacker kills blocker in FS step, takes no damage', () => {
    // 3/3 double strike vs 2/3: 3 damage kills the blocker in the FS step.
    // Blocker has no first/double strike so it never deals.
    const r = resolveCombat(atk(3, 3, { doubleStrike: true }), [blk(2, 3)])
    expect(r.attackerDies).toBe(false)
    expect(r.blockers).toEqual([{ dies: true }])
    expect(r.fs.blockerDeaths).toBe(1)
    expect(r.fs.attackerDied).toBe(false)
  })
})

describe('resolveCombat — deathtouch', () => {
  it('deathtouch attacker kills a huge blocker with 1 damage', () => {
    // A 1/4 with deathtouch needs only 1 damage to kill any creature.
    // The 1/10 blocker only deals 1 back, not enough to kill the 4-tough attacker.
    const r = resolveCombat(atk(1, 4, { deathtouch: true }), [blk(1, 10)])
    expect(r.attackerDies).toBe(false)
    expect(r.blockers).toEqual([{ dies: true }])
  })

  it('deathtouch blocker kills attacker even with 1 power', () => {
    // A 5/5 attacker takes 1 deathtouch damage from the blocker — lethal regardless of toughness.
    const r = resolveCombat(atk(5, 5), [blk(1, 1, { deathtouch: true })])
    expect(r.attackerDies).toBe(true)
    expect(r.blockers).toEqual([{ dies: true }])
  })

  it('deathtouch attacker with 0-power blocker: blocker dies, attacker lives', () => {
    const r = resolveCombat(atk(1, 5, { deathtouch: true }), [blk(0, 10)])
    expect(r.attackerDies).toBe(false)
    expect(r.blockers).toEqual([{ dies: true }])
  })
})

describe('resolveCombat — trample', () => {
  it('excess damage tramples through when attacker is over-powered', () => {
    // 5/5 trample vs 2/2: needs 2 to kill the blocker, 3 excess tramples.
    const r = resolveCombat(atk(5, 5, { trample: true }), [blk(2, 2)])
    expect(r.trample).toBe(3)
    expect(r.blockers).toEqual([{ dies: true }])
    expect(r.attackerDies).toBe(false)
  })

  it('trample does not overflow when the attacker and block both die (due to power)', () => {
    const r = resolveCombat(atk(5, 2, { trample: true }), [blk(2, 2)])
    expect(r.trample).toBe(0)
    expect(r.blockers).toEqual([{ dies: true }])
    expect(r.attackerDies).toBe(true)
  })

  it('trample does not overflow when the attacker and block both die (due to deathtouch)', () => {
    const r = resolveCombat(atk(5, 2, { trample: true }), [blk(1, 2, { deathtouch: true })])
    expect(r.trample).toBe(0)
    expect(r.blockers).toEqual([{ dies: true }])
    expect(r.attackerDies).toBe(true)
  })

  it('no trample when power exactly matches lethal', () => {
    const r = resolveCombat(atk(2, 3, { trample: true }), [blk(1, 2)])
    expect(r.trample).toBe(0)
    expect(r.blockers).toEqual([{ dies: true }])
  })

  it('deathtouch + trample: only 1 damage needed per blocker, rest tramples', () => {
    // 5/5 deathtouch+trample vs 0/10 blocker: 1 deathtouch damage kills it, 4 tramples.
    const r = resolveCombat(atk(5, 5, { deathtouch: true, trample: true }), [blk(0, 10)])
    expect(r.trample).toBe(4)
    expect(r.blockers).toEqual([{ dies: true }])
    expect(r.attackerDies).toBe(false)
  })

  it('unblocked trample attacker: full power tramples (no blockers)', () => {
    const r = resolveCombat(atk(4, 4, { trample: true }), [])
    expect(r.trample).toBe(4)
    expect(r.attackerDies).toBe(false)
  })
})

describe('resolveCombat — multiple blockers', () => {
  it('attacker with enough power kills all blockers', () => {
    // 6/3 vs three 2/2 blockers: assigns 2+2+2 damage, all die.
    // All three blockers deal back 6 total, enough to kill the 3-tough attacker.
    const r = resolveCombat(atk(6, 3), [blk(2, 2), blk(2, 2), blk(2, 2)])
    expect(r.attackerDies).toBe(true)
    expect(r.blockers).toEqual([{ dies: true }, { dies: true }, { dies: true }])
    expect(r.deadCount).toBe(3)
  })

  it('attacker only has enough power for the first two blockers', () => {
    // 4/5 vs three 2/2 blockers: assigns 2+2 lethal to first two, nothing to third.
    // All three still deal back: 2+2+2=6 >= 5 tough, attacker dies.
    const r = resolveCombat(atk(4, 5), [blk(2, 2), blk(2, 2), blk(2, 2)])
    expect(r.attackerDies).toBe(true)
    expect(r.blockers).toEqual([{ dies: true }, { dies: true }, { dies: false }])
    expect(r.deadCount).toBe(2)
  })

  it('deathtouch attacker kills first blocker with 1 damage, second with remaining power', () => {
    // 3/3 deathtouch vs two 0/5 blockers: assigns 1 (lethal via DT) to first, 1 to second, 1 left over.
    const r = resolveCombat(atk(3, 3, { deathtouch: true }), [blk(0, 5), blk(0, 5)])
    expect(r.blockers).toEqual([{ dies: true }, { dies: true }])
    expect(r.deadCount).toBe(2)
    expect(r.attackerDies).toBe(false)
  })
})

describe('resolveCombat — first-strike step metadata', () => {
  it('fs snapshot reflects state after the first-strike step only', () => {
    // First-strike attacker kills blocker in FS step. Regular step: attacker doesn't deal
    // (no double strike), blocker is already dead. fs.blockerDeaths=1, fs.attackerDied=false.
    const r = resolveCombat(atk(3, 3, { firstStrike: true }), [blk(3, 3)])
    expect(r.fs.attackerDied).toBe(false)
    expect(r.fs.blockerDeaths).toBe(1)
  })

  it('fs snapshot shows attacker died in FS step when blocker has first strike', () => {
    const r = resolveCombat(atk(2, 2), [blk(2, 2, { firstStrike: true })])
    expect(r.fs.attackerDied).toBe(true)
    expect(r.fs.blockerDeaths).toBe(0)
  })

  it('fs defaults to no deaths when neither side has first/double strike', () => {
    const r = resolveCombat(atk(2, 2), [blk(2, 2)])
    expect(r.anyFS).toBe(false)
    expect(r.fs).toEqual({ attackerDied: false, blockerDeaths: 0 })
  })
})
