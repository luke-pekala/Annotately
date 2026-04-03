import { useHotkeys } from 'react-hotkeys-hook'
import { Header } from '@/components/Header'
import { Toolbar } from '@/components/Toolbar'
import { Canvas } from '@/components/Canvas'
import { Sidebar } from '@/components/Sidebar'
import { DropZone } from '@/components/DropZone'
import { useStore } from '@/store'

export default function App() {
  const {
    activeDocumentId,
    undo,
    redo,
    setActiveTool,
    zoomIn,
    zoomOut,
    zoomReset,
    sidebarOpen,
  } = useStore()

  useHotkeys('ctrl+z, meta+z', (e) => { e.preventDefault(); undo() }, [undo])
  useHotkeys('ctrl+shift+z, meta+shift+z', (e) => { e.preventDefault(); redo() }, [redo])
  useHotkeys('ctrl+equal, meta+equal', (e) => { e.preventDefault(); zoomIn() }, [zoomIn])
  useHotkeys('ctrl+minus, meta+minus', (e) => { e.preventDefault(); zoomOut() }, [zoomOut])
  useHotkeys('ctrl+0, meta+0', (e) => { e.preventDefault(); zoomReset() }, [zoomReset])
  useHotkeys('v', () => setActiveTool('select'), [setActiveTool])
  useHotkeys('h', () => setActiveTool('pan'), [setActiveTool])
  useHotkeys('n', () => setActiveTool('note'), [setActiveTool])
  useHotkeys('r', () => setActiveTool('rectangle'), [setActiveTool])
  useHotkeys('e', () => setActiveTool('ellipse'), [setActiveTool])
  useHotkeys('a', () => setActiveTool('arrow'), [setActiveTool])
  useHotkeys('f', () => setActiveTool('freehand'), [setActiveTool])
  useHotkeys('t', () => setActiveTool('text'), [setActiveTool])
  useHotkeys('x', () => setActiveTool('eraser'), [setActiveTool])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--canvas-bg)]">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Toolbar />
        <main className="flex-1 flex overflow-hidden relative">
          {activeDocumentId ? <Canvas /> : <DropZone />}
        </main>
        {sidebarOpen && <Sidebar />}
      </div>
    </div>
  )
}
