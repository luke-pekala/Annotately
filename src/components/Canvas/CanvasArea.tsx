import { useRef, useState, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useStore, selectActiveDocument, selectCurrentAnnotations } from '@/store'
import { AnnotationLayer } from './AnnotationLayer'
import { PageNav } from './PageNav'
import { v4 as uuidv4 } from 'uuid'
import type { Point, Annotation } from '@/types'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [numPages, setNumPages] = useState(0)
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Point | null>(null)
  const [drawingAnnotation, setDrawingAnnotation] = useState<Partial<Annotation> | null>(null)
  const panOffset = useRef({ x: 0, y: 0 })
  const lastPan = useRef<Point | null>(null)

  const {
    activeTool,
    activeColor,
    activeOpacity,
    activeStrokeWidth,
    zoom,
    currentPage,
    setCurrentPage,
    addAnnotation,
    setZoom,
    activeDocumentId,
  } = useStore()

  const activeDoc = useStore(selectActiveDocument)
  const annotations = useStore(selectCurrentAnnotations)

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    if (activeDoc) {
      useStore.setState(s => ({
        documents: s.documents.map(d =>
          d.id === activeDoc.id ? { ...d, pageCount: numPages } : d
        )
      }))
    }
  }, [activeDoc])

  const onPageLoadSuccess = useCallback((page: any) => {
    setPageSize({ width: page.width, height: page.height })
  }, [])

  // Wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setZoom(zoom + delta)
    }
  }, [zoom, setZoom])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const getPagePoint = (e: React.MouseEvent): Point => {
    const pageEl = containerRef.current?.querySelector('.react-pdf__Page') as HTMLElement
    if (!pageEl) return { x: 0, y: 0 }
    const rect = pageEl.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'pan') {
      lastPan.current = { x: e.clientX, y: e.clientY }
      setIsDragging(true)
      return
    }
    if (activeTool === 'select') return

    const pt = getPagePoint(e)
    setDragStart(pt)
    setIsDragging(true)

    if (activeTool === 'note') {
      addAnnotation({
        type: 'note',
        pageNumber: currentPage,
        color: activeColor,
        opacity: 1,
        position: pt,
        text: '',
        isOpen: true,
        author: 'User',
      })
      setIsDragging(false)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    if (activeTool === 'pan' && lastPan.current) {
      const dx = e.clientX - lastPan.current.x
      const dy = e.clientY - lastPan.current.y
      if (containerRef.current) {
        containerRef.current.scrollLeft -= dx
        containerRef.current.scrollTop -= dy
      }
      lastPan.current = { x: e.clientX, y: e.clientY }
      return
    }

    if (!dragStart) return
    const pt = getPagePoint(e)

    if (activeTool === 'rectangle' || activeTool === 'ellipse') {
      setDrawingAnnotation({
        type: activeTool,
        rect: {
          x: Math.min(dragStart.x, pt.x),
          y: Math.min(dragStart.y, pt.y),
          width: Math.abs(pt.x - dragStart.x),
          height: Math.abs(pt.y - dragStart.y),
        },
        color: activeColor,
        opacity: activeOpacity,
        strokeWidth: activeStrokeWidth,
      })
    } else if (activeTool === 'arrow') {
      setDrawingAnnotation({
        type: 'arrow',
        start: dragStart,
        end: pt,
        color: activeColor,
        opacity: activeOpacity,
        strokeWidth: activeStrokeWidth,
      })
    } else if (activeTool === 'freehand') {
      setDrawingAnnotation(prev => ({
        type: 'freehand',
        points: [...((prev as any)?.points ?? [dragStart]), pt],
        color: activeColor,
        opacity: activeOpacity,
        strokeWidth: activeStrokeWidth,
      }))
    }
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    lastPan.current = null

    if (drawingAnnotation && dragStart) {
      if (activeTool === 'rectangle' || activeTool === 'ellipse') {
        const ann = drawingAnnotation as any
        if (ann.rect?.width > 4 && ann.rect?.height > 4) {
          addAnnotation({
            type: activeTool,
            pageNumber: currentPage,
            color: activeColor,
            opacity: activeOpacity,
            strokeWidth: activeStrokeWidth,
            filled: false,
            rect: ann.rect,
          })
        }
      } else if (activeTool === 'arrow') {
        const ann = drawingAnnotation as any
        const dx = ann.end?.x - ann.start?.x
        const dy = ann.end?.y - ann.start?.y
        if (Math.sqrt(dx * dx + dy * dy) > 10) {
          addAnnotation({
            type: 'arrow',
            pageNumber: currentPage,
            color: activeColor,
            opacity: activeOpacity,
            strokeWidth: activeStrokeWidth,
            start: ann.start,
            end: ann.end,
          })
        }
      } else if (activeTool === 'freehand') {
        const ann = drawingAnnotation as any
        if (ann.points?.length > 3) {
          addAnnotation({
            type: 'freehand',
            pageNumber: currentPage,
            color: activeColor,
            opacity: activeOpacity,
            strokeWidth: activeStrokeWidth,
            points: ann.points,
          })
        }
      }
    }

    setDrawingAnnotation(null)
    setDragStart(null)
  }

  const pageAnnotations = annotations.filter(a => a.pageNumber === currentPage)
  const isInteractive = activeTool !== 'select' && activeTool !== 'pan'

  if (!activeDoc) return null

  const scaledWidth = pageSize.width > 0 ? pageSize.width * zoom : undefined

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        data-tool={activeTool}
        style={{ background: 'var(--canvas-bg)' }}
      >
        <div
          className="flex justify-center py-8 min-h-full"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="relative shadow-2xl" style={{ width: scaledWidth }}>
            {activeDoc.type === 'pdf' ? (
              <Document
                file={activeDoc.url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<LoadingPage />}
                error={<ErrorPage />}
              >
                <Page
                  pageNumber={currentPage}
                  scale={zoom}
                  onLoadSuccess={onPageLoadSuccess}
                  renderTextLayer={activeTool === 'highlight' || activeTool === 'underline' || activeTool === 'strikethrough'}
                  renderAnnotationLayer={false}
                />
              </Document>
            ) : (
              <img
                src={activeDoc.url}
                alt={activeDoc.name}
                onLoad={(e) => {
                  const img = e.currentTarget
                  setPageSize({ width: img.naturalWidth, height: img.naturalHeight })
                  setNumPages(1)
                }}
                style={{ width: scaledWidth, display: 'block' }}
                draggable={false}
              />
            )}

            {/* Annotation overlay */}
            {pageSize.width > 0 && (
              <AnnotationLayer
                annotations={pageAnnotations}
                drawingAnnotation={drawingAnnotation}
                pageSize={pageSize}
                zoom={zoom}
                activeTool={activeTool}
                interactive={isInteractive}
              />
            )}
          </div>
        </div>
      </div>

      {numPages > 1 && (
        <PageNav
          current={currentPage}
          total={numPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}

function LoadingPage() {
  return (
    <div className="w-[600px] h-[800px] bg-[var(--surface)] rounded flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[var(--text-secondary)]">Loading document…</span>
      </div>
    </div>
  )
}

function ErrorPage() {
  return (
    <div className="w-[600px] h-[400px] bg-[var(--surface)] rounded flex items-center justify-center">
      <span className="text-sm text-red-400">Failed to load document</span>
    </div>
  )
}
