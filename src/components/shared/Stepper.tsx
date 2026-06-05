interface StepperProps {
  value: number
  onChange: (v: number) => void
  min?: number
}

export default function Stepper({ value, onChange, min = 0 }: StepperProps) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(Math.max(min, value - 1))}>–</button>
      <input
        type="number"
        value={value}
        min={min}
        onChange={(e) => {
          const n = e.target.valueAsNumber
          if (!isNaN(n)) onChange(n)
        }}
      />
      <button onClick={() => onChange(value + 1)}>+</button>
    </div>
  )
}
