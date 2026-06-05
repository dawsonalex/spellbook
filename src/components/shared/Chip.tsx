interface ChipProps {
  on: boolean
  onClick: () => void
  label: string
  small?: boolean
}

export default function Chip({ on, onClick, label, small }: ChipProps) {
  return (
    <button
      className={`chk${small ? ' sm' : ''}${on ? ' on' : ''}`}
      onClick={onClick}
    >
      <i />
      {label}
    </button>
  )
}
