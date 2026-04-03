import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PageNavProps {
  current: number
  total: number
  onPageChange: (page: number) => void
}

export function PageNav({ current, total, onPageChange }: PageNavProps) {
  return (
    <div className="flex items-center justify-center gap-2 h-10 border-t border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
      <button
        onClick={() => onPageChange(Math.max(1, current - 1))}
        disabled={current <= 1}
        className="tool-btn disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={15} />
      </button>

      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
        <input
          type="number"
          value={current}
          min={1}
          max={total}
          onChange={(e) => {
            const v = parseInt(e.target.value)
            if (v >= 1 && v <= total) onPageChange(v)
          }}
          className="w-10 text-center bg-white/5 border border-[var(--border)] rounded px-1 py-0.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        />
        <span>of {total}</span>
      </div>

      <button
        onClick={() => onPageChange(Math.min(total, current + 1))}
        disabled={current >= total}
        className="tool-btn disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}
