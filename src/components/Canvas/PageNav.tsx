import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PageNavProps { current: number; total: number; onPageChange: (page: number) => void }

export function PageNav({ current, total, onPageChange }: PageNavProps) {
  return (
    <div style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', height: 40 }}
      className="flex items-center justify-center gap-2 flex-shrink-0">
      <button onClick={() => onPageChange(Math.max(1, current - 1))} disabled={current <= 1} className="tool-btn disabled:opacity-30">
        <ChevronLeft size={15} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
        <input
          type="number" value={current} min={1} max={total}
          onChange={(e) => { const v = parseInt(e.target.value); if (v >= 1 && v <= total) onPageChange(v) }}
          style={{
            width: 36, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
            background: 'var(--secondary)', border: '1px solid var(--border)',
            color: 'var(--foreground)', borderRadius: 'var(--radius-sm)', padding: '2px 4px',
            outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--ring)' }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
        />
        <span>of {total}</span>
      </div>
      <button onClick={() => onPageChange(Math.min(total, current + 1))} disabled={current >= total} className="tool-btn disabled:opacity-30">
        <ChevronRight size={15} />
      </button>
    </div>
  )
}
