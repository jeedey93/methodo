'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Type, Image as ImageIcon, Clock, Timer, Trash2, Plus,
  Maximize2, Minimize2, Save, ChevronDown, X, Palette,
  GripHorizontal, AlignLeft, Bold,
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

function TimerDisplay({ widget, onUpdate }: { widget: TimerWidget; onUpdate: (w: TimerWidget) => void }) {
  const [remaining, setRemaining] = useState(widget.duration)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => { setRemaining(widget.duration) }, [widget.duration])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            setRunning(false)
            clearInterval(intervalRef.current!)
            return 0
          }
          return r - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const m = Math.floor(remaining / 60).toString().padStart(2, '0')
  const s = (remaining % 60).toString().padStart(2, '0')
  const pct = widget.duration > 0 ? remaining / widget.duration : 0
  const isLow = pct < 0.2 && remaining > 0
  const isDone = remaining === 0

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 select-none"
      style={{ color: isDone ? '#ef4444' : isLow ? '#f97316' : widget.color }}>
      <span className="font-bold tabular-nums drop-shadow-lg"
        style={{ fontFamily: 'monospace', fontSize: Math.min(widget.w / 4.5, widget.h / 1.8) }}>
        {m}:{s}
      </span>
      <div className="flex gap-2">
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); setRunning(r => !r) }}
          className="rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1 text-xs font-bold backdrop-blur-sm transition-colors">
          {running ? 'Pause' : isDone ? 'Reset' : 'Start'}
        </button>
        {(running || isDone) && (
          <button
            onMouseDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); setRunning(false); setRemaining(widget.duration) }}
            className="rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1 text-xs font-bold backdrop-blur-sm transition-colors">
            ↺
          </button>
        )}
      </div>
    </div>
  )
}

// ── Widget shell (drag + controls) ──────────────────────────────────────────

interface WidgetShellProps {
  widget: Widget
  selected: boolean
  onSelect: () => void
  onMove: (x: number, y: number) => void
  onResize: (w: number, h: number) => void
  onDelete: () => void
  children: React.ReactNode
  canvasRef: React.RefObject<HTMLDivElement | null>
}

function WidgetShell({ widget, selected, onSelect, onMove, onResize, onDelete, children, canvasRef }: WidgetShellProps) {
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const resizeState = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null)

  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: widget.x, origY: widget.y }
    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragState.current || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const dx = (ev.clientX - dragState.current.startX) / rect.width * 100
      const dy = (ev.clientY - dragState.current.startY) / rect.height * 100
      onMove(Math.max(0, Math.min(95, dragState.current.origX + dx)),
             Math.max(0, Math.min(95, dragState.current.origY + dy)))
    }
    const onUp = () => {
      dragState.current = null
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', onUp)
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    resizeState.current = { startX: e.clientX, startY: e.clientY, origW: widget.w, origH: widget.h }
    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizeState.current || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const dw = (ev.clientX - resizeState.current.startX) / rect.width * 100
      const dh = (ev.clientY - resizeState.current.startY) / rect.height * 100
      onResize(Math.max(5, resizeState.current.origW + dw), Math.max(3, resizeState.current.origH + dh))
    }
    const onUp = () => {
      resizeState.current = null
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      onMouseDown={handleDragStart}
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

      {/* Controls (visible on hover / selected) */}
      {selected && (
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="absolute top-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-90 hover:opacity-100 shadow transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute bottom-0 right-0 h-5 w-5 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'radial-gradient(circle at bottom right, rgba(255,255,255,0.5) 30%, transparent 70%)' }}
      />
    </div>
  )
}

// ── Text editor panel ────────────────────────────────────────────────────────

function TextPanel({ widget, onChange }: { widget: TextWidget; onChange: (w: TextWidget) => void }) {
  return (
    <div className="space-y-3">
      <textarea
        value={widget.content}
        onChange={e => onChange({ ...widget, content: e.target.value })}
        rows={3}
        placeholder="Votre texte..."
        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40 resize-none"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-white/50 mb-1">Taille</p>
          <select value={widget.fontSize}
            onChange={e => onChange({ ...widget, fontSize: Number(e.target.value) })}
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
        <p className="text-xs text-white/50 mb-1">Couleur du texte</p>
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
          <p className="text-xs text-white/50 mb-1">Fond (opacité)</p>
          <input type="color" value={widget.bg === 'transparent' ? '#000000' : widget.bg}
            onChange={e => onChange({ ...widget, bg: e.target.value + '99' })}
            className="h-6 w-12 rounded cursor-pointer border-0 bg-transparent" />
          <button onClick={() => onChange({ ...widget, bg: 'transparent' })}
            className="ml-2 text-xs text-white/50 hover:text-white/80">Aucun</button>
        </div>
      </div>
    </div>
  )
}

// ── Timer editor panel ───────────────────────────────────────────────────────

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

// ── Clock editor panel ───────────────────────────────────────────────────────

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
          onChange={e => onChange({ ...widget, showSeconds: e.target.checked })}
          className="rounded" />
        <span className="text-sm text-white/80">Afficher les secondes</span>
      </label>
    </div>
  )
}

// ── Image editor panel ───────────────────────────────────────────────────────

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
              className={`flex-1 rounded-lg py-1.5 text-xs transition-colors capitalize ${widget.objectFit === fit ? 'bg-white/30 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
              {fit === 'contain' ? 'Contenu' : 'Remplir'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Whiteboard ──────────────────────────────────────────────────────────

interface Props {
  initialWidgets: Widget[]
  initialBackground: Background
}

export default function WhiteboardCanvas({ initialWidgets, initialBackground }: Props) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets)
  const [background, setBackground] = useState<Background>(initialBackground)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [showBgPanel, setShowBgPanel] = useState(false)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [saving, setSaving] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedWidget = widgets.find(w => w.id === selectedId) ?? null

  // Auto-save with debounce
  const scheduleSave = useCallback((w: Widget[], bg: Background) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      await fetch('/api/whiteboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets: w, background: bg }),
      })
      setSaving(false)
    }, 1500)
  }, [])

  const updateWidgets = (next: Widget[]) => {
    setWidgets(next)
    scheduleSave(next, background)
  }

  const updateBackground = (bg: Background) => {
    setBackground(bg)
    scheduleSave(widgets, bg)
  }

  const addWidget = (type: WidgetType) => {
    const maxZ = widgets.reduce((m, w) => Math.max(m, w.zIndex), 0)
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
    const next = [...widgets, w]
    setWidgets(next)
    setSelectedId(w.id)
    scheduleSave(next, background)
    setShowAddPanel(false)
  }

  const moveWidget = (id: string, x: number, y: number) => {
    const next = widgets.map(w => w.id === id ? { ...w, x, y } : w)
    updateWidgets(next)
  }

  const resizeWidget = (id: string, width: number, height: number) => {
    const next = widgets.map(w => w.id === id ? { ...w, w: width, h: height } : w)
    updateWidgets(next)
  }

  const deleteWidget = (id: string) => {
    const next = widgets.filter(w => w.id !== id)
    updateWidgets(next)
    setSelectedId(null)
  }

  const updateWidget = (updated: Widget) => {
    const next = widgets.map(w => w.id === updated.id ? updated : w)
    updateWidgets(next)
  }

  // Background image upload
  const bgFileRef = useRef<HTMLInputElement>(null)
  const handleBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => updateBackground({ type: 'image', value: ev.target?.result as string })
    reader.readAsDataURL(file)
  }

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen()
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

  const bgStyle: React.CSSProperties = background.type === 'color'
    ? { backgroundColor: background.value }
    : { backgroundImage: `url(${background.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/95 border-b border-white/10 flex-shrink-0 print:hidden">
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
                  <button key={c} onClick={() => updateBackground({ type: 'color', value: c })}
                    className={`h-7 w-7 rounded-lg border-2 transition-transform hover:scale-110 shadow-sm ${background.type === 'color' && background.value === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
                <input type="color" value={background.type === 'color' ? background.value : '#1e1b4b'}
                  onChange={e => updateBackground({ type: 'color', value: e.target.value })}
                  className="h-7 w-7 rounded-lg cursor-pointer border-2 border-transparent hover:border-white/50" title="Couleur personnalisée" />
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

        {/* Save status */}
        <span className="text-xs text-white/30">{saving ? 'Sauvegarde...' : 'Sauvegardé'}</span>

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
          {widgets.map(widget => (
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
                    color: widget.color,
                    fontSize: `${widget.fontSize}px`,
                    fontWeight: widget.bold ? 700 : 400,
                    textAlign: widget.align,
                    lineHeight: 1.2,
                    wordBreak: 'break-word',
                    textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    width: '100%',
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
                  <TimerDisplay widget={widget} onUpdate={updateWidget} />
                </div>
              )}
            </WidgetShell>
          ))}

          {/* Empty state */}
          {widgets.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-white/20 text-lg font-medium select-none">
                Cliquez sur "Ajouter" pour commencer
              </p>
            </div>
          )}
        </div>

        {/* Side edit panel */}
        {selectedWidget && (
          <div className="w-64 flex-shrink-0 bg-slate-900/95 border-l border-white/10 overflow-y-auto print:hidden">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white capitalize">
                  {selectedWidget.type === 'text' ? '✏️ Texte'
                    : selectedWidget.type === 'image' ? '🖼️ Image'
                    : selectedWidget.type === 'clock' ? '🕐 Horloge'
                    : '⏱️ Minuterie'}
                </p>
                <button onClick={() => setSelectedId(null)} className="text-white/40 hover:text-white/80">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {selectedWidget.type === 'text' && (
                <TextPanel widget={selectedWidget} onChange={updateWidget} />
              )}
              {selectedWidget.type === 'image' && (
                <ImagePanel widget={selectedWidget} onChange={updateWidget} />
              )}
              {selectedWidget.type === 'clock' && (
                <ClockPanel widget={selectedWidget} onChange={updateWidget} />
              )}
              {selectedWidget.type === 'timer' && (
                <TimerPanel widget={selectedWidget} onChange={updateWidget} />
              )}

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
