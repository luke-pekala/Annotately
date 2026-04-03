import { useRef } from 'react'
import { Upload, Download, Undo2, Redo2, PanelRight, FileText, Image, ZoomIn, ZoomOut } from 'lucide-react'
import { useStore, selectActiveDocument, selectCurrentAnnotations } from '@/store'
import { exportAnnotations, isPDFFile, readFileAsDataURL } from '@/utils'
import type { DocumentFile } from '@/types'

export function Header() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    documents, activeDocumentId, sidebarOpen,
    undoStack, redoStack, zoom,
    setSidebarOpen, undo, redo, zoomIn, zoomOut, zoomReset,
    addDocument, setActiveDocument, removeDocument,
  } = useStore()

  const activeDoc = useStore(selectActiveDocument)
  const annotations = useStore(selectCurrentAnnotations)

  const handleFileOpen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await readFileAsDataURL(file)
    const docType: DocumentFile['type'] = isPDFFile(file) ? 'pdf' : 'image'
    addDocument({ name: file.name, type: docType, url, pageCount: docType === 'image' ? 1 : 0 })
    e.target.value = ''
  }

  return (
    <header style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
      className="flex items-center h-[52px] px-4 gap-2 flex-shrink-0 z-30">

      {/* Brand */}
      <div className="flex items-center gap-2 mr-3 flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="7" fill="var(--secondary)" />
          <rect x="6" y="7" width="14" height="18" rx="2" fill="none" stroke="var(--accent-amber)" strokeWidth="1.5" />
          <rect x="9" y="12" width="6" height="1.5" rx="0.75" fill="var(--accent-amber)" />
          <rect x="9" y="15.5" width="8" height="1.5" rx="0.75" fill="var(--muted-foreground)" opacity="0.5" />
          <rect x="9" y="19" width="5" height="1.5" rx="0.75" fill="var(--muted-foreground)" opacity="0.35" />
          <circle cx="22" cy="22" r="5" fill="var(--accent-amber)" />
          <path d="M20.5 22h3M22 20.5v3" stroke="#09090b" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.9375rem', letterSpacing: '-0.015em', color: 'var(--foreground)', lineHeight: 1.2 }}>
          Annotately
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

      {/* Document tabs */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar min-w-0 mx-2">
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setActiveDocument(doc.id)}
            style={{
              background: doc.id === activeDocumentId ? 'var(--secondary)' : 'transparent',
              border: `1px solid ${doc.id === activeDocumentId ? 'var(--border-strong)' : 'transparent'}`,
              color: doc.id === activeDocumentId ? 'var(--foreground)' : 'var(--muted-foreground)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '0.25rem 0.625rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              maxWidth: 160,
              flexShrink: 0,
              transition: 'all var(--dur-fast) var(--ease-out)',
            }}
            className="group"
          >
            {doc.type === 'pdf'
              ? <FileText size={12} style={{ flexShrink: 0, color: '#f87171' }} />
              : <Image size={12} style={{ flexShrink: 0, color: '#60a5fa' }} />
            }
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</span>
            <span
              onClick={(e) => { e.stopPropagation(); removeDocument(doc.id) }}
              style={{ opacity: 0, fontSize: 14, lineHeight: 1, cursor: 'pointer', flexShrink: 0, color: 'var(--muted-foreground)', transition: 'opacity var(--dur-fast) var(--ease-out)' }}
              className="group-hover:!opacity-100 hover:!text-red-400"
            >×</span>
          </button>
        ))}
        {documents.length === 0 && (
          <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', opacity: 0.5, paddingLeft: 4 }}>
            No documents open
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={undo} disabled={!undoStack.length} title="Undo (Ctrl+Z)" className="tool-btn disabled:opacity-30">
          <Undo2 size={14} />
        </button>
        <button onClick={redo} disabled={!redoStack.length} title="Redo (Ctrl+Shift+Z)" className="tool-btn disabled:opacity-30">
          <Redo2 size={14} />
        </button>

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

        <button onClick={zoomOut} className="tool-btn" title="Zoom out"><ZoomOut size={14} /></button>
        <button
          onClick={zoomReset}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--muted-foreground)', cursor: 'pointer', width: 40, textAlign: 'center', padding: '2px 0', borderRadius: 'var(--radius-sm)', transition: 'color var(--dur-fast) var(--ease-out)' }}
          className="hover:!text-foreground"
          title="Reset zoom"
        >{Math.round(zoom * 100)}%</button>
        <button onClick={zoomIn} className="tool-btn" title="Zoom in"><ZoomIn size={14} /></button>

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

        {activeDoc && (
          <button onClick={() => exportAnnotations(annotations, activeDoc)} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', gap: '0.375rem' }}>
            <Download size={13} /> Export
          </button>
        )}

        <button onClick={() => fileInputRef.current?.click()} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', gap: '0.375rem' }}>
          <Upload size={13} /> Open File
        </button>

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

        <button onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle sidebar" className={sidebarOpen ? 'tool-btn-active' : 'tool-btn'}>
          <PanelRight size={15} />
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileOpen} />
    </header>
  )
}
