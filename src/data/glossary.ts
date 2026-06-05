import type { GlossaryGroup } from '../types'

export const GLOSSARY: GlossaryGroup[] = [
  {
    group: 'Combat keywords',
    items: [
      ['Flying', 'Can only be blocked by creatures with flying or reach.'],
      ['Reach', 'Can block creatures with flying (e.g. spiders).'],
      ['First strike', 'Deals its combat damage before creatures without first strike.'],
      ['Double strike', 'Deals combat damage twice — once with first strike, once normally.'],
      ['Deathtouch', 'Any amount of damage it deals to a creature is lethal.'],
      ['Trample', 'Excess damage past a blocker\'s toughness carries over to the player/planeswalker.'],
      ['Lifelink', 'Damage it deals also gains you that much life.'],
      ['Vigilance', 'Doesn\'t tap when attacking.'],
      ['Menace', 'Must be blocked by two or more creatures.'],
      ['Defender', 'Can\'t attack.'],
      ['Haste', 'Can attack and use tap abilities the turn it comes under your control.'],
      ['Indestructible', 'Can\'t be destroyed by damage or "destroy" effects.'],
    ],
  },
  {
    group: 'Evasion & protection',
    items: [
      ['Hexproof', 'Can\'t be targeted by spells or abilities your opponents control.'],
      ['Shroud', 'Can\'t be targeted by any spells or abilities, including your own.'],
      ['Ward', 'Opponents must pay an extra cost to target it.'],
      ['Protection', 'Can\'t be blocked, targeted, dealt damage, or enchanted/equipped by the named quality.'],
    ],
  },
  {
    group: 'Core concepts',
    items: [
      ['The Stack', 'Where spells and abilities wait to resolve, last-in-first-out. Players respond before anything resolves.'],
      ['Priority', 'The right to act. It passes around the table; the stack only resolves when everyone passes.'],
      ['Tapped', 'Turned sideways — used to show a creature attacked, or a resource was spent.'],
      ['Summoning sickness', 'A creature can\'t attack or use tap-abilities until you\'ve controlled it since your last turn began (unless it has haste).'],
      ['Mana', 'The resource used to cast spells, made mostly by lands. Comes in five colors plus colorless.'],
      ['Commander', 'Your legendary leader. It starts in the command zone and you can cast it from there.'],
      ['Commander tax', 'Each time you re-cast your commander from the command zone it costs {2} more.'],
      ['Commander damage', '21 combat damage from a single commander eliminates a player — tracked separately per source.'],
      ['Counter (on a permanent)', 'A marker like +1/+1 that changes a creature\'s stats or grants abilities.'],
      ['Token', 'A creature/permanent created by an effect that isn\'t a real card.'],
      ['Instant vs. Sorcery', 'Instants can be cast almost any time; sorceries only on your own turn with an empty stack.'],
    ],
  },
]
