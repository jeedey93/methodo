'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Type, Image as ImageIcon, Clock, Timer, Trash2, Plus,
  Maximize2, Minimize2, X, Palette, ChevronDown,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type WidgetType = 'text' | 'image' | 'clock' | 'timer'

interface BaseWidget {
  id: string
  type: WidgetType
  x: number
  y: number
  w: number
  h: number
  zIndex: number
}

interface TextWidget extends BaseWidget {
  type: 'text'
  content: string
  fontSize: number
  color: string
  bold: boolean
  align: 'left' | 'center' | 'right'
  bg: string
}

interface ImageWidget extends BaseWidget {
  type: 'image'
  src: string
  objectFit: 'contain' | 'cover'
}

interface ClockWidget extends BaseWidget {
  type: 'clock'
  color: string
  showSeconds: boolean
}

interface TimerWidget extends BaseWidget {
  type: 'timer'
  duration: number
  color: string
}

type Widget = TextWidget | ImageWidget | ClockWidget | TimerWidget

interface Background {
  type: 'color' | 'image'
  value: string
}

export interface PageData {
  id: string
  name: string
  widgets: Widget[]
  background: Background
  order: number
}

// ── Constants ────────────────────────────────────────────────────────────────

const BG_PRESETS = [
  '#1e1b4b', '#0f172a', '#14532d', '#7f1d1d', '#1e3a5f',
  '#ffffff', '#fafaf7', '#f0fdf4', '#fef3c7', '#fdf2f8',
]

const TEXT_COLORS = [
  '#ffffff', '#f1f5f9', '#fde68a', '#86efac', '#93c5fd',
  '#f9a8d4', '#000000', '#1e293b',
]

const FONT_SIZES = [18, 24, 32, 48, 64, 80, 96, 128]

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

// ── Clock widget ─────────────────────────────────────────────────────────────

function ClockDisplay({ widget }: { widget: ClockWidget }) {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const h = time.getHours().toString().padStart(2, '0')
  const m = time.getMinutes().toString().padStart(2, '0')
  const s = time.getSeconds().toString().padStart(2, '0')
  return (
    <div className="flex items-center justify-center h-full select-none"
      style={{ color: widget.color, fontFamily: 'monospace', fontSize: Math.min(widget.w / 5, widget.h / 1.6) }}>
      <span className="font-bold tabular-nums drop-shadow-lg">
        {h}:{m}{widget.showSeconds ? `:${s}` : ''}
      </span>
    </div>
  )
}

// ── Timer widget ─────────────────────────────────────────────────────────────

function TimerDisplay({ widget }: { widget: TimerWidget }) {
  const [remaining, setRemaining] = useState(widget.duration)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { setRemaining(widget.duration) }, [widget.duration])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) { setRunning(false); clearInterval(intervalRef.current!); return 0 }
          return r - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const mm = Math.floor(remaining / 60).toString().padStart(2, '0')
  const ss = (remaining % 60).toString().padStart(2, '0')
  const pct = widget.duration > 0 ? remaining / widget.duration : 0
  const isLow = pct < 0.2 && remaining > 0
  const isDone = remaining === 0

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 select-none"
      style={{ color: isDone ? '#ef4444' : isLow ? '#f97316' : widget.color }}>
      <span className="font-bold tabular-nums drop-shadow-lg"
        style={{ fontFamily: 'monospace', fontSize: Math.min(widget.w / 4.5, widget.h / 1.8) }}>
        {mm}:{ss}
      </span>
      <div className="flex gap-2">
        <button onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); setRunning(r => !r) }}
          className="rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1 text-xs font-bold backdrop-blur-sm transition-colors">
          {running ? 'Pause' : isDone ? 'Reset' : 'Start'}
        </button>
        {(running || isDone) && (
          <button onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); setRunning(false); setRemaining(widget.duration) }}
            className="rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1 text-xs font-bold backdrop-blur-sm transition-colors">
            ↺
          </button>
        )}
      </div>
    </div>
  )
}

// ── Widget shell ─────────────────────────────────────────────────────────────

interface ShellProps {
  widget: Widget
  selected: boolean
  onSelect: () => void
  onMove: (x: number, y: number) => void
  onResize: (w: number, h: number) => void
  onDelete: () => void
  children: React.ReactNode
  canvasRef: React.RefObject<HTMLDivElement | null>
}

function WidgetShell({ widget, selected, onSelect, onMove, onResize, onDelete, children, canvasRef }: ShellProps) {
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const resizeState = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null)

  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: widget.x, origY: widget.y }
    const handleMove = (ev: MouseEvent) => {
      if (!dragState.current || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const dx = (ev.clientX - dragState.current.startX) / rect.width * 100
      const dy = (ev.clientY - dragState.current.startY) / rect.height * 100
      onMove(Math.max(0, Math.min(95, dragState.current.origX + dx)),
             Math.max(0, Math.min(95, dragState.current.origY + dy)))
    }
    const handleUp = () => {
      dragState.current = null
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    resizeState.current = { startX: e.clientX, startY: e.clientY, origW: widget.w, origH: widget.h }
    const handleMove = (ev: MouseEvent) => {
      if (!resizeState.current || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const dw = (ev.clientX - resizeState.current.startX) / rect.width * 100
      const dh = (ev.clientY - resizeState.current.startY) / rect.height * 100
      onResize(Math.max(5, resizeState.current.origW + dw), Math.max(3, resizeState.current.origH + dh))
    }
    const handleUp = () => {
      resizeState.current = null
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  return (
    <div
      onMouseDown={handleDragStart}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: `${widget.x}%`, top: `${widget.y}%`,
        width: `${widget.w}%`, height: `${widget.h}%`,
        zIndex: widget.zIndex,
        cursor: 'grab',
        userSelect: 'none',
      }}
      className={`group rounded-xl overflow-hidden transition-shadow ${selected ? 'ring-2 ring-white/70 shadow-2xl' : 'hover:ring-1 hover:ring-white/30'}`}
    >
      {children}
      {selected && (
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="absolute top-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-90 hover:opacity-100 shadow transition-opacity">
          <X className="h-3 w-3" />
        </button>
      )}
      <div
        onMouseDown={handleResizeStart}
        className="absolute bottom-0 right-0 h-5 w-5 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'radial-gradient(circle at bottom right, rgba(255,255,255,0.5) 30%, transparent 70%)' }}
      />
    </div>
  )
}

// ── Edit panels ───────────────────────────────────────────────────────────────

function TextPanel({ widget, onChange }: { widget: TextWidget; onChange: (w: TextWidget) => void }) {
  return (
    <div className="space-y-3">
      <textarea value={widget.content} onChange={e => onChange({ ...widget, content: e.target.value })}
        rows={3} placeholder="Votre texte..."
        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40 resize-none" />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-white/50 mb-1">Taille</p>
          <select value={widget.fontSize} onChange={e => onChange({ ...widget, fontSize: Number(e.target.value) })}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white focus:outline-none">
            {FONT_SIZES.map(s => <option key={s} value={s} className="bg-slate-800">{s}px</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs text-white/50 mb-1">Alignement</p>
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map(a => (
              <button key={a} onClick={() => onChange({ ...widget, align: a })}
                className={`flex-1 rounded-lg py-1.5 text-xs transition-colors ${widget.align === a ? 'bg-white/30 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                {a === 'left' ? '⬅' : a === 'center' ? '⬛' : '➡'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs text-white/50 mb-1">Couleur</p>
        <div className="flex gap-1.5 flex-wrap">
          {TEXT_COLORS.map(c => (
            <button key={c} onClick={() => onChange({ ...widget, color: c })}
              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${widget.color === c ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange({ ...widget, bold: !widget.bold })}
          className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${widget.bold ? 'bg-white/30 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
          G
        </button>
        <div className="flex-1">
          <p className="text-xs text-white/50 mb-1">Fond</p>
          <div className="flex items-center gap-2">
            <input type="color" value={widget.bg === 'transparent' ? '#000000' : widget.bg.slice(0, 7)}
              onChange={e => onChange({ ...widget, bg: e.target.value + '99' })}
              className="h-6 w-10 rounded cursor-pointer border-0 bg-transparent" />
            <button onClick={() => onChange({ ...widget, bg: 'transparent' })}
              className="text-xs text-white/50 hover:text-white/80">Aucun</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImagePanel({ widget, onChange }: { widget: ImageWidget; onChange: (w: ImageWidget) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onChange({ ...widget, src: ev.target?.result as string })
    reader.readAsDataURL(file)
  }
  return (
    <div className="space-y-3">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button onClick={() => fileRef.current?.click()}
        className="w-full rounded-lg border border-dashed border-white/30 py-3 text-sm text-white/70 hover:border-white/60 hover:text-white transition-colors">
        Choisir une image
      </button>
      <div>
        <p className="text-xs text-white/50 mb-1">Affichage</p>
        <div className="flex gap-2">
          {(['contain', 'cover'] as const).map(fit => (
            <button key={fit} onClick={() => onChange({ ...widget, objectFit: fit })}
              className={`flex-1 rounded-lg py-1.5 text-xs transition-colors ${widget.objectFit === fit ? 'bg-white/30 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
              {fit === 'contain' ? 'Contenu' : 'Remplir'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ClockPanel({ widget, onChange }: { widget: ClockWidget; onChange: (w: ClockWidget) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-white/50 mb-1">Couleur</p>
        <div className="flex gap-1.5 flex-wrap">
          {TEXT_COLORS.map(c => (
            <button key={c} onClick={() => onChange({ ...widget, color: c })}
              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${widget.color === c ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={widget.showSeconds}
          onChange={e => onChange({ ...widget, showSeconds: e.target.checked })} className="rounded" />
        <span className="text-sm text-white/80">Afficher les secondes</span>
      </label>
    </div>
  )
}

function TimerPanel({ widget, onChange }: { widget: TimerWidget; onChange: (w: TimerWidget) => void }) {
  const [min, setMin] = useState(Math.floor(widget.duration / 60).toString())
  const [sec, setSec] = useState((widget.duration % 60).toString().padStart(2, '0'))
  const apply = () => {
    const total = (parseInt(min) || 0) * 60 + (parseInt(sec) || 0)
    onChange({ ...widget, duration: total })
  }
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-white/50 mb-1">Durée</p>
        <div className="flex items-center gap-2">
          <input value={min} onChange={e => setMin(e.target.value)} onBlur={apply}
            type="number" min="0" max="99" placeholder="min"
            className="w-16 rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white text-center focus:outline-none" />
          <span className="text-white/60 font-bold">:</span>
          <input value={sec} onChange={e => setSec(e.target.value)} onBlur={apply}
            type="number" min="0" max="59" placeholder="sec"
            className="w-16 rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white text-center focus:outline-none" />
        </div>
      </div>
      <div>
        <p className="text-xs text-white/50 mb-1">Couleur</p>
        <div className="flex gap-1.5 flex-wrap">
          {TEXT_COLORS.map(c => (
            <button key={c} onClick={() => onChange({ ...widget, color: c })}
              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${widget.color === c ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

interface Props {
  initialPages: PageData[]
}

export default function WhiteboardCanvas({ initialPages }: Props) {
  const [pages, setPages] = useState<PageData[]>(initialPages)
  const [activePageId, setActivePageId] = useState<string>(initialPages[0]?.id ?? '')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [showBgPanel, setShowBgPanel] = useState(false)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [saving, setSaving] = useState(false)
  const [renamingPageId, setRenamingPageId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activePage = pages.find(p => p.id === activePageId) ?? pages[0]

  // Auto-save with debounce
  const scheduleSave = useCallback((pageId: string, widgets: Widget[], background: Background) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      await fetch(`/api/whiteboard-pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets, background }),
      })
      setSaving(false)
    }, 1500)
  }, [])

  const updateActivePage = (patch: Partial<PageData>) => {
    if (!activePage) return
    const next = pages.map(p => p.id === activePage.id ? { ...p, ...patch } : p)
    setPages(next)
    const updated = next.find(p => p.id === activePage.id)!
    scheduleSave(activePage.id, updated.widgets, updated.background)
  }

  // Widgets
  const addWidget = (type: WidgetType) => {
    if (!activePage) return
    const maxZ = activePage.widgets.reduce((m, w) => Math.max(m, w.zIndex), 0)
    let w: Widget
    if (type === 'text') {
      w = { id: uid(), type, x: 20, y: 30, w: 40, h: 20, zIndex: maxZ + 1, content: 'Votre texte ici', fontSize: 48, color: '#ffffff', bold: false, align: 'center', bg: 'transparent' }
    } else if (type === 'image') {
      w = { id: uid(), type, x: 25, y: 25, w: 50, h: 50, zIndex: maxZ + 1, src: '', objectFit: 'contain' }
    } else if (type === 'clock') {
      w = { id: uid(), type, x: 5, y: 5, w: 20, h: 15, zIndex: maxZ + 1, color: '#ffffff', showSeconds: true }
    } else {
      w = { id: uid(), type, x: 35, y: 35, w: 30, h: 25, zIndex: maxZ + 1, color: '#ffffff', duration: 300 }
    }
    updateActivePage({ widgets: [...activePage.widgets, w] })
    setSelectedId(w.id)
    setShowAddPanel(false)
  }

  const moveWidget = (id: string, x: number, y: number) => {
    if (!activePage) return
    updateActivePage({ widgets: activePage.widgets.map(w => w.id === id ? { ...w, x, y } : w) })
  }

  const resizeWidget = (id: string, width: number, height: number) => {
    if (!activePage) return
    updateActivePage({ widgets: activePage.widgets.map(w => w.id === id ? { ...w, w: width, h: height } : w) })
  }

  const deleteWidget = (id: string) => {
    if (!activePage) return
    updateActivePage({ widgets: activePage.widgets.filter(w => w.id !== id) })
    setSelectedId(null)
  }

  const updateWidget = (updated: Widget) => {
    if (!activePage) return
    updateActivePage({ widgets: activePage.widgets.map(w => w.id === updated.id ? updated : w) })
  }

  // Pages
  const addPage = async () => {
    const res = await fetch('/api/whiteboard-pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `Page ${pages.length + 1}` }),
    })
    if (res.ok) {
      const newPage = await res.json()
      setPages(prev => [...prev, { ...newPage, widgets: [], background: { type: 'color', value: '#1e1b4b' } }])
      setActivePageId(newPage.id)
      setSelectedId(null)
    }
  }

  const deletePage = async (pageId: string) => {
    if (pages.length <= 1) return
    const res = await fetch(`/api/whiteboard-pages/${pageId}`, { method: 'DELETE' })
    if (res.ok) {
      const remaining = pages.filter(p => p.id !== pageId)
      setPages(remaining)
      if (activePageId === pageId) {
        setActivePageId(remaining[0].id)
        setSelectedId(null)
      }
    }
  }

  const startRename = (page: PageData) => {
    setRenamingPageId(page.id)
    setRenameValue(page.name)
  }

  const commitRename = async (pageId: string) => {
    const name = renameValue.trim() || 'Page'
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, name } : p))
    setRenamingPageId(null)
    await fetch(`/api/whiteboard-pages/${pageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
  }

  // Background
  const bgFileRef = useRef<HTMLInputElement>(null)
  const handleBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => updateActivePage({ background: { type: 'image', value: ev.target?.result as string } })
    reader.readAsDataURL(file)
  }

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current?.parentElement?.requestFullscreen()
      setFullscreen(true)
    } else {
      document.exitFullscreen()
      setFullscreen(false)
    }
  }

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const selectedWidget = activePage?.widgets.find(w => w.id === selectedId) ?? null
  const bg = activePage?.background ?? { type: 'color', value: '#1e1b4b' }
  const bgStyle: React.CSSProperties = bg.type === 'color'
    ? { backgroundColor: bg.value }
    : { backgroundImage: `url(${bg.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }

  if (!activePage) return null

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-950">

      {/* Pages tabs bar */}
      <div
        className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 border-b border-white/10 overflow-x-auto flex-shrink-0"
        onClick={e => e.stopPropagation()}
      >
        {pages.map(page => (
          <div key={page.id} className="flex items-center flex-shrink-0">
            {renamingPageId === page.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={() => commitRename(page.id)}
                onKeyDown={e => { if (e.key === 'Enter') commitRename(page.id); if (e.key === 'Escape') setRenamingPageId(null) }}
                className="rounded-md bg-white/20 px-2 py-1 text-xs text-white focus:outline-none w-24"
              />
            ) : (
              <button
                onClick={() => { setActivePageId(page.id); setSelectedId(null) }}
                onDoubleClick={() => startRename(page)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${page.id === activePageId ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/10'}`}
              >
                {page.name}
              </button>
            )}
            {pages.length > 1 && (
              <button
                onClick={() => deletePage(page.id)}
                className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-white/30 hover:bg-red-500/30 hover:text-red-300 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addPage}
          className="ml-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-white/40 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1" />
        <span className="text-xs text-white/20 mr-1">{saving ? 'Sauvegarde...' : 'Sauvegardé'}</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/95 border-b border-white/10 flex-shrink-0"
        onClick={e => e.stopPropagation()}>
        {/* Add widget */}
        <div className="relative">
          <button onClick={() => { setShowAddPanel(v => !v); setShowBgPanel(false) }}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm font-medium text-white transition-colors">
            <Plus className="h-4 w-4" />Ajouter
          </button>
          {showAddPanel && (
            <div className="absolute top-full left-0 mt-1.5 z-50 w-48 rounded-xl bg-slate-800 border border-white/10 shadow-2xl p-1.5 space-y-0.5">
              {[
                { type: 'text' as WidgetType, icon: Type, label: 'Texte' },
                { type: 'image' as WidgetType, icon: ImageIcon, label: 'Image' },
                { type: 'clock' as WidgetType, icon: Clock, label: 'Horloge' },
                { type: 'timer' as WidgetType, icon: Timer, label: 'Minuterie' },
              ].map(item => (
                <button key={item.type} onClick={() => addWidget(item.type)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                  <item.icon className="h-4 w-4 text-white/60" />{item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Background */}
        <div className="relative">
          <button onClick={() => { setShowBgPanel(v => !v); setShowAddPanel(false) }}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm font-medium text-white transition-colors">
            <Palette className="h-4 w-4" />Fond
          </button>
          {showBgPanel && (
            <div className="absolute top-full left-0 mt-1.5 z-50 w-56 rounded-xl bg-slate-800 border border-white/10 shadow-2xl p-3 space-y-3">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">Couleur</p>
              <div className="flex flex-wrap gap-2">
                {BG_PRESETS.map(c => (
                  <button key={c} onClick={() => updateActivePage({ background: { type: 'color', value: c } })}
                    className={`h-7 w-7 rounded-lg border-2 transition-transform hover:scale-110 shadow-sm ${bg.type === 'color' && bg.value === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
                <input type="color" value={bg.type === 'color' ? bg.value : '#1e1b4b'}
                  onChange={e => updateActivePage({ background: { type: 'color', value: e.target.value } })}
                  className="h-7 w-7 rounded-lg cursor-pointer border-2 border-transparent hover:border-white/50" />
              </div>
              <div className="border-t border-white/10 pt-2">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Image</p>
                <input ref={bgFileRef} type="file" accept="image/*" className="hidden" onChange={handleBgFile} />
                <button onClick={() => bgFileRef.current?.click()}
                  className="w-full rounded-lg border border-dashed border-white/30 py-2 text-xs text-white/70 hover:border-white/60 hover:text-white transition-colors">
                  Choisir une image
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Fullscreen */}
        <button onClick={toggleFullscreen}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm font-medium text-white transition-colors">
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          {fullscreen ? 'Quitter' : 'Plein écran'}
        </button>
      </div>

      {/* Canvas + side panel */}
      <div className="flex flex-1 min-h-0">
        {/* Canvas */}
        <div
          ref={canvasRef}
          className="relative flex-1 overflow-hidden cursor-default"
          style={bgStyle}
          onClick={() => { setSelectedId(null); setShowBgPanel(false); setShowAddPanel(false) }}
        >
          {activePage.widgets.map(widget => (
            <WidgetShell
              key={widget.id}
              widget={widget}
              selected={selectedId === widget.id}
              onSelect={() => { setSelectedId(widget.id); setShowBgPanel(false); setShowAddPanel(false) }}
              onMove={(x, y) => moveWidget(widget.id, x, y)}
              onResize={(w, h) => resizeWidget(widget.id, w, h)}
              onDelete={() => deleteWidget(widget.id)}
              canvasRef={canvasRef}
            >
              {widget.type === 'text' && (
                <div className="h-full w-full flex items-center justify-center rounded-xl overflow-hidden px-3 py-2"
                  style={{ backgroundColor: widget.bg }}>
                  <p style={{
                    color: widget.color, fontSize: `${widget.fontSize}px`,
                    fontWeight: widget.bold ? 700 : 400, textAlign: widget.align,
                    lineHeight: 1.2, wordBreak: 'break-word',
                    textShadow: '0 2px 8px rgba(0,0,0,0.4)', width: '100%',
                  }}>
                    {widget.content}
                  </p>
                </div>
              )}
              {widget.type === 'image' && (
                widget.src
                  ? <img src={widget.src} alt="" className="h-full w-full rounded-xl" style={{ objectFit: widget.objectFit }} draggable={false} />
                  : <div className="h-full w-full flex items-center justify-center rounded-xl border-2 border-dashed border-white/30 bg-white/5">
                      <ImageIcon className="h-8 w-8 text-white/30" />
                    </div>
              )}
              {widget.type === 'clock' && (
                <div className="h-full w-full bg-black/20 backdrop-blur-sm rounded-xl">
                  <ClockDisplay widget={widget} />
                </div>
              )}
              {widget.type === 'timer' && (
                <div className="h-full w-full bg-black/20 backdrop-blur-sm rounded-xl">
                  <TimerDisplay widget={widget} />
                </div>
              )}
            </WidgetShell>
          ))}

          {activePage.widgets.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-white/20 text-lg font-medium select-none">
                Cliquez sur "Ajouter" pour commencer
              </p>
            </div>
          )}
        </div>

        {/* Side edit panel */}
        {selectedWidget && (
          <div className="w-64 flex-shrink-0 bg-slate-900/95 border-l border-white/10 overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">
                  {selectedWidget.type === 'text' ? '✏️ Texte'
                    : selectedWidget.type === 'image' ? '🖼️ Image'
                    : selectedWidget.type === 'clock' ? '🕐 Horloge'
                    : '⏱️ Minuterie'}
                </p>
                <button onClick={() => setSelectedId(null)} className="text-white/40 hover:text-white/80">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {selectedWidget.type === 'text' && <TextPanel widget={selectedWidget} onChange={updateWidget} />}
              {selectedWidget.type === 'image' && <ImagePanel widget={selectedWidget} onChange={updateWidget} />}
              {selectedWidget.type === 'clock' && <ClockPanel widget={selectedWidget} onChange={updateWidget} />}
              {selectedWidget.type === 'timer' && <TimerPanel widget={selectedWidget} onChange={updateWidget} />}
              <div className="border-t border-white/10 pt-3">
                <button onClick={() => deleteWidget(selectedWidget.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 py-2 text-sm text-red-300 transition-colors">
                  <Trash2 className="h-4 w-4" />Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
