import { useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Image, Highlighter, Square, StickyNote, PenLine } from 'lucide-react'
import { useStore } from '@/store'
import { readFileAsDataURL, isPDFFile, isImageFile } from '@/utils'

const FEATURES = [
  { icon: <Highlighter size={14} />, label: 'Highlight & Underline', desc: 'Mark up text in PDFs' },
  { icon: <StickyNote size={14} />,  label: 'Sticky Notes',          desc: 'Pin notes anywhere' },
  { icon: <Square size={14} />,      label: 'Shapes & Arrows',       desc: 'Draw rectangles, ellipses, arrows' },
  { icon: <PenLine size={14} />,     label: 'Freehand Drawing',      desc: 'Sketch freely with pen tool' },
]

export function WelcomeScreen() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addDocument } = useStore()
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    if (!isPDFFile(file) && !isImageFile(file)) return
    const url = await readFileAsDataURL(file)
    addDocument({ name: file.name, type: isPDFFile(file) ? 'pdf' : 'image', url, pageCount: isPDFFile(file) ? 0 : 1 })
  }, [addDocument])

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) await handleFile(file)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 gap-6" style={{ background: 'var(--canvas-bg)' }}>

      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: '100%', maxWidth: 480,
          background: isDragOver ? 'var(--secondary)' : 'var(--card)',
          border: `1.5px dashed ${isDragOver ? 'var(--accent-amber)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-xl)',
          padding: '3rem 2rem',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all var(--dur-mid) var(--ease-out)',
          transform: isDragOver ? 'scale(1.01)' : 'scale(1)',
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 'var(--radius-lg)',
          background: isDragOver ? 'var(--accent-amber-dim)' : 'var(--secondary)',
          border: `1px solid ${isDragOver ? 'rgba(251,191,36,0.3)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
          color: isDragOver ? 'var(--accent-amber)' : 'var(--muted-foreground)',
          transition: 'all var(--dur-mid) var(--ease-out)',
        }}>
          <Upload size={22} />
        </div>

        <h2 style={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.015em', color: 'var(--foreground)', marginBottom: '0.375rem' }}>
          {isDragOver ? 'Drop to open' : 'Open a file to annotate'}
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', marginBottom: '1.25rem' }}>
          Drag & drop a PDF or image, or click to browse
        </p>

        <div className="flex items-center justify-center gap-2">
          {[
            { icon: <FileText size={12} style={{ color: '#f87171' }} />, label: 'PDF' },
            { icon: <Image size={12} style={{ color: '#60a5fa' }} />,    label: 'PNG / JPG' },
            { icon: <Image size={12} style={{ color: '#34d399' }} />,    label: 'WebP / GIF' },
          ].map(({ icon, label }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-md)',
              background: 'var(--secondary)', border: '1px solid var(--border)',
              fontSize: '0.6875rem', color: 'var(--muted-foreground)',
            }}>
              {icon} {label}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Feature grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%', maxWidth: 480 }}
      >
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.04 }}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
              padding: '0.625rem 0.75rem',
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-amber-dim)',
              border: '1px solid rgba(251,191,36,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-amber)', flexShrink: 0, marginTop: 1,
            }}>{f.icon}</div>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--foreground)', lineHeight: 1.3 }}>{f.label}</p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', marginTop: 2, lineHeight: 1.4 }}>{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden"
        onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handleFile(f); e.target.value = '' }} />
    </div>
  )
}
