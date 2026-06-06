import { useState } from 'react'
import { GLOSSARY } from '../../data/glossary'
import Modal from '../shared/Modal'
import styles from './GlossaryModal.module.css'

interface GlossaryModalProps {
  onClose: () => void
}

export default function GlossaryModal({ onClose }: GlossaryModalProps) {
  const [q, setQ] = useState('')
  const ql = q.trim().toLowerCase()

  const groups = GLOSSARY.map((g) => ({
    group: g.group,
    items: g.items.filter(
      ([t, d]) => !ql || t.toLowerCase().includes(ql) || d.toLowerCase().includes(ql),
    ),
  })).filter((g) => g.items.length > 0)

  return (
    <Modal
      title="Glossary"
      subtitle="Keywords & core concepts, in plain language."
      maxWidth={840}
      minHeight={'92vh'}
      onClose={onClose}
    >
      <input
        className={styles.glSearch}
        placeholder="Search keywords… (e.g. trample, the stack)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      {groups.length === 0 && <p className={styles.glEmpty}>No matches for "{q}".</p>}
      {groups.map((g) => (
        <div className={styles.glGroup} key={g.group}>
          <h3>{g.group}</h3>
          <div className={styles.glList}>
            {g.items.map(([t, d]) => (
              <div className={styles.glItem} key={t}>
                <b>{t}</b>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Modal>
  )
}
