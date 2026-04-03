import { saveAs } from 'file-saver'
import type { Annotation, DocumentFile } from '@/types'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getAnnotationLabel(type: string): string {
  const labels: Record<string, string> = {
    highlight: 'Highlight',
    underline: 'Underline',
    strikethrough: 'Strikethrough',
    note: 'Note',
    rectangle: 'Rectangle',
    ellipse: 'Ellipse',
    arrow: 'Arrow',
    freehand: 'Drawing',
    text: 'Text',
  }
  return labels[type] ?? type
}

export function exportAnnotations(
  annotations: Annotation[],
  document: DocumentFile | null
): void {
  const data = {
    document: document
      ? { id: document.id, name: document.name, pageCount: document.pageCount }
      : null,
    exportedAt: new Date().toISOString(),
    annotations,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  saveAs(blob, `${document?.name ?? 'annotations'}-annotations.json`)
}

export function groupAnnotationsByPage(
  annotations: Annotation[]
): Record<number, Annotation[]> {
  return annotations.reduce(
    (acc, ann) => {
      if (!acc[ann.pageNumber]) acc[ann.pageNumber] = []
      acc[ann.pageNumber].push(ann)
      return acc
    },
    {} as Record<number, Annotation[]>
  )
}

export function getAnnotationIcon(type: string): string {
  const icons: Record<string, string> = {
    highlight: '🟡',
    underline: '〰️',
    strikethrough: '✂️',
    note: '💬',
    rectangle: '⬜',
    ellipse: '⭕',
    arrow: '➡️',
    freehand: '✏️',
    text: '𝐓',
  }
  return icons[type] ?? '•'
}

export async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf'
}
