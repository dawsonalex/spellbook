import type { Phase } from '../types'

export const PHASES: Phase[] = [
  {
    key: 'untap',
    name: 'Untap',
    tag: 'Begin the turn',
    one: 'Untap all your permanents. Nobody can act during this step.',
    detail: [
      'You untap every tapped permanent you control, all at once.',
      "Players don't receive priority here, so no spells or abilities can be cast or activated during the untap step.",
      { tip: `Tip: effects that say "doesn't untap" apply now.` },
    ],
  },
  {
    key: 'upkeep',
    name: 'Upkeep',
    tag: 'First window to respond',
    one: 'A window for triggered abilities and instants before you draw.',
    detail: [
      'Any ability that triggers "at the beginning of your upkeep" goes on the stack now.',
      'All players get priority, so this is a common moment to cast instants or use activated abilities.',
      { tip: 'Tip: pay any "upkeep cost" reminders here (e.g. cumulative upkeep, Phyrexian-style payments).' },
    ],
  },
  {
    key: 'draw',
    name: 'Draw',
    tag: 'Draw for turn',
    one: 'Draw one card from your library.',
    detail: [
      'You draw a single card for the turn.',
      'The player who takes the very first turn of the game skips their first draw step.',
      'After the draw, players get priority again.',
    ],
  },
  {
    key: 'main1',
    name: 'Main 1',
    tag: 'Build your board',
    one: 'Play a land and cast spells. The only time for sorcery-speed effects.',
    detail: [
      'Your first main phase. You may play one land this turn, and cast creatures, sorceries, artifacts, enchantments, and planeswalkers — but only while the stack is empty and it\'s your turn.',
      'This is usually where you develop your board before combat.',
      { tip: 'Tip: hold up instants for later if you might need to react during combat.' },
    ],
  },
  {
    key: 'combat',
    name: 'Combat',
    tag: 'Attack!',
    one: 'Creatures attack and deal damage. Open the walkthrough to step through it.',
    detail: [
      'Combat has five steps: Beginning of Combat, Declare Attackers, Declare Blockers, Combat Damage, and End of Combat.',
      'This is the only time creatures deal combat damage.',
      { tip: 'Open the combat walkthrough for a step-by-step guide and a damage resolver.' },
    ],
  },
  {
    key: 'main2',
    name: 'Main 2',
    tag: 'Second main',
    one: 'A second main phase — cast more spells after combat.',
    detail: [
      'Works exactly like your first main phase. You can still play your one land for the turn here if you haven\'t already.',
      'A good moment to commit spells once you\'ve seen how combat resolved.',
    ],
  },
  {
    key: 'end',
    name: 'End',
    tag: 'Wrap up',
    one: 'End-step triggers happen, then cleanup — discard down to seven.',
    detail: [
      '"At the beginning of the end step" abilities trigger and resolve now.',
      'Then, during cleanup, if you have more than seven cards in hand you discard down to seven.',
      '"Until end of turn" effects wear off and damage is removed from creatures.',
    ],
  },
]
