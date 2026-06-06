interface ModalProps {
  title: string
  subtitle?: string
  maxWidth?: number
  minHeight?: number | string
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ title, subtitle, maxWidth = 900, minHeight = 0, onClose, children }: ModalProps) {
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" style={{
        maxWidth: maxWidth,
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight
      }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <div className="sub">{subtitle}</div>}
          </div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
