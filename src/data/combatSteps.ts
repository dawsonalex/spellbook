import type { CombatStep } from '../types'

export const COMBAT_STEPS: CombatStep[] = [
  {
    name: 'Beginning of Combat',
    one: 'Last quiet moment before attackers are chosen.',
    body: 'Nothing has attacked yet. All players get priority — this is the spot to cast instants or activate abilities before attacks are declared (e.g. tap down a blocker, or pump a creature).',
    stack: 'Priority passes around the table. Anyone may add to the stack.',
  },
  {
    name: 'Declare Attackers',
    one: 'The active player chooses attackers and taps them.',
    body: 'The attacking player picks which untapped creatures attack, and what each one attacks — a player or a planeswalker. Those creatures become tapped (unless they have vigilance). "Attack triggers" go on the stack now.',
    stack: 'After attackers are declared, all players get priority before blockers.',
  },
  {
    name: 'Declare Blockers',
    one: 'Each defender assigns blockers.',
    body: 'Every defending player chooses which of their untapped creatures block, and which attacker each one blocks. If several creatures block one attacker, the attacking player chooses the damage order. Blocked attackers stay blocked even if the blocker leaves.',
    stack: 'After blocks are set, all players get priority before damage.',
  },
  {
    name: 'Combat Damage',
    one: 'All creatures deal damage at the same time.',
    body: 'Each creature deals damage equal to its power. Unblocked attackers hit the player or planeswalker they\'re attacking; blocked attackers and their blockers deal damage to each other. Lethal damage (≥ toughness) destroys a creature. If any creature has first/double strike, there\'s an extra damage step first.',
    stack: 'Players get priority after damage is dealt.',
  },
  {
    name: 'End of Combat',
    one: 'Final combat triggers, then on to Main 2.',
    body: '"At end of combat" abilities trigger. "Until end of combat" effects end. Then combat is over and the turn moves to your second main phase.',
    stack: 'Players get priority once more before leaving combat.',
  },
]
