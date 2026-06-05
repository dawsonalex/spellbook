import ManaPip from '../shared/ManaPip'
import Modal from '../shared/Modal'
import styles from './CardAnatomyModal.module.css'

const PINS = [
  { n: 1, top: '7%',  left: '6%'  },
  { n: 2, top: '7%',  right: '6%' },
  { n: 3, top: '30%', left: '46%' },
  { n: 4, top: '52%', left: '6%'  },
  { n: 5, top: '52%', right: '7%' },
  { n: 6, top: '62%', left: '8%'  },
  { n: 7, top: '72%', left: '8%'  },
  { n: 8, top: '84%', left: '8%'  },
  { n: 9, top: '93%', right: '8%' },
] as const

const CALLOUTS: [string, string][] = [
  ['Card name', 'What the card is called. Legendary creatures (like your commander) show a small crown.'],
  ['Mana cost', 'What you pay to cast it. Numbers are generic mana; colored pips need that color. This is {3}{U}{U}.'],
  ['Illustration', 'The art. Purely flavor — it has no effect on the rules.'],
  ['Type line', '"Creature — Sphinx" here. Tells you what the card is and its subtypes. Other types: Land, Instant, Sorcery, Artifact, Enchantment, Planeswalker.'],
  ['Set symbol & rarity', 'Which set it\'s from; its color shows rarity (common, uncommon, rare, mythic).'],
  ['Keyword abilities', 'Shorthand for common rules — here Flying and Vigilance. Look any keyword up in the Glossary.'],
  ['Rules text', 'What the card actually does. Italic text in parentheses is just a reminder, not extra rules.'],
  ['Flavor text', 'Italic story text at the bottom. Flavor only — ignore it for rules.'],
  ['Power / Toughness', 'Only on creatures. Power (left) is the damage it deals; toughness (right) is how much it can take before dying. This one is 4/5.'],
]

interface CardAnatomyModalProps {
  onClose: () => void
}

export default function CardAnatomyModal({ onClose }: CardAnatomyModalProps) {
  return (
    <Modal
      title="Parts of a card"
      subtitle="A stylized example — every Magic card follows this layout."
      maxWidth={860}
      onClose={onClose}
    >
      <div className={styles.anatomyWrap}>
        <div className={styles.mtgCard}>
          {PINS.map((p) => (
            <span
              key={p.n}
              className={styles.mcPin}
              style={{ top: p.top, left: 'left' in p ? p.left : undefined, right: 'right' in p ? p.right : undefined }}
            >
              {p.n}
            </span>
          ))}
          <div className={styles.mcInner}>
            <div className={styles.mcTitlebar}>
              <span className={styles.mcName}>♛ Grovewarden Sphinx</span>
              <span className={styles.mcCost}>
                <ManaPip c="C" size={17} label="3" />
                <ManaPip c="U" size={17} />
                <ManaPip c="U" size={17} />
              </span>
            </div>
            <div className={styles.mcArt}><span>[ illustration ]</span></div>
            <div className={styles.mcTypebar}>
              <span>Creature — Sphinx</span>
              <span className={styles.mcSet} title="set symbol / rarity">★</span>
            </div>
            <div className={styles.mcText}>
              <div className={styles.kw}>Flying, vigilance</div>
              <div>When Grovewarden Sphinx enters the battlefield, draw a card.</div>
              <div className={styles.mcFlavor}>
                "The tower's every secret rests behind her unblinking gaze."
              </div>
            </div>
            <div className={styles.mcBottom}>
              <span className={styles.mcInfo}>047/281 · M · EN</span>
              <span className={styles.mcPt}>4 / 5</span>
            </div>
          </div>
        </div>

        <div className={styles.callouts}>
          {CALLOUTS.map(([term, desc], i) => (
            <div className={styles.callout} key={i}>
              <span className={styles.cnum}>{i + 1}</span>
              <span className={styles.ctxt}>
                <b>{term}</b>
                <span>{desc}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
