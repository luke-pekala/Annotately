import { useCallback } from 'react'
import { useStore } from '@/store'
import { hexToRgba } from '@/utils'
import type { Annotation, ToolType } from '@/types'

interface AnnotationLayerProps {
  annotations: Annotation[]
  drawingAnnotation: Partial<Annotation> | null
  pageSize: { width: number; height: number }
  zoom: number
  activeTool: ToolType
  interactive: boolean
}

export function AnnotationLayer({
  annotations,
  drawingAnnotation,
  pageSize,
  zoom,
  activeTool,
  interactive,
}: AnnotationLayerProps) {
  const { selectAnnotation, selectedAnnotationId, removeAnnotation } = useStore()

  const handleAnnotationClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      if (activeTool === 'eraser') {
        removeAnnotation(id)
      } else if (activeTool === 'select') {
        selectAnnotation(id)
      }
    },
    [activeTool, selectAnnotation, removeAnnotation]
  )

  const w = pageSize.width * zoom
  const h = pageSize.height * zoom

  return (
    <svg
      className={`absolute inset-0 ${interactive ? 'pointer-events-none' : ''}`}
      width={w}
      height={h}
      viewBox={`0 0 ${pageSize.width} ${pageSize.height}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="currentColor" />
        </marker>
      </defs>

      {annotations.map((ann) => (
        <AnnotationShape
          key={ann.id}
          annotation={ann}
          selected={selectedAnnotationId === ann.id}
          onClick={(e) => handleAnnotationClick(e, ann.id)}
          activeTool={activeTool}
        />
      ))}

      {/* Currently drawing */}
      {drawingAnnotation && <DrawingShape annotation={drawingAnnotation} />}
    </svg>
  )
}

function AnnotationShape({
  annotation,
  selected,
  onClick,
  activeTool,
}: {
  annotation: Annotation
  selected: boolean
  onClick: (e: React.MouseEvent) => void
  activeTool: ToolType
}) {
  const isEraser = activeTool === 'eraser'
  const baseProps = {
    onClick,
    style: {
      cursor: isEraser ? 'cell' : activeTool === 'select' ? 'pointer' : 'default',
      pointerEvents: 'all' as const,
    },
  }

  const color = annotation.color
  const opacity = annotation.opacity
  const strokeWidth = ('strokeWidth' in annotation ? annotation.strokeWidth : 2) as number

  if (annotation.type === 'rectangle' || annotation.type === 'ellipse') {
    const rect = (annotation as any).rect
    if (!rect) return null
    const fill = hexToRgba(color, opacity * 0.2)
    const stroke = hexToRgba(color, opacity)

    if (annotation.type === 'rectangle') {
      return (
        <rect
          x={rect.x} y={rect.y} width={rect.width} height={rect.height}
          fill={fill} stroke={stroke} strokeWidth={strokeWidth}
          rx={2}
          className={selected ? 'opacity-100' : ''}
          strokeDasharray={selected ? '4 2' : undefined}
          {...baseProps}
        />
      )
    }
    return (
      <ellipse
        cx={rect.x + rect.width / 2} cy={rect.y + rect.height / 2}
        rx={rect.width / 2} ry={rect.height / 2}
        fill={fill} stroke={stroke} strokeWidth={strokeWidth}
        strokeDasharray={selected ? '4 2' : undefined}
        {...baseProps}
      />
    )
  }

  if (annotation.type === 'arrow') {
    const ann = annotation as any
    if (!ann.start || !ann.end) return null
    return (
      <line
        x1={ann.start.x} y1={ann.start.y}
        x2={ann.end.x} y2={ann.end.y}
        stroke={hexToRgba(color, opacity)}
        strokeWidth={strokeWidth}
        markerEnd={`url(#arrowhead)`}
        style={{ color: hexToRgba(color, opacity), pointerEvents: 'all', cursor: baseProps.style.cursor }}
        onClick={onClick}
        strokeLinecap="round"
      />
    )
  }

  if (annotation.type === 'freehand') {
    const ann = annotation as any
    if (!ann.points?.length) return null
    const d = ann.points
      .map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ')
    return (
      <path
        d={d}
        fill="none"
        stroke={hexToRgba(color, opacity)}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...baseProps}
      />
    )
  }

  if (annotation.type === 'note') {
    const ann = annotation as any
    if (!ann.position) return null
    return (
      <g {...baseProps}>
        <circle cx={ann.position.x} cy={ann.position.y} r={10} fill={color} opacity={opacity} />
        <text
          x={ann.position.x} y={ann.position.y + 4}
          textAnchor="middle" fontSize={10} fill="#000" fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          !
        </text>
        {selected && ann.text && (
          <foreignObject x={ann.position.x + 14} y={ann.position.y - 20} width={160} height={80}>
            <div
              className="bg-[var(--surface-3)] border border-[var(--border-strong)] rounded-lg p-2 text-xs text-[var(--text-primary)] shadow-xl"
            >
              {ann.text}
            </div>
          </foreignObject>
        )}
      </g>
    )
  }

  if (annotation.type === 'text') {
    const ann = annotation as any
    return (
      <text
        x={ann.position?.x} y={ann.position?.y}
        fill={hexToRgba(color, opacity)}
        fontSize={ann.fontSize ?? 14}
        fontWeight={ann.fontWeight ?? 'normal'}
        fontFamily="DM Sans, sans-serif"
        {...baseProps}
      >
        {ann.text}
      </text>
    )
  }

  if (annotation.type === 'highlight' || annotation.type === 'underline' || annotation.type === 'strikethrough') {
    const ann = annotation as any
    const rects: any[] = ann.rects ?? []
    return (
      <g {...baseProps}>
        {rects.map((r: any, i: number) => {
          if (annotation.type === 'highlight') {
            return <rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} fill={hexToRgba(color, opacity)} rx={1} />
          }
          if (annotation.type === 'underline') {
            return <line key={i} x1={r.x} y1={r.y + r.height} x2={r.x + r.width} y2={r.y + r.height} stroke={hexToRgba(color, opacity)} strokeWidth={1.5} />
          }
          // strikethrough
          const mid = r.y + r.height / 2
          return <line key={i} x1={r.x} y1={mid} x2={r.x + r.width} y2={mid} stroke={hexToRgba(color, opacity)} strokeWidth={1.5} />
        })}
      </g>
    )
  }

  return null
}

function DrawingShape({ annotation }: { annotation: Partial<Annotation> }) {
  const color = annotation.color ?? '#fbbf24'
  const opacity = annotation.opacity ?? 0.6
  const strokeWidth = ('strokeWidth' in annotation ? (annotation as any).strokeWidth : 2) as number

  if (annotation.type === 'rectangle') {
    const ann = annotation as any
    if (!ann.rect) return null
    return (
      <rect
        x={ann.rect.x} y={ann.rect.y} width={ann.rect.width} height={ann.rect.height}
        fill={hexToRgba(color, opacity * 0.15)}
        stroke={hexToRgba(color, 0.8)}
        strokeWidth={strokeWidth}
        strokeDasharray="4 2"
        rx={2}
      />
    )
  }

  if (annotation.type === 'ellipse') {
    const ann = annotation as any
    if (!ann.rect) return null
    return (
      <ellipse
        cx={ann.rect.x + ann.rect.width / 2} cy={ann.rect.y + ann.rect.height / 2}
        rx={ann.rect.width / 2} ry={ann.rect.height / 2}
        fill={hexToRgba(color, opacity * 0.15)}
        stroke={hexToRgba(color, 0.8)}
        strokeWidth={strokeWidth}
        strokeDasharray="4 2"
      />
    )
  }

  if (annotation.type === 'arrow') {
    const ann = annotation as any
    if (!ann.start || !ann.end) return null
    return (
      <line
        x1={ann.start.x} y1={ann.start.y} x2={ann.end.x} y2={ann.end.y}
        stroke={hexToRgba(color, 0.8)}
        strokeWidth={strokeWidth}
        strokeDasharray="4 2"
        strokeLinecap="round"
      />
    )
  }

  if (annotation.type === 'freehand') {
    const ann = annotation as any
    if (!ann.points?.length) return null
    const d = ann.points.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    return (
      <path
        d={d} fill="none"
        stroke={hexToRgba(color, 0.8)}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )
  }

  return null
}
