import { useState } from 'react'
import { MousePointer2, Hand, Highlighter, StickyNote, Square, Circle, ArrowRight, PenLine, Type, Eraser, Underline, Strikethrough, Minus, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/store'
import type { ToolType } from '@/types'

interface ToolItem { id: ToolType; icon: React.ReactNode; label: string; shortcut: string }

const NAV_TOOLS: ToolItem[] = [
  { id: 'select',  icon: <MousePointer2 size={15} />, label: 'Select',  shortcut: 'V' },
  { id: 'pan',     icon: <Hand size={15} />,          label: 'Pan',     shortcut: 'H' },
]
const TEXT_TOOLS: ToolItem[] = [
  { id: 'highlight',     icon: <Highlighter size={15} />,   label: 'Highlight',     shortcut: 'L' },
  { id: 'underline',     icon: <Underline size={15} />,     label: 'Underline',     shortcut: 'U' },
  { id: 'strikethrough', icon: <Strikethrough size={15} />, label: 'Strikethrough', shortcut: 'S' },
  { id: 'note',          icon: <StickyNote size={15} />,    label: 'Note',          shortcut: 'N' },
  { id: 'text',          icon: <Type size={15} />,          label: 'Text',          shortcut: 'T' },
]
const SHAPE_TOOLS: ToolItem[] = [
  { id: 'rectangle', icon: <Square size={15} />,     label: 'Rectangle', shortcut: 'R' },
  { id: 'ellipse',   icon: <Circle size={15} />,     label: 'Ellipse',   shortcut: 'E' },
  { id: 'arrow',     icon: <ArrowRight size={15} />, label: 'Arrow',     shortcut: 'A' },
  { id: 'freehand',  icon: <PenLine size={15} />,    label: 'Draw',      shortcut: 'F' },
]
const UTIL_TOOLS: ToolItem[] = [
  { id: 'eraser', icon: <Eraser size={15} />, label: 'Eraser', shortcut: 'X' },
]

const COLORS = [
  { value: '#fbbf24', label: 'Amber' },
  { value: '#f87171', label: 'Red' },
  { value: '#34d399', label: 'Green' },
  { value: '#60a5fa', label: 'Blue' },
  { value: '#a78bfa', label: 'Violet' },
  { value: '#f472b6', label: 'Pink' },
  { value: '#e4e4e7', label: 'White' },
]

function Sep() {
  return <div style={{ width: 24, height: 1, background: 'var(--border)', margin: '4px auto' }} />
}

function ToolBtn({ tool, active, onClick }: { tool: ToolItem; active: boolean; onClick: () => void }) {
  const [tip, setTip] = useState(false)
  return (
    <div className="relative" onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
      <button onClick={onClick} className={active ? 'tool-btn-active' : 'tool-btn'} aria-label={tool.label}>
        {tool.icon}
      </button>
      <AnimatePresence>
        {tip && (
          <motion.div
            initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="glass rounded-md px-2 py-1 flex items-center gap-2 whitespace-nowrap">
              <span style={{ fontSize: '0.75rem', color: 'var(--foreground)' }}>{tool.label}</span>
              <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', background: 'var(--secondary)', color: 'var(--muted-foreground)', padding: '1px 5px', borderRadius: 'var(--radius-sm)' }}>{tool.shortcut}</kbd>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Toolbar() {
  const { activeTool, activeColor, activeStrokeWidth, zoom, setActiveTool, setActiveColor, setActiveStrokeWidth, zoomIn, zoomOut, zoomReset } = useStore()

  return (
    <aside style={{ background: 'var(--card)', borderRight: '1px solid var(--border)', width: 48 }}
      className="flex flex-col items-center py-3 gap-1 flex-shrink-0 overflow-y-auto no-scrollbar z-20">

      {NAV_TOOLS.map(t => <ToolBtn key={t.id} tool={t} active={activeTool === t.id} onClick={() => setActiveTool(t.id)} />)}
      <Sep />
      {TEXT_TOOLS.map(t => <ToolBtn key={t.id} tool={t} active={activeTool === t.id} onClick={() => setActiveTool(t.id)} />)}
      <Sep />
      {SHAPE_TOOLS.map(t => <ToolBtn key={t.id} tool={t} active={activeTool === t.id} onClick={() => setActiveTool(t.id)} />)}
      <Sep />
      {UTIL_TOOLS.map(t => <ToolBtn key={t.id} tool={t} active={activeTool === t.id} onClick={() => setActiveTool(t.id)} />)}

      <div className="flex-1" />

      {/* Colours */}
      <div className="flex flex-col items-center gap-1.5 pb-1">
        {COLORS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveColor(value)}
            title={label}
            style={{
              width: 18, height: 18, borderRadius: '50%',
              background: value,
              border: `2px solid ${activeColor === value ? 'var(--foreground)' : 'transparent'}`,
              transform: activeColor === value ? 'scale(1.25)' : 'scale(1)',
              boxShadow: activeColor === value ? `0 0 6px ${value}99` : 'none',
              transition: 'all var(--dur-fast) var(--ease-out)',
              cursor: 'pointer', flexShrink: 0,
            }}
          />
        ))}
      </div>

      <Sep />

      {/* Stroke widths */}
      <div className="flex flex-col items-center gap-1 pb-1">
        {[1, 2, 4].map((w) => (
          <button
            key={w}
            onClick={() => setActiveStrokeWidth(w)}
            title={`${w}px stroke`}
            style={{
              width: 28, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              background: activeStrokeWidth === w ? 'var(--secondary)' : 'transparent',
              border: `1px solid ${activeStrokeWidth === w ? 'var(--border-strong)' : 'transparent'}`,
              cursor: 'pointer',
              transition: 'all var(--dur-fast) var(--ease-out)',
            }}
          >
            <div style={{ width: 14, height: w === 1 ? 1.5 : w === 2 ? 2.5 : 4, background: 'var(--muted-foreground)', borderRadius: 2 }} />
          </button>
        ))}
      </div>

      <Sep />

      {/* Zoom */}
      <button onClick={zoomIn} className="tool-btn" title="Zoom in"><Plus size={13} /></button>
      <button onClick={zoomReset} title="Reset zoom"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--muted-foreground)', cursor: 'pointer', width: 36, textAlign: 'center', padding: '2px 0', borderRadius: 'var(--radius-sm)' }}
        className="hover:!text-foreground hover:bg-secondary"
      >{Math.round(zoom * 100)}%</button>
      <button onClick={zoomOut} className="tool-btn" title="Zoom out"><Minus size={13} /></button>
    </aside>
  )
}
