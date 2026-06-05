import { MANA } from '../../data/mana'

interface ManaPipProps {
  c: string
  size?: number
  label?: string
}

export default function ManaPip({ c, size = 22, label }: ManaPipProps) {
  const m = MANA[c] ?? MANA['C']!
  return (
    <span
      className="pip"
      title={m.name}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.56,
        background: m.bg,
        color: m.fg,
        boxShadow:
          c === 'W'
            ? `inset 0 0 0 1.5px ${m.ring}, 0 1px 2px rgba(0,0,0,.25)`
            : undefined,
      }}
    >
      {label != null ? label : c}
    </span>
  )
}
