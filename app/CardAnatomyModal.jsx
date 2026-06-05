/* ===== Card anatomy modal ===== */
function CardAnatomyModal({ onClose }) {
  const pins = [
    { n:1, top:"7%",  left:"6%"  },
    { n:2, top:"7%",  right:"6%" },
    { n:3, top:"30%", left:"46%" },
    { n:4, top:"52%", left:"6%"  },
    { n:5, top:"52%", right:"7%" },
    { n:6, top:"62%", left:"8%"  },
    { n:7, top:"72%", left:"8%"  },
    { n:8, top:"84%", left:"8%"  },
    { n:9, top:"93%", right:"8%" },
  ];
  const callouts = [
    ["Card name", "What the card is called. Legendary creatures (like your commander) show a small crown."],
    ["Mana cost", "What you pay to cast it. Numbers are generic mana; colored pips need that color. This is {3}{U}{U}."],
    ["Illustration", "The art. Purely flavor — it has no effect on the rules."],
    ["Type line", "“Creature — Sphinx” here. Tells you what the card is and its subtypes. Other types: Land, Instant, Sorcery, Artifact, Enchantment, Planeswalker."],
    ["Set symbol & rarity", "Which set it’s from; its color shows rarity (common, uncommon, rare, mythic)."],
    ["Keyword abilities", "Shorthand for common rules — here Flying and Vigilance. Look any keyword up in the Glossary."],
    ["Rules text", "What the card actually does. Italic text in parentheses is just a reminder, not extra rules."],
    ["Flavor text", "Italic story text at the bottom. Flavor only — ignore it for rules."],
    ["Power / Toughness", "Only on creatures. Power (left) is the damage it deals; toughness (right) is how much it can take before dying. This one is 4/5."],
  ];

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" style={{ "--mw": "860px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>Parts of a card</h2>
            <div className="sub">A stylized example — every Magic card follows this layout.</div>
          </div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="anatomy-wrap">
            <div className="mtg-card">
              {pins.map((p) => (
                <span key={p.n} className="mc-pin" style={{ top:p.top, left:p.left, right:p.right }}>{p.n}</span>
              ))}
              <div className="mc-inner">
                <div className="mc-titlebar">
                  <span className="mc-name">♛ Grovewarden Sphinx</span>
                  <span className="mc-cost">
                    <window.ManaPip c="C" size={17} label="3" /><window.ManaPip c="U" size={17} /><window.ManaPip c="U" size={17} />
                  </span>
                </div>
                <div className="mc-art"><span>[ illustration ]</span></div>
                <div className="mc-typebar">
                  <span>Creature — Sphinx</span>
                  <span className="mc-set" title="set symbol / rarity">★</span>
                </div>
                <div className="mc-text">
                  <div className="kw">Flying, vigilance</div>
                  <div>When Grovewarden Sphinx enters the battlefield, draw a card.</div>
                  <div className="mc-flavor">“The tower’s every secret rests behind her unblinking gaze.”</div>
                </div>
                <div className="mc-bottom">
                  <span className="mc-info">047/281 · M · EN</span>
                  <span className="mc-pt">4 / 5</span>
                </div>
              </div>
            </div>

            <div className="callouts">
              {callouts.map((c, i) => (
                <div className="callout" key={i}>
                  <span className="cnum">{i + 1}</span>
                  <span className="ctxt"><b>{c[0]}</b><span>{c[1]}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.CardAnatomyModal = CardAnatomyModal;
