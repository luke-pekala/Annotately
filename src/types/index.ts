export type AnnotationType = 'highlight' | 'underline' | 'strikethrough' | 'note' | 'rectangle' | 'ellipse' | 'arrow' | 'freehand' | 'text'

export type AnnotationColor = string

export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface BaseAnnotation {
  id: string
  type: AnnotationType
  pageNumber: number
  color: AnnotationColor
  opacity: number
  createdAt: number
  updatedAt: number
  comment?: string
  author?: string
  tags?: string[]
}

export interface HighlightAnnotation extends BaseAnnotation {
  type: 'highlight' | 'underline' | 'strikethrough'
  rects: Rect[]
  text?: string
}

export interface NoteAnnotation extends BaseAnnotation {
  type: 'note'
  position: Point
  text: string
  isOpen: boolean
}

export interface ShapeAnnotation extends BaseAnnotation {
  type: 'rectangle' | 'ellipse'
  rect: Rect
  strokeWidth: number
  filled: boolean
}

export interface ArrowAnnotation extends BaseAnnotation {
  type: 'arrow'
  start: Point
  end: Point
  strokeWidth: number
}

export interface FreehandAnnotation extends BaseAnnotation {
  type: 'freehand'
  points: Point[]
  strokeWidth: number
}

export interface TextAnnotation extends BaseAnnotation {
  type: 'text'
  position: Point
  text: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
}

export type Annotation =
  | HighlightAnnotation
  | NoteAnnotation
  | ShapeAnnotation
  | ArrowAnnotation
  | FreehandAnnotation
  | TextAnnotation

export type ToolType = AnnotationType | 'select' | 'pan' | 'eraser'

export interface DocumentFile {
  id: string
  name: string
  type: 'pdf' | 'image'
  url: string
  pageCount: number
  createdAt: number
}

export interface AnnotationStore {
  annotations: Record<string, Annotation[]>
  selectedAnnotationId: string | null
  activeTool: ToolType
  activeColor: AnnotationColor
  activeOpacity: number
  activeStrokeWidth: number
  zoom: number
  currentPage: number
  documents: DocumentFile[]
  activeDocumentId: string | null
  sidebarOpen: boolean
  sidebarTab: 'annotations' | 'pages' | 'comments'
  undoStack: Annotation[][]
  redoStack: Annotation[][]
}

export interface ExportOptions {
  format: 'json' | 'pdf'
  includeComments: boolean
}
