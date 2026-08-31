import { useState } from 'react'
import { useStarprintStore } from '../store/useStarprintStore'

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#3b82f6', '#ef4444',
  '#14b8a6', '#f97316', '#84cc16', '#a855f7',
]

export function ColorPickerStep() {
  const { setSelectedColor, setStep } = useStarprintStore()
  const [selected, setSelected] = useState<string | null>(null)

  const choose = (color: string) => {
    setSelected(color)
    setSelectedColor(color)
  }

  const proceed = () => {
    if (!selected) return
    setStep('GENERATING')
  }

  return (
    <div className="game-step color-picker-step">
      <h2>🎨 Màu sắc của bạn</h2>
      <p>Chọn màu sắc phản ánh cá tính của bạn</p>
      <div className="color-picker-step__grid">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            className={`color-swatch ${selected === color ? 'selected' : ''}`}
            style={{ background: color }}
            onClick={() => choose(color)}
            aria-label={`Chọn màu ${color}`}
            aria-pressed={selected === color}
          />
        ))}
      </div>
      <input
        type="color"
        value={selected ?? '#6366f1'}
        onChange={(e) => choose(e.target.value)}
        className="color-picker-step__custom"
        aria-label="Chọn màu tùy chỉnh"
      />
      <button className="btn btn--primary" disabled={!selected} onClick={proceed}>
        Tạo STARPRINT ✨
      </button>
    </div>
  )
}
