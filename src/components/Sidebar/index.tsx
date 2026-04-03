import { useState } from 'react'
import { MessageSquare, Layers, List, Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore, selectCurrentAnnotations, selectActiveDocument } from '@/store'
import { formatDate, getAnnotationLabel, groupAnnotationsByPage, exportAnnotations } from '@/utils'
import type { Annotation } from '@/types'

const TABS = [
  { id: 'annotations' as const, icon: <List size={13} />,        label: 'Notes' },
  { id: 'pages' as const,       icon: <Layers size={13} />,      label: 'Pages' },
  { id: 'comments' as const,    icon: <MessageSquare size={13} />, label: 'Comments' },
]

export function Sidebar() {
  const { sidebarTab, setSidebarTab, selectedAnnotationId, selectAnnotation, removeAnnotation, updateAnnotation, currentPage, setCurrentPage } = useStore()
  const annotations = useStore(selectCurrentAnnotations)
  const activeDoc = useStore(selectActiveDocument)
  const [search, setSearch] = useState('')

  const filtered = annotations.filter((a) => {
    if (!search) return true
    return getAnnotationLabel(a.type).toLowerCase().includes(search.toLowerCase()) ||
           (a.comment ?? '').toLowerCase().includes(search.toLowerCase())
  })

  return (
    <aside style={{ background: 'var(--card)', borderLeft: '1px solid var(--border)', width: 268 }}
      className="flex flex-col h-full flex-shrink-0">

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '0.375rem' }} className="flex gap-0.5">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setSidebarTab(tab.id)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
              padding: '0.375rem 0', borderRadius: 'var(--radius-md)',
              fontSize: '0.6875rem', fontWeight: 500, cursor: 'pointer',
              background: sidebarTab === tab.id ? 'var(--secondary)' : 'transparent',
              border: `1px solid ${sidebarTab === tab.id ? 'var(--border-strong)' : 'transparent'}`,
              color: sidebarTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)',
              transition: 'all var(--dur-fast) var(--ease-out)',
            }}
          >{tab.icon}{tab.label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {sidebarTab === 'annotations' && <AnnotationsTab annotations={filtered} search={search} setSearch={setSearch} selectedId={selectedAnnotationId} onSelect={selectAnnotation} onDelete={removeAnnotation} onUpdate={updateAnnotation} />}
        {sidebarTab === 'pages'       && <PagesTab byPage={groupAnnotationsByPage(annotations)} currentPage={currentPage} onPageChange={setCurrentPage} />}
        {sidebarTab === 'comments'    && <CommentsTab comments={annotations.filter(a => a.comment)} selectedId={selectedAnnotationId} onSelect={selectAnnotation} />}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '0.5rem 0.75rem' }} className="flex items-center justify-between flex-shrink-0">
        <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)' }}>
          {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
        </span>
        <button onClick={() => exportAnnotations(annotations, activeDoc)}
          style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', cursor: 'pointer', background: 'none', border: 'none', transition: 'color var(--dur-fast) var(--ease-out)' }}
          className="hover:!text-foreground"
        >Export JSON</button>
      </div>
    </aside>
  )
}

function AnnotationsTab({ annotations, search, setSearch, selectedId, onSelect, onDelete, onUpdate }: {
  annotations: Annotation[]; search: string; setSearch: (s: string) => void
  selectedId: string | null; onSelect: (id: string | null) => void
  onDelete: (id: string) => void; onUpdate: (id: string, u: Partial<Annotation>) => void
}) {
  return (
    <>
      <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'relative' }}>
          <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
          <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="input" style={{ paddingLeft: 28, paddingTop: 5, paddingBottom: 5, fontSize: '0.75rem' }} />
          {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={12} /></button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: '0.375rem' }}>
        {annotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <List size={16} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{search ? 'No results' : 'No annotations yet'}</p>
            {!search && <p style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', opacity: 0.6, marginTop: 3 }}>Pick a tool and start annotating</p>}
          </div>
        ) : annotations.map((ann) => (
          <AnnItem key={ann.id} annotation={ann} selected={selectedId === ann.id}
            onSelect={() => onSelect(ann.id === selectedId ? null : ann.id)}
            onDelete={() => onDelete(ann.id)}
            onUpdate={(u) => onUpdate(ann.id, u)} />
        ))}
      </div>
    </>
  )
}

function AnnItem({ annotation, selected, onSelect, onDelete, onUpdate }: {
  annotation: Annotation; selected: boolean; onSelect: () => void; onDelete: () => void; onUpdate: (u: Partial<Annotation>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [comment, setComment] = useState(annotation.comment ?? '')
  const save = () => { onUpdate({ comment }); setEditing(false) }

  return (
    <div className={selected ? 'annotation-item-active' : 'annotation-item'} style={{ marginBottom: 2 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: annotation.color, flexShrink: 0, marginTop: 4 }} />
      <div style={{ flex: 1, minWidth: 0 }} onClick={onSelect}>
        <div className="flex items-center justify-between gap-1">
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getAnnotationLabel(annotation.type)}
          </span>
          <span style={{ fontSize: '0.625rem', color: 'var(--muted-foreground)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>p.{annotation.pageNumber}</span>
        </div>
        <span style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', opacity: 0.6 }}>{formatDate(annotation.createdAt)}</span>
        {annotation.comment && !editing && <p style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', marginTop: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{annotation.comment}</p>}
        {selected && (
          <AnimatePresence>
            {editing ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginTop: 6 }} onClick={e => e.stopPropagation()}>
                <textarea autoFocus value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment…"
                  className="input" style={{ fontSize: '0.6875rem', resize: 'none', padding: '5px 8px' }} rows={3}
                  onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) save(); if (e.key === 'Escape') setEditing(false) }} />
                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <button onClick={save} className="btn-primary" style={{ fontSize: '0.6875rem', padding: '2px 8px' }}>Save</button>
                  <button onClick={() => setEditing(false)} className="btn-ghost" style={{ fontSize: '0.6875rem', padding: '2px 8px' }}>Cancel</button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 6, marginTop: 5 }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setEditing(true)} style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color var(--dur-fast) var(--ease-out)' }} className="hover:!text-amber-400">
                  {annotation.comment ? 'Edit' : '+ Comment'}
                </button>
                <span style={{ color: 'var(--muted-foreground)', opacity: 0.4 }}>·</span>
                <button onClick={onDelete} style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color var(--dur-fast) var(--ease-out)' }} className="hover:!text-red-400">Delete</button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

function PagesTab({ byPage, currentPage, onPageChange }: { byPage: Record<number, Annotation[]>; currentPage: number; onPageChange: (p: number) => void }) {
  const pages = Object.keys(byPage).map(Number).sort((a, b) => a - b)
  if (!pages.length) return (
    <div className="flex-1 flex flex-col items-center justify-center py-12">
      <Layers size={18} style={{ color: 'var(--muted-foreground)', marginBottom: 8, opacity: 0.5 }} />
      <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>No annotated pages</p>
    </div>
  )
  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '0.375rem' }}>
      {pages.map((page) => (
        <button key={page} onClick={() => onPageChange(page)} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.375rem 0.625rem', borderRadius: 'var(--radius-md)', marginBottom: 2,
          fontSize: '0.75rem', cursor: 'pointer',
          background: page === currentPage ? 'var(--secondary)' : 'transparent',
          border: `1px solid ${page === currentPage ? 'var(--border-strong)' : 'transparent'}`,
          color: page === currentPage ? 'var(--foreground)' : 'var(--muted-foreground)',
          transition: 'all var(--dur-fast) var(--ease-out)',
        }}>
          <span>Page {page}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', padding: '1px 6px', borderRadius: 999, background: 'var(--muted)', color: 'var(--muted-foreground)' }}>{byPage[page].length}</span>
        </button>
      ))}
    </div>
  )
}

function CommentsTab({ comments, selectedId, onSelect }: { comments: Annotation[]; selectedId: string | null; onSelect: (id: string | null) => void }) {
  if (!comments.length) return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
      <MessageSquare size={18} style={{ color: 'var(--muted-foreground)', marginBottom: 8, opacity: 0.5 }} />
      <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>No comments yet</p>
      <p style={{ fontSize: '0.6875rem', color: 'var(--muted-foreground)', opacity: 0.5, marginTop: 3 }}>Select an annotation to add a comment</p>
    </div>
  )
  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '0.375rem' }}>
      {comments.map((ann) => (
        <div key={ann.id} onClick={() => onSelect(ann.id)} style={{
          padding: '0.5rem 0.625rem', borderRadius: 'var(--radius-md)', marginBottom: 4,
          cursor: 'pointer', fontSize: '0.75rem',
          background: selectedId === ann.id ? 'var(--secondary)' : 'transparent',
          border: `1px solid ${selectedId === ann.id ? 'var(--border-strong)' : 'var(--border)'}`,
          transition: 'all var(--dur-fast) var(--ease-out)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: ann.color }} />
            <span style={{ fontWeight: 500, color: 'var(--foreground)' }}>{getAnnotationLabel(ann.type)}</span>
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--muted-foreground)' }}>p.{ann.pageNumber}</span>
          </div>
          <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{ann.comment}</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--muted-foreground)', opacity: 0.5, marginTop: 4 }}>{formatDate(ann.createdAt)}</p>
        </div>
      ))}
    </div>
  )
}
