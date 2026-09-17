'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Type, Image as ImageIcon, Clock, Timer, Trash2, Plus,
  Maximize2, Minimize2, X, Palette, Smile, Square,
  Pencil, Highlighter, Minus, ArrowRight, Eraser, MousePointer,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type WidgetType = 'text' | 'image' | 'clock' | 'timer' | 'emoji' | 'shape'
type DrawTool = 'select' | 'pencil' | 'highlighter' | 'line' | 'arrow' | 'eraser'
type ShapeType = 'rect' | 'circle' | 'triangle'

interface BaseWidget { id: string; type: WidgetType; x: number; y: number; w: number; h: number; zIndex: number }
interface TextWidget extends BaseWidget { type: 'text'; content: string; fontSize: number; color: string; bold: boolean; align: 'left'|'center'|'right'; bg: string }
interface ImageWidget extends BaseWidget { type: 'image'; src: string; objectFit: 'contain'|'cover' }
interface ClockWidget extends BaseWidget { type: 'clock'; color: string; showSeconds: boolean }
interface TimerWidget extends BaseWidget { type: 'timer'; duration: number; color: string }
interface EmojiWidget extends BaseWidget { type: 'emoji'; emoji: string; fontSize: number }
interface ShapeWidget extends BaseWidget { type: 'shape'; shape: ShapeType; fill: string; stroke: string; strokeWidth: number; opacity: number }
type Widget = TextWidget | ImageWidget | ClockWidget | TimerWidget | EmojiWidget | ShapeWidget

interface DrawPath {
  id: string
  tool: 'pencil' | 'highlighter' | 'line' | 'arrow'
  points: string   // SVG path d attribute
  color: string
  width: number
  opacity: number
}

interface Background { type: 'color'|'image'; value: string }

export interface PageData {
  id: string; name: string; widgets: Widget[]
  background: Background; paths: DrawPath[]; order: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BG_PRESETS = ['#1e1b4b','#0f172a','#14532d','#7f1d1d','#1e3a5f','#ffffff','#fafaf7','#f0fdf4','#fef3c7','#fdf2f8']

const WALLPAPERS = [
  { label: 'Galaxie',         url: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=200&q=70' },
  { label: 'Aurore boréale',  url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&q=70' },
  { label: 'Forêt',           url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=70' },
  { label: 'Océan',           url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=200&q=70' },
  { label: 'Montagne',        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=70' },
  { label: 'Coucher de soleil',url:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=200&q=70' },
  { label: 'Tableau noir',    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=200&q=70' },
  { label: 'Bois',            url: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=200&q=70' },
  { label: 'Nuages',          url: 'https://images.unsplash.com/photo-1468276311594-df7cb65d8df6?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1468276311594-df7cb65d8df6?w=200&q=70' },
  { label: 'Automne',         url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=70' },
  { label: 'Abstrait bleu',   url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&q=70' },
  { label: 'Aquarelle',       url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1920&q=80', thumb: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=200&q=70' },
]

const TEXT_COLORS = ['#ffffff','#f1f5f9','#fde68a','#86efac','#93c5fd','#f9a8d4','#000000','#1e293b']
const DRAW_COLORS = ['#ffffff','#fde68a','#86efac','#f87171','#93c5fd','#f9a8d4','#000000','#fb923c']
const FONT_SIZES = [18,24,32,48,64,80,96,128]

const EMOJI_LIST = [
  '😀','😂','😍','🤔','😎','🥳','👍','👎','❤️','🔥','⭐','✅','❌','💡','📚','✏️',
  '🎯','🏆','🎉','🎨','🎵','📝','🔔','⏰','📌','💬','🤝','👀','💪','🧠','🌟','🚀',
  '🌈','☀️','🌙','⚡','🌊','🍎','🐱','🐶','🦋','🌸','🌿','🍀','🎸','🎭','🏫','✨',
]

const SHAPE_COLORS = ['#ffffff','#fde68a','#86efac','#f87171','#93c5fd','#f9a8d4','#fb923c','transparent']

function uid() { return Math.random().toString(36).slice(2, 10) }

// ── Clock ─────────────────────────────────────────────────────────────────────

function ClockDisplay({ widget }: { widget: ClockWidget }) {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])
  const h = time.getHours().toString().padStart(2,'0')
  const m = time.getMinutes().toString().padStart(2,'0')
  const s = time.getSeconds().toString().padStart(2,'0')
  return (
    <div className="flex items-center justify-center h-full select-none"
      style={{ color: widget.color, fontFamily: 'monospace' }}>
      <span className="font-bold tabular-nums drop-shadow-lg"
        style={{ fontSize: widget.showSeconds ? 'min(18cqw, 45cqh)' : 'min(24cqw, 50cqh)' }}>
        {h}:{m}{widget.showSeconds ? `:${s}` : ''}
      </span>
    </div>
  )
}

// ── Timer ─────────────────────────────────────────────────────────────────────

function TimerDisplay({ widget }: { widget: TimerWidget }) {
  const [remaining, setRemaining] = useState(widget.duration)
  const [running, setRunning] = useState(false)
  const ref = useRef<ReturnType<typeof setInterval>|null>(null)
  useEffect(() => { setRemaining(widget.duration) }, [widget.duration])
  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setRemaining(r => { if (r <= 1) { setRunning(false); clearInterval(ref.current!); return 0 } return r - 1 }), 1000)
    } else { if (ref.current) clearInterval(ref.current) }
    return () => { if (ref.current) clearInterval(ref.current) }
  }, [running])
  const mm = Math.floor(remaining / 60).toString().padStart(2,'0')
  const ss = (remaining % 60).toString().padStart(2,'0')
  const pct = widget.duration > 0 ? remaining / widget.duration : 0
  const color = remaining === 0 ? '#ef4444' : pct < 0.2 ? '#f97316' : widget.color
  return (
    <div className="flex flex-col items-center justify-center h-full gap-[8cqh] select-none" style={{ color, containerType: 'size' as never }}>
      <span className="font-bold tabular-nums drop-shadow-lg" style={{ fontFamily: 'monospace', fontSize: 'min(24cqw, 50cqh)' }}>{mm}:{ss}</span>
      <div className="flex gap-2" style={{ fontSize: 'min(4cqw, 10cqh)' }}>
        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setRunning(r => !r) }}
          className="rounded-lg bg-white/20 hover:bg-white/30 px-[1.5em] py-[0.4em] font-bold backdrop-blur-sm transition-colors">
          {running ? 'Pause' : remaining === 0 ? 'Reset' : 'Start'}
        </button>
        {(running || remaining === 0) && (
          <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setRunning(false); setRemaining(widget.duration) }}
            className="rounded-lg bg-white/20 hover:bg-white/30 px-[1em] py-[0.4em] font-bold backdrop-blur-sm transition-colors">↺</button>
        )}
      </div>
    </div>
  )
}

// ── Widget shell ──────────────────────────────────────────────────────────────

interface ShellProps {
  widget: Widget; selected: boolean; drawMode: boolean
  onSelect: () => void; onMove: (x:number,y:number)=>void
  onResize: (w:number,h:number)=>void; onDelete: ()=>void
  children: React.ReactNode; canvasRef: React.RefObject<HTMLDivElement|null>
}

function WidgetShell({ widget, selected, drawMode, onSelect, onMove, onResize, onDelete, children, canvasRef }: ShellProps) {
  const drag = useRef<{sx:number;sy:number;ox:number;oy:number}|null>(null)
  const resize = useRef<{sx:number;sy:number;ow:number;oh:number}|null>(null)

  const handleDragStart = (e: React.MouseEvent) => {
    if (drawMode) return
    e.stopPropagation(); onSelect()
    drag.current = { sx: e.clientX, sy: e.clientY, ox: widget.x, oy: widget.y }
    const move = (ev: MouseEvent) => {
      if (!drag.current || !canvasRef.current) return
      const r = canvasRef.current.getBoundingClientRect()
      onMove(Math.max(0,Math.min(95,drag.current.ox+(ev.clientX-drag.current.sx)/r.width*100)),
             Math.max(0,Math.min(95,drag.current.oy+(ev.clientY-drag.current.sy)/r.height*100)))
    }
    const up = () => { drag.current=null; window.removeEventListener('mousemove',move); window.removeEventListener('mouseup',up) }
    window.addEventListener('mousemove',move); window.addEventListener('mouseup',up)
  }
  const handleResizeStart = (e: React.MouseEvent) => {
    if (drawMode) return
    e.stopPropagation()
    resize.current = { sx: e.clientX, sy: e.clientY, ow: widget.w, oh: widget.h }
    const move = (ev: MouseEvent) => {
      if (!resize.current || !canvasRef.current) return
      const r = canvasRef.current.getBoundingClientRect()
      onResize(Math.max(5,resize.current.ow+(ev.clientX-resize.current.sx)/r.width*100),
               Math.max(3,resize.current.oh+(ev.clientY-resize.current.sy)/r.height*100))
    }
    const up = () => { resize.current=null; window.removeEventListener('mousemove',move); window.removeEventListener('mouseup',up) }
    window.addEventListener('mousemove',move); window.addEventListener('mouseup',up)
  }

  return (
    <div onMouseDown={handleDragStart} onClick={e => e.stopPropagation()}
      style={{ position:'absolute', left:`${widget.x}%`, top:`${widget.y}%`, width:`${widget.w}%`, height:`${widget.h}%`, zIndex: widget.zIndex, cursor: drawMode ? 'crosshair' : 'grab', userSelect:'none' }}
      className={`group rounded-xl overflow-hidden transition-shadow ${selected && !drawMode ? 'ring-2 ring-white/70 shadow-2xl' : !drawMode ? 'hover:ring-1 hover:ring-white/30' : ''}`}>
      {children}
      {selected && !drawMode && (
        <button onMouseDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onDelete()}}
          className="absolute top-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow transition-opacity">
          <X className="h-3 w-3"/>
        </button>
      )}
      {!drawMode && (
        <div onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 h-5 w-5 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background:'radial-gradient(circle at bottom right, rgba(255,255,255,0.5) 30%, transparent 70%)' }}/>
      )}
    </div>
  )
}

// ── Edit panels ────────────────────────────────────────────────────────────────

function TextPanel({ widget, onChange }: { widget: TextWidget; onChange: (w:TextWidget)=>void }) {
  return (
    <div className="space-y-3">
      <textarea value={widget.content} onChange={e=>onChange({...widget,content:e.target.value})}
        rows={3} placeholder="Votre texte..."
        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none resize-none"/>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-white/50 mb-1">Taille</p>
          <select value={widget.fontSize} onChange={e=>onChange({...widget,fontSize:Number(e.target.value)})}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white focus:outline-none">
            {FONT_SIZES.map(s=><option key={s} value={s} className="bg-slate-800">{s}px</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs text-white/50 mb-1">Alignement</p>
          <div className="flex gap-1">
            {(['left','center','right'] as const).map(a=>(
              <button key={a} onClick={()=>onChange({...widget,align:a})}
                className={`flex-1 rounded-lg py-1.5 text-xs transition-colors ${widget.align===a?'bg-white/30 text-white':'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                {a==='left'?'⬅':a==='center'?'⬛':'➡'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs text-white/50 mb-1">Couleur</p>
        <div className="flex gap-1.5 flex-wrap">
          {TEXT_COLORS.map(c=>(
            <button key={c} onClick={()=>onChange({...widget,color:c})}
              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${widget.color===c?'border-white scale-110':'border-transparent'}`}
              style={{backgroundColor:c}}/>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={()=>onChange({...widget,bold:!widget.bold})}
          className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${widget.bold?'bg-white/30 text-white':'bg-white/10 text-white/60 hover:bg-white/20'}`}>G</button>
        <div className="flex-1">
          <p className="text-xs text-white/50 mb-1">Fond</p>
          <div className="flex items-center gap-2">
            <input type="color" value={widget.bg==='transparent'?'#000000':widget.bg.slice(0,7)}
              onChange={e=>onChange({...widget,bg:e.target.value+'99'})}
              className="h-6 w-10 rounded cursor-pointer border-0 bg-transparent"/>
            <button onClick={()=>onChange({...widget,bg:'transparent'})} className="text-xs text-white/50 hover:text-white/80">Aucun</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmojiPanel({ widget, onChange }: { widget: EmojiWidget; onChange: (w:EmojiWidget)=>void }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-white/50 mb-1">Taille</p>
        <select value={widget.fontSize} onChange={e=>onChange({...widget,fontSize:Number(e.target.value)})}
          className="w-full rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white focus:outline-none">
          {[32,48,64,80,96,128,160,200].map(s=><option key={s} value={s} className="bg-slate-800">{s}px</option>)}
        </select>
      </div>
      <div>
        <p className="text-xs text-white/50 mb-2">Choisir un emoji</p>
        <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
          {EMOJI_LIST.map(e=>(
            <button key={e} onClick={()=>onChange({...widget,emoji:e})}
              className={`text-xl rounded-lg p-0.5 transition-all hover:scale-110 ${widget.emoji===e?'bg-white/20 scale-110':''}`}>
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ShapePanel({ widget, onChange }: { widget: ShapeWidget; onChange: (w:ShapeWidget)=>void }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-white/50 mb-1">Forme</p>
        <div className="flex gap-2">
          {([['rect','▭'],['circle','◯'],['triangle','△']] as [ShapeType,string][]).map(([s,icon])=>(
            <button key={s} onClick={()=>onChange({...widget,shape:s})}
              className={`flex-1 rounded-lg py-2 text-lg transition-colors ${widget.shape===s?'bg-white/30':'bg-white/10 hover:bg-white/20'}`}>{icon}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-white/50 mb-1">Remplissage</p>
        <div className="flex gap-1.5 flex-wrap">
          {SHAPE_COLORS.map(c=>(
            <button key={c} onClick={()=>onChange({...widget,fill:c})}
              className={`h-6 w-6 rounded-lg border-2 transition-transform hover:scale-110 ${widget.fill===c?'border-white scale-110':'border-white/20'}`}
              style={{backgroundColor:c==='transparent'?'transparent':c}}>
              {c==='transparent' && <span className="text-white/50 text-xs">∅</span>}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-white/50 mb-1">Bordure</p>
        <div className="flex gap-1.5 flex-wrap">
          {SHAPE_COLORS.map(c=>(
            <button key={c} onClick={()=>onChange({...widget,stroke:c})}
              className={`h-6 w-6 rounded-lg border-2 transition-transform hover:scale-110 ${widget.stroke===c?'border-white scale-110':'border-white/20'}`}
              style={{backgroundColor:c==='transparent'?'transparent':c}}>
              {c==='transparent' && <span className="text-white/50 text-xs">∅</span>}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-white/50 mb-1">Épaisseur bordure: {widget.strokeWidth}px</p>
        <input type="range" min={0} max={12} value={widget.strokeWidth} onChange={e=>onChange({...widget,strokeWidth:Number(e.target.value)})}
          className="w-full accent-white"/>
      </div>
      <div>
        <p className="text-xs text-white/50 mb-1">Opacité: {Math.round(widget.opacity*100)}%</p>
        <input type="range" min={10} max={100} value={Math.round(widget.opacity*100)} onChange={e=>onChange({...widget,opacity:Number(e.target.value)/100})}
          className="w-full accent-white"/>
      </div>
    </div>
  )
}

function ImagePanel({ widget, onChange }: { widget: ImageWidget; onChange: (w:ImageWidget)=>void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onChange({...widget,src:ev.target?.result as string})
    reader.readAsDataURL(file)
  }
  return (
    <div className="space-y-3">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
      <button onClick={()=>fileRef.current?.click()}
        className="w-full rounded-lg border border-dashed border-white/30 py-3 text-sm text-white/70 hover:border-white/60 hover:text-white transition-colors">
        Choisir une image
      </button>
      <div>
        <p className="text-xs text-white/50 mb-1">Affichage</p>
        <div className="flex gap-2">
          {(['contain','cover'] as const).map(fit=>(
            <button key={fit} onClick={()=>onChange({...widget,objectFit:fit})}
              className={`flex-1 rounded-lg py-1.5 text-xs transition-colors ${widget.objectFit===fit?'bg-white/30 text-white':'bg-white/10 text-white/60 hover:bg-white/20'}`}>
              {fit==='contain'?'Contenu':'Remplir'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ClockPanel({ widget, onChange }: { widget: ClockWidget; onChange: (w:ClockWidget)=>void }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-white/50 mb-1">Couleur</p>
        <div className="flex gap-1.5 flex-wrap">
          {TEXT_COLORS.map(c=>(
            <button key={c} onClick={()=>onChange({...widget,color:c})}
              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${widget.color===c?'border-white scale-110':'border-transparent'}`}
              style={{backgroundColor:c}}/>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={widget.showSeconds} onChange={e=>onChange({...widget,showSeconds:e.target.checked})} className="rounded"/>
        <span className="text-sm text-white/80">Afficher les secondes</span>
      </label>
    </div>
  )
}

function TimerPanel({ widget, onChange }: { widget: TimerWidget; onChange: (w:TimerWidget)=>void }) {
  const [min, setMin] = useState(Math.floor(widget.duration/60).toString())
  const [sec, setSec] = useState((widget.duration%60).toString().padStart(2,'0'))
  const apply = () => onChange({...widget,duration:(parseInt(min)||0)*60+(parseInt(sec)||0)})
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-white/50 mb-1">Durée</p>
        <div className="flex items-center gap-2">
          <input value={min} onChange={e=>setMin(e.target.value)} onBlur={apply} type="number" min="0" max="99"
            className="w-16 rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white text-center focus:outline-none"/>
          <span className="text-white/60 font-bold">:</span>
          <input value={sec} onChange={e=>setSec(e.target.value)} onBlur={apply} type="number" min="0" max="59"
            className="w-16 rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white text-center focus:outline-none"/>
        </div>
      </div>
      <div>
        <p className="text-xs text-white/50 mb-1">Couleur</p>
        <div className="flex gap-1.5 flex-wrap">
          {TEXT_COLORS.map(c=>(
            <button key={c} onClick={()=>onChange({...widget,color:c})}
              className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${widget.color===c?'border-white scale-110':'border-transparent'}`}
              style={{backgroundColor:c}}/>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Shape SVG renderer ─────────────────────────────────────────────────────────

function ShapeRenderer({ widget }: { widget: ShapeWidget }) {
  const { shape, fill, stroke, strokeWidth, opacity } = widget
  const f = fill === 'transparent' ? 'none' : fill
  const s = stroke === 'transparent' ? 'none' : stroke
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" style={{ opacity }}>
      {shape === 'rect' && <rect x={strokeWidth/2} y={strokeWidth/2} width={100-strokeWidth} height={100-strokeWidth} fill={f} stroke={s} strokeWidth={strokeWidth} rx="4"/>}
      {shape === 'circle' && <ellipse cx="50" cy="50" rx={50-strokeWidth/2} ry={50-strokeWidth/2} fill={f} stroke={s} strokeWidth={strokeWidth}/>}
      {shape === 'triangle' && <polygon points={`50,${strokeWidth} ${100-strokeWidth},${100-strokeWidth} ${strokeWidth},${100-strokeWidth}`} fill={f} stroke={s} strokeWidth={strokeWidth}/>}
    </svg>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface Props { initialPages: PageData[] }

export default function WhiteboardCanvas({ initialPages }: Props) {
  const [pages, setPages] = useState<PageData[]>(initialPages.map(p => ({ ...p, paths: (p as PageData & { paths?: DrawPath[] }).paths ?? [] })))
  const [activePageId, setActivePageId] = useState<string>(initialPages[0]?.id ?? '')
  const [selectedId, setSelectedId] = useState<string|null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [showBgPanel, setShowBgPanel] = useState(false)
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [renamingPageId, setRenamingPageId] = useState<string|null>(null)
  const [renameValue, setRenameValue] = useState('')
  // Draw state
  const [drawTool, setDrawTool] = useState<DrawTool>('select')
  const [drawColor, setDrawColor] = useState('#ffffff')
  const [drawWidth, setDrawWidth] = useState(3)
  const [showDrawPanel, setShowDrawPanel] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const currentPath = useRef<{id:string;points:{x:number;y:number}[];startX?:number;startY?:number}|null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout>|null>(null)

  const activePage = pages.find(p => p.id === activePageId) ?? pages[0]
  const drawMode = drawTool !== 'select'

  const scheduleSave = useCallback((pageId: string, widgets: Widget[], background: Background, paths: DrawPath[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      await fetch(`/api/whiteboard-pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets, background, paths }),
      })
      setSaving(false)
    }, 1500)
  }, [])

  const updateActivePage = (patch: Partial<PageData>) => {
    if (!activePage) return
    const next = pages.map(p => p.id === activePage.id ? { ...p, ...patch } : p)
    setPages(next)
    const updated = next.find(p => p.id === activePage.id)!
    scheduleSave(activePage.id, updated.widgets, updated.background, updated.paths)
  }

  // ── Widgets ────────────────────────────────────────────────────────────────

  const addWidget = (type: WidgetType, extraEmoji?: string) => {
    if (!activePage) return
    const maxZ = activePage.widgets.reduce((m,w) => Math.max(m,w.zIndex), 0)
    let w: Widget
    if (type === 'text') w = { id:uid(),type,x:20,y:30,w:40,h:20,zIndex:maxZ+1,content:'Votre texte ici',fontSize:48,color:'#ffffff',bold:false,align:'center',bg:'transparent' }
    else if (type === 'image') w = { id:uid(),type,x:25,y:25,w:50,h:50,zIndex:maxZ+1,src:'',objectFit:'contain' }
    else if (type === 'clock') w = { id:uid(),type,x:5,y:5,w:20,h:15,zIndex:maxZ+1,color:'#ffffff',showSeconds:true }
    else if (type === 'timer') w = { id:uid(),type,x:35,y:35,w:30,h:25,zIndex:maxZ+1,color:'#ffffff',duration:300 }
    else if (type === 'emoji') w = { id:uid(),type,x:30,y:30,w:15,h:15,zIndex:maxZ+1,emoji:extraEmoji??'😀',fontSize:80 }
    else w = { id:uid(),type:'shape',x:20,y:20,w:30,h:30,zIndex:maxZ+1,shape:'rect',fill:'#93c5fd',stroke:'#ffffff',strokeWidth:2,opacity:1 }
    updateActivePage({ widgets: [...activePage.widgets, w] })
    setSelectedId(w.id)
    setShowAddPanel(false); setShowEmojiPicker(false)
  }

  const moveWidget = (id:string,x:number,y:number) => { if (!activePage) return; updateActivePage({widgets:activePage.widgets.map(w=>w.id===id?{...w,x,y}:w)}) }
  const resizeWidget = (id:string,width:number,height:number) => { if (!activePage) return; updateActivePage({widgets:activePage.widgets.map(w=>w.id===id?{...w,w:width,h:height}:w)}) }
  const deleteWidget = (id:string) => { if (!activePage) return; updateActivePage({widgets:activePage.widgets.filter(w=>w.id!==id)}); setSelectedId(null) }
  const updateWidget = (updated: Widget) => { if (!activePage) return; updateActivePage({widgets:activePage.widgets.map(w=>w.id===updated.id?updated:w)}) }

  // ── Drawing ────────────────────────────────────────────────────────────────

  const getPathBBox = (d: string): { minX: number; minY: number; maxX: number; maxY: number } => {
    const coords = d.match(/-?[\d.]+,-?[\d.]+/g) ?? []
    if (coords.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    const xs = coords.map(c => Number(c.split(',')[0]))
    const ys = coords.map(c => Number(c.split(',')[1]))
    return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) }
  }

  const getCanvasXY = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const r = canvasRef.current.getBoundingClientRect()
    return { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!drawMode) return
    if (drawTool === 'eraser') {
      if (hoveredPathId && activePage) {
        updateActivePage({ paths: (activePage.paths ?? []).filter(p => p.id !== hoveredPathId) })
        setHoveredPathId(null)
      }
      return
    }
    setSelectedPathId(null)
    const { x, y } = getCanvasXY(e)
    setIsDrawing(true)
    currentPath.current = { id: uid(), points: [{x,y}], startX: x, startY: y }
    setSelectedId(null)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    // Eraser hover highlight + drag-erase
    if (drawTool === 'eraser' && activePage) {
      const { x, y } = getCanvasXY(e)
      const threshold = 4
      const hit = (activePage.paths ?? []).find(path => {
        const coords = path.points.match(/-?[\d.]+,-?[\d.]+/g) ?? []
        return coords.some(pt => {
          const [px, py] = pt.split(',').map(Number)
          return Math.abs(px - x) < threshold && Math.abs(py - y) < threshold
        })
      })
      setHoveredPathId(hit?.id ?? null)
      // Erase while mouse button held
      if (e.buttons === 1 && hit) {
        updateActivePage({ paths: (activePage.paths ?? []).filter(p => p.id !== hit.id) })
        setHoveredPathId(null)
      }
    }
    if (!isDrawing || !currentPath.current || !activePage) return
    const { x, y } = getCanvasXY(e)
    if (drawTool === 'pencil' || drawTool === 'highlighter') {
      currentPath.current.points.push({x,y})
      // Force re-render by updating a temp path in state (we do it on mouseup instead for perf)
    }
    // For line/arrow, just update last point
    if (drawTool === 'line' || drawTool === 'arrow') {
      currentPath.current.points = [currentPath.current.points[0], {x,y}]
    }
    // Trigger SVG update via forceUpdate trick
    svgRef.current?.dispatchEvent(new Event('pathupdate'))
  }

  const [livePathD, setLivePathD] = useState('')
  const [hoveredPathId, setHoveredPathId] = useState<string|null>(null)
  const [selectedPathId, setSelectedPathId] = useState<string|null>(null)
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const handler = () => {
      if (!currentPath.current) return
      const pts = currentPath.current.points
      if (pts.length === 0) return
      if (drawTool === 'pencil' || drawTool === 'highlighter') {
        setLivePathD(pts.map((p,i)=>(i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`)).join(' '))
      } else {
        const [a,b] = [pts[0], pts[pts.length-1]]
        setLivePathD(`M${a.x},${a.y} L${b.x},${b.y}`)
      }
    }
    el.addEventListener('pathupdate', handler)
    return () => el.removeEventListener('pathupdate', handler)
  }, [drawTool])

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !currentPath.current || !activePage) { setIsDrawing(false); return }
    const { x, y } = getCanvasXY(e)
    const pts = currentPath.current.points
    if (drawTool === 'pencil' || drawTool === 'highlighter') {
      pts.push({x,y})
    } else {
      pts[pts.length > 1 ? pts.length - 1 : 0] = {x,y}
    }
    if (pts.length < 2 && (drawTool === 'line' || drawTool === 'arrow')) { setIsDrawing(false); currentPath.current = null; setLivePathD(''); return }

    let d = ''
    if (drawTool === 'pencil' || drawTool === 'highlighter') {
      d = pts.map((p,i)=>(i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`)).join(' ')
    } else {
      const [a,b] = [pts[0], pts[pts.length-1]]
      if (drawTool === 'arrow') {
        // Simple arrowhead: line + two short lines at end
        const dx = b.x-a.x, dy = b.y-a.y, len = Math.sqrt(dx*dx+dy*dy)||1
        const ux = dx/len, uy = dy/len, headLen = Math.min(4, len*0.3)
        const perp1x = -uy*headLen*0.5, perp1y = ux*headLen*0.5
        const ax = b.x-ux*headLen, ay = b.y-uy*headLen
        d = `M${a.x},${a.y} L${b.x},${b.y} M${ax+perp1x},${ay+perp1y} L${b.x},${b.y} L${ax-perp1x},${ay-perp1y}`
      } else {
        d = `M${a.x},${a.y} L${b.x},${b.y}`
      }
    }

    const newPath: DrawPath = {
      id: currentPath.current.id,
      tool: drawTool as DrawPath['tool'],
      points: d,
      color: drawColor,
      width: drawTool === 'highlighter' ? drawWidth * 4 : drawWidth,
      opacity: drawTool === 'highlighter' ? 0.4 : 1,
    }
    updateActivePage({ paths: [...(activePage.paths ?? []), newPath] })
    setIsDrawing(false)
    currentPath.current = null
    setLivePathD('')
  }

  const handleEraserClick = (e: React.MouseEvent) => {
    if (drawTool !== 'eraser' || !activePage) return
    const { x, y } = getCanvasXY(e)
    const threshold = 3
    const remaining = (activePage.paths ?? []).filter(path => {
      // Check if click is near any point in the path
      const dMatches = path.points.match(/[\d.]+,[\d.]+/g) ?? []
      return !dMatches.some(pt => {
        const [px,py] = pt.split(',').map(Number)
        return Math.abs(px-x) < threshold && Math.abs(py-y) < threshold
      })
    })
    if (remaining.length !== (activePage.paths ?? []).length) updateActivePage({ paths: remaining })
  }

  // ── Pages ──────────────────────────────────────────────────────────────────

  const addPage = async () => {
    const res = await fetch('/api/whiteboard-pages', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name:`Page ${pages.length+1}`}) })
    if (res.ok) {
      const p = await res.json()
      setPages(prev => [...prev, {...p,widgets:[],background:{type:'color',value:'#1e1b4b'},paths:[]}])
      setActivePageId(p.id); setSelectedId(null)
    }
  }

  const deletePage = async (pageId: string) => {
    if (pages.length <= 1) return
    const res = await fetch(`/api/whiteboard-pages/${pageId}`, { method:'DELETE' })
    if (res.ok) {
      const remaining = pages.filter(p => p.id !== pageId)
      setPages(remaining)
      if (activePageId === pageId) { setActivePageId(remaining[0].id); setSelectedId(null) }
    }
  }

  const startRename = (page: PageData) => { setRenamingPageId(page.id); setRenameValue(page.name) }
  const commitRename = async (pageId: string) => {
    const name = renameValue.trim() || 'Page'
    setPages(prev => prev.map(p => p.id === pageId ? {...p,name} : p))
    setRenamingPageId(null)
    await fetch(`/api/whiteboard-pages/${pageId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name}) })
  }

  // ── Background ─────────────────────────────────────────────────────────────

  const bgFileRef = useRef<HTMLInputElement>(null)
  const handleBgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => updateActivePage({background:{type:'image',value:ev.target?.result as string}})
    reader.readAsDataURL(file)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { canvasRef.current?.parentElement?.requestFullscreen(); setFullscreen(true) }
    else { document.exitFullscreen(); setFullscreen(false) }
  }
  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  const selectedWidget = activePage?.widgets.find(w => w.id === selectedId) ?? null
  const bg = activePage?.background ?? { type:'color', value:'#1e1b4b' }
  const bgStyle: React.CSSProperties = bg.type === 'color' ? { backgroundColor: bg.value }
    : { backgroundImage:`url(${bg.value})`, backgroundSize:'cover', backgroundPosition:'center' }

  if (!activePage) return null

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-950">

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/95 border-b border-white/10 flex-shrink-0"
        onClick={e=>e.stopPropagation()}>

        {/* Add widget */}
        <div className="relative">
          <button onClick={()=>{setShowAddPanel(v=>!v);setShowBgPanel(false);setShowDrawPanel(false)}}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm font-medium text-white transition-colors">
            <Plus className="h-4 w-4"/>Ajouter
          </button>
          {showAddPanel && (
            <div className="absolute top-full left-0 mt-1.5 z-50 w-48 rounded-xl bg-slate-800 border border-white/10 shadow-2xl p-1.5 space-y-0.5">
              {[
                {type:'text' as WidgetType,icon:Type,label:'Texte'},
                {type:'image' as WidgetType,icon:ImageIcon,label:'Image'},
                {type:'clock' as WidgetType,icon:Clock,label:'Horloge'},
                {type:'timer' as WidgetType,icon:Timer,label:'Minuterie'},
              ].map(item=>(
                <button key={item.type} onClick={()=>addWidget(item.type)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                  <item.icon className="h-4 w-4 text-white/60"/>{item.label}
                </button>
              ))}
              {/* Emoji */}
              <div className="relative">
                <button onClick={()=>setShowEmojiPicker(v=>!v)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                  <Smile className="h-4 w-4 text-white/60"/>Emoji
                </button>
                {showEmojiPicker && (
                  <div className="absolute left-full top-0 ml-1 z-50 w-64 rounded-xl bg-slate-700 border border-white/10 shadow-2xl p-2">
                    <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                      {EMOJI_LIST.map(e=>(
                        <button key={e} onClick={()=>addWidget('emoji',e)}
                          className="text-xl rounded-lg p-0.5 hover:bg-white/20 transition-all hover:scale-110">{e}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Forme */}
              <button onClick={()=>addWidget('shape')}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors">
                <Square className="h-4 w-4 text-white/60"/>Forme
              </button>
            </div>
          )}
        </div>

        {/* Draw tools */}
        <div className="relative">
          <button onClick={()=>{setShowDrawPanel(v=>!v);setShowAddPanel(false);setShowBgPanel(false)}}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors ${drawMode?'bg-blue-600 hover:bg-blue-500':'bg-white/10 hover:bg-white/20'}`}>
            <Pencil className="h-4 w-4"/>Dessin
          </button>
          {showDrawPanel && (
            <div className="absolute top-full left-0 mt-1.5 z-50 w-56 rounded-xl bg-slate-800 border border-white/10 shadow-2xl p-3 space-y-3">
              {/* Tools */}
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  {tool:'select',icon:MousePointer,label:'Sélection'},
                  {tool:'pencil',icon:Pencil,label:'Crayon'},
                  {tool:'highlighter',icon:Highlighter,label:'Surligneur'},
                  {tool:'line',icon:Minus,label:'Ligne'},
                  {tool:'arrow',icon:ArrowRight,label:'Flèche'},
                  {tool:'eraser',icon:Eraser,label:'Effacer'},
                ] as {tool:DrawTool;icon:React.FC<{className?:string}>;label:string}[]).map(t=>(
                  <button key={t.tool} onClick={()=>setDrawTool(t.tool)}
                    className={`flex flex-col items-center gap-1 rounded-lg py-2 text-xs transition-colors ${drawTool===t.tool?'bg-blue-600 text-white':'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                    <t.icon className="h-4 w-4"/>{t.label}
                  </button>
                ))}
              </div>
              {/* Color */}
              {drawTool !== 'select' && drawTool !== 'eraser' && (
                <>
                  <div>
                    <p className="text-xs text-white/50 mb-1.5">Couleur</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {DRAW_COLORS.map(c=>(
                        <button key={c} onClick={()=>setDrawColor(c)}
                          className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 ${drawColor===c?'border-white scale-110':'border-transparent'}`}
                          style={{backgroundColor:c}}/>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-1">Épaisseur: {drawWidth}px</p>
                    <input type="range" min={1} max={20} value={drawWidth} onChange={e=>setDrawWidth(Number(e.target.value))} className="w-full accent-white"/>
                  </div>
                </>
              )}
              {drawTool !== 'select' && activePage.paths.length > 0 && (
                <button onClick={()=>updateActivePage({paths:[]})}
                  className="w-full rounded-lg bg-red-500/20 hover:bg-red-500/30 py-1.5 text-xs text-red-300 transition-colors">
                  Effacer tout
                </button>
              )}
            </div>
          )}
        </div>

        {/* Background */}
        <div className="relative">
          <button onClick={()=>{setShowBgPanel(v=>!v);setShowAddPanel(false);setShowDrawPanel(false)}}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm font-medium text-white transition-colors">
            <Palette className="h-4 w-4"/>Fond
          </button>
          {showBgPanel && (
            <div className="absolute top-full left-0 mt-1.5 z-50 w-72 rounded-xl bg-slate-800 border border-white/10 shadow-2xl p-3 space-y-3 max-h-[70vh] overflow-y-auto">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">Fonds d'écran</p>
              <div className="grid grid-cols-3 gap-1.5">
                {WALLPAPERS.map(w=>(
                  <button key={w.url} onClick={()=>updateActivePage({background:{type:'image',value:w.url}})}
                    className={`relative rounded-lg overflow-hidden transition-all hover:scale-105 ${bg.type==='image'&&bg.value===w.url?'ring-2 ring-white':'ring-1 ring-white/10 hover:ring-white/40'}`} title={w.label}>
                    <div className="w-full" style={{paddingBottom:'56%'}}>
                      <img src={w.thumb} alt={w.label} className="absolute inset-0 w-full h-full object-cover" loading="lazy"/>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 px-1 py-0.5">
                      <span className="text-white/80 text-[9px] truncate block">{w.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="border-t border-white/10 pt-2">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Couleur unie</p>
                <div className="flex flex-wrap gap-2">
                  {BG_PRESETS.map(c=>(
                    <button key={c} onClick={()=>updateActivePage({background:{type:'color',value:c}})}
                      className={`h-7 w-7 rounded-lg border-2 transition-transform hover:scale-110 shadow-sm ${bg.type==='color'&&bg.value===c?'border-white scale-110':'border-transparent'}`}
                      style={{backgroundColor:c}}/>
                  ))}
                  <input type="color" value={bg.type==='color'?bg.value:'#1e1b4b'}
                    onChange={e=>updateActivePage({background:{type:'color',value:e.target.value}})}
                    className="h-7 w-7 rounded-lg cursor-pointer border-2 border-transparent hover:border-white/50"/>
                </div>
              </div>
              <div className="border-t border-white/10 pt-2">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">Image personnalisée</p>
                <input ref={bgFileRef} type="file" accept="image/*" className="hidden" onChange={handleBgFile}/>
                <button onClick={()=>bgFileRef.current?.click()}
                  className="w-full rounded-lg border border-dashed border-white/30 py-2 text-xs text-white/70 hover:border-white/60 hover:text-white transition-colors">
                  Choisir depuis mon ordinateur
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1"/>
        <span className="text-xs text-white/30">{saving?'Sauvegarde...':'Sauvegardé'}</span>

        <button onClick={toggleFullscreen}
          className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm font-medium text-white transition-colors">
          {fullscreen?<Minimize2 className="h-4 w-4"/>:<Maximize2 className="h-4 w-4"/>}
          {fullscreen?'Quitter':'Plein écran'}
        </button>
      </div>

      {/* Canvas + panels */}
      <div className="flex flex-1 min-h-0">

        {/* Pages panel */}
        <div className="w-36 flex-shrink-0 bg-slate-950 border-r border-white/10 flex flex-col overflow-y-auto"
          onClick={e=>e.stopPropagation()}>
          <div className="flex-1 p-2 space-y-2">
            {pages.map((page,idx)=>{
              const pgBg = page.background
              const pgBgStyle: React.CSSProperties = pgBg.type==='color'?{backgroundColor:pgBg.value}:{backgroundImage:`url(${pgBg.value})`,backgroundSize:'cover',backgroundPosition:'center'}
              const isActive = page.id === activePageId
              return (
                <div key={page.id} className="group relative">
                  <button onClick={()=>{setActivePageId(page.id);setSelectedId(null)}}
                    className={`w-full rounded-lg overflow-hidden transition-all ${isActive?'ring-2 ring-white shadow-lg':'ring-1 ring-white/10 hover:ring-white/40'}`}>
                    <div className="relative w-full" style={{paddingBottom:'56.25%',...pgBgStyle}}>
                      {page.widgets.map(w=>(
                        <div key={w.id} className="absolute rounded-sm opacity-80"
                          style={{left:`${w.x}%`,top:`${w.y}%`,width:`${w.w}%`,height:`${w.h}%`,
                            backgroundColor:w.type==='text'?(w as TextWidget).bg!=='transparent'?(w as TextWidget).bg:(w as TextWidget).color+'40':w.type==='image'?'rgba(255,255,255,0.15)':w.type==='emoji'?'transparent':'rgba(0,0,0,0.3)',
                            display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                          {w.type==='text'&&<span style={{color:(w as TextWidget).color,fontSize:'3px',lineHeight:1.2,padding:'1px',wordBreak:'break-all'}}>{(w as TextWidget).content.slice(0,20)}</span>}
                          {w.type==='image'&&(w as ImageWidget).src&&<img src={(w as ImageWidget).src} alt="" className="w-full h-full" style={{objectFit:'cover'}}/>}
                          {w.type==='emoji'&&<span style={{fontSize:'6px'}}>{(w as EmojiWidget).emoji}</span>}
                          {(w.type==='clock'||w.type==='timer')&&<span style={{color:w.type==='clock'?(w as ClockWidget).color:(w as TimerWidget).color,fontSize:'4px',fontFamily:'monospace'}}>00:00</span>}
                        </div>
                      ))}
                    </div>
                    <div className={`px-2 py-1 text-left ${isActive?'bg-white/20':'bg-black/40'}`}>
                      {renamingPageId===page.id?(
                        <input autoFocus value={renameValue} onChange={e=>setRenameValue(e.target.value)}
                          onBlur={()=>commitRename(page.id)}
                          onKeyDown={e=>{if(e.key==='Enter')commitRename(page.id);if(e.key==='Escape')setRenamingPageId(null)}}
                          onClick={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()}
                          className="w-full bg-transparent text-white text-xs focus:outline-none"/>
                      ):(
                        <span className="text-xs text-white/80 truncate block" onDoubleClick={e=>{e.stopPropagation();startRename(page)}}>{page.name}</span>
                      )}
                    </div>
                  </button>
                  {pages.length>1&&(
                    <button onClick={e=>{e.stopPropagation();deletePage(page.id)}}
                      className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 text-white/40 opacity-0 group-hover:opacity-100 hover:bg-red-500/80 hover:text-white transition-all">
                      <X className="h-2.5 w-2.5"/>
                    </button>
                  )}
                  <span className="absolute bottom-6 left-1 text-white/30 text-[9px]">{idx+1}</span>
                </div>
              )
            })}
          </div>
          <div className="p-2 border-t border-white/10">
            <button onClick={addPage}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/20 py-2 text-xs text-white/40 hover:border-white/40 hover:text-white/80 transition-colors">
              <Plus className="h-3.5 w-3.5"/>Nouvelle page
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div ref={canvasRef} className="relative flex-1 overflow-hidden"
          style={{...bgStyle, cursor: drawTool==='eraser'?'cell':drawMode?'crosshair':'default'}}
          onClick={e=>{
            setSelectedId(null); setSelectedPathId(null)
            setShowBgPanel(false); setShowAddPanel(false); setShowDrawPanel(false)
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={()=>{ if(isDrawing) setIsDrawing(false) }}>

          {/* SVG draw layer */}
          <svg ref={svgRef} className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"
            style={{ pointerEvents: drawMode ? 'all' : 'none' }}>
            {(activePage.paths ?? []).map(path => {
              const isSelected = selectedPathId === path.id
              const isHovered = hoveredPathId === path.id
              const isEraseHover = drawTool === 'eraser' && isHovered
              const bbox = isSelected ? getPathBBox(path.points) : null
              return (
                <g key={path.id}>
                  {/* Invisible thick hit area */}
                  {drawTool === 'select' && (
                    <path d={path.points} stroke="transparent" strokeWidth={3} fill="none" strokeLinecap="round"
                      style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                      onClick={e => { e.stopPropagation(); setSelectedPathId(path.id) }}
                      onMouseEnter={() => setHoveredPathId(path.id)}
                      onMouseLeave={() => setHoveredPathId(null)}/>
                  )}
                  {/* Visible path */}
                  <path d={path.points}
                    stroke={isEraseHover ? '#ef4444' : isSelected ? '#60a5fa' : isHovered && drawTool === 'select' ? '#93c5fd' : path.color}
                    strokeWidth={isEraseHover ? path.width * 0.22 : isSelected ? path.width * 0.22 : path.width * 0.15}
                    fill="none" strokeLinecap="round" strokeLinejoin="round"
                    opacity={isEraseHover ? 0.6 : path.opacity}
                    style={{ pointerEvents: 'none' }}/>
                  {/* Selection bounding box */}
                  {isSelected && bbox && (
                    <rect x={bbox.minX - 1} y={bbox.minY - 1}
                      width={bbox.maxX - bbox.minX + 2} height={bbox.maxY - bbox.minY + 2}
                      fill="none" stroke="#60a5fa" strokeWidth={0.3} strokeDasharray="1,0.5"
                      style={{ pointerEvents: 'none' }}/>
                  )}
                </g>
              )
            })}
            {/* Live preview */}
            {isDrawing && livePathD && (
              <path d={livePathD} stroke={drawColor} strokeWidth={(drawTool==='highlighter'?drawWidth*4:drawWidth)*0.15}
                fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={drawTool==='highlighter'?0.4:1}
                style={{ pointerEvents: 'none' }}/>
            )}
          </svg>

          {/* Delete button for selected path */}
          {selectedPathId && drawTool === 'select' && (() => {
            const path = (activePage.paths ?? []).find(p => p.id === selectedPathId)
            if (!path) return null
            const bbox = getPathBBox(path.points)
            return (
              <button
                style={{ position: 'absolute', left: `${bbox.maxX}%`, top: `${bbox.minY}%`, transform: 'translate(-50%, -50%)', zIndex: 50 }}
                onMouseDown={e => e.stopPropagation()}
                onClick={e => {
                  e.stopPropagation()
                  updateActivePage({ paths: (activePage.paths ?? []).filter(p => p.id !== selectedPathId) })
                  setSelectedPathId(null)
                }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors">
                <X className="h-3 w-3"/>
              </button>
            )
          })()}

          {/* Widgets */}
          {activePage.widgets.map(widget=>(
            <WidgetShell key={widget.id} widget={widget} selected={selectedId===widget.id} drawMode={drawMode}
              onSelect={()=>{setSelectedId(widget.id);setShowBgPanel(false);setShowAddPanel(false);setShowDrawPanel(false)}}
              onMove={(x,y)=>moveWidget(widget.id,x,y)}
              onResize={(w,h)=>resizeWidget(widget.id,w,h)}
              onDelete={()=>deleteWidget(widget.id)}
              canvasRef={canvasRef}>
              {widget.type==='text'&&(
                <div className="h-full w-full flex items-center justify-center rounded-xl overflow-hidden px-3 py-2" style={{backgroundColor:(widget as TextWidget).bg}}>
                  <p style={{color:(widget as TextWidget).color,fontSize:`${(widget as TextWidget).fontSize}px`,fontWeight:(widget as TextWidget).bold?700:400,textAlign:(widget as TextWidget).align,lineHeight:1.2,wordBreak:'break-word',textShadow:'0 2px 8px rgba(0,0,0,0.4)',width:'100%'}}>
                    {(widget as TextWidget).content}
                  </p>
                </div>
              )}
              {widget.type==='emoji'&&(
                <div className="h-full w-full flex items-center justify-center" style={{fontSize:`${(widget as EmojiWidget).fontSize}px`,lineHeight:1}}>
                  {(widget as EmojiWidget).emoji}
                </div>
              )}
              {widget.type==='shape'&&<ShapeRenderer widget={widget as ShapeWidget}/>}
              {widget.type==='image'&&(
                (widget as ImageWidget).src
                  ?<img src={(widget as ImageWidget).src} alt="" className="h-full w-full rounded-xl" style={{objectFit:(widget as ImageWidget).objectFit}} draggable={false}/>
                  :<div className="h-full w-full flex items-center justify-center rounded-xl border-2 border-dashed border-white/30 bg-white/5"><ImageIcon className="h-8 w-8 text-white/30"/></div>
              )}
              {widget.type==='clock'&&(
                <div className="h-full w-full bg-black/20 backdrop-blur-sm rounded-xl" style={{containerType:'size' as never}}>
                  <ClockDisplay widget={widget as ClockWidget}/>
                </div>
              )}
              {widget.type==='timer'&&(
                <div className="h-full w-full bg-black/20 backdrop-blur-sm rounded-xl" style={{containerType:'size' as never}}>
                  <TimerDisplay widget={widget as TimerWidget}/>
                </div>
              )}
            </WidgetShell>
          ))}

          {activePage.widgets.length===0&&!drawMode&&(activePage.paths??[]).length===0&&(
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-white/20 text-lg font-medium select-none">Cliquez sur "Ajouter" pour commencer</p>
            </div>
          )}
        </div>

        {/* Side edit panel */}
        {selectedWidget && !drawMode && (
          <div className="w-64 flex-shrink-0 bg-slate-900/95 border-l border-white/10 overflow-y-auto"
            onClick={e=>e.stopPropagation()}>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">
                  {selectedWidget.type==='text'?'✏️ Texte':selectedWidget.type==='image'?'🖼️ Image':selectedWidget.type==='clock'?'🕐 Horloge':selectedWidget.type==='timer'?'⏱️ Minuterie':selectedWidget.type==='emoji'?'😀 Emoji':'⬛ Forme'}
                </p>
                <button onClick={()=>setSelectedId(null)} className="text-white/40 hover:text-white/80"><X className="h-4 w-4"/></button>
              </div>
              {selectedWidget.type==='text'&&<TextPanel widget={selectedWidget as TextWidget} onChange={updateWidget}/>}
              {selectedWidget.type==='image'&&<ImagePanel widget={selectedWidget as ImageWidget} onChange={updateWidget}/>}
              {selectedWidget.type==='clock'&&<ClockPanel widget={selectedWidget as ClockWidget} onChange={updateWidget}/>}
              {selectedWidget.type==='timer'&&<TimerPanel widget={selectedWidget as TimerWidget} onChange={updateWidget}/>}
              {selectedWidget.type==='emoji'&&<EmojiPanel widget={selectedWidget as EmojiWidget} onChange={updateWidget}/>}
              {selectedWidget.type==='shape'&&<ShapePanel widget={selectedWidget as ShapeWidget} onChange={updateWidget}/>}
              <div className="border-t border-white/10 pt-3">
                <button onClick={()=>deleteWidget(selectedWidget.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 py-2 text-sm text-red-300 transition-colors">
                  <Trash2 className="h-4 w-4"/>Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
