'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Timer, Users, Projector, Play, Pause, RotateCcw, Shuffle,
  X, Maximize2, ChevronUp, ChevronDown, Volume2, Dices,
  RefreshCw, Monitor, Copy, Check, BarChart2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WEEK_COLORS } from '@/lib/constants'
import Link from 'next/link'

// ─── Minuterie ────────────────────────────────────────────────────────────────

function Minuterie() {
  const [totalSeconds, setTotalSeconds] = useState(300)
  const [remaining, setRemaining] = useState(300)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) { clearInterval(intervalRef.current!); setRunning(false); setFinished(true); return 0 }
          return r - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const reset = () => { setRunning(false); setFinished(false); setRemaining(totalSeconds) }
  const setPreset = (secs: number) => { setRunning(false); setFinished(false); setTotalSeconds(secs); setRemaining(secs) }
  const adjustTime = (delta: number) => {
    const next = Math.max(60, totalSeconds + delta)
    setRunning(false); setFinished(false); setTotalSeconds(next); setRemaining(next)
  }

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const pct = totalSeconds > 0 ? remaining / totalSeconds : 1
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDash = circumference * pct
  const color = finished ? '#ef4444' : pct > 0.33 ? '#2563eb' : pct > 0.1 ? '#f59e0b' : '#ef4444'

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 text-blue-600" />
        <h2 className="font-semibold text-stone-900">Minuterie</h2>
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <svg width="128" height="128" className="-rotate-90">
            <circle cx="64" cy="64" r={radius} fill="none" stroke="#e7e5e4" strokeWidth="8" />
            <circle cx="64" cy="64" r={radius} fill="none" stroke={color} strokeWidth="8"
              strokeDasharray={`${strokeDash} ${circumference}`} strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.5s ease' }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold tabular-nums ${finished ? 'text-red-500 animate-pulse' : 'text-stone-900'}`}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </div>
        </div>
        {!running && (
          <div className="flex items-center gap-3">
            <button onClick={() => adjustTime(-60)} className="rounded-full p-1.5 hover:bg-stone-100 text-stone-500"><ChevronDown className="h-4 w-4" /></button>
            <span className="text-sm text-stone-500">{Math.floor(totalSeconds / 60)}:{String(totalSeconds % 60).padStart(2, '0')}</span>
            <button onClick={() => adjustTime(60)} className="rounded-full p-1.5 hover:bg-stone-100 text-stone-500"><ChevronUp className="h-4 w-4" /></button>
          </div>
        )}
        <div className="flex gap-2 flex-wrap justify-center">
          {[1, 2, 3, 5, 10, 15, 20].map(m => (
            <button key={m} onClick={() => setPreset(m * 60)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${totalSeconds === m * 60 && !running ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {m} min
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => { setFinished(false); setRunning(r => !r) }} className="gap-1.5 bg-blue-600 hover:bg-blue-700 w-24">
            {running ? <><Pause className="h-3.5 w-3.5" />Pause</> : <><Play className="h-3.5 w-3.5" />Démarrer</>}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}><RotateCcw className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    </div>
  )
}

// ─── Sélecteur d'élève ────────────────────────────────────────────────────────

function SelecteurEleve() {
  const [input, setInput] = useState('')
  const [names, setNames] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [spinning, setSpinning] = useState(false)

  const addNames = () => {
    const newNames = input.split(/[\n,;]+/).map(n => n.trim()).filter(n => n.length > 0)
    setNames(prev => [...new Set([...prev, ...newNames])])
    setInput('')
  }

  const pick = useCallback(() => {
    if (names.length === 0) return
    setSpinning(true); setSelected(null)
    let count = 0
    const interval = setInterval(() => {
      setSelected(names[Math.floor(Math.random() * names.length)])
      if (++count >= 15) { clearInterval(interval); setSpinning(false) }
    }, 80)
  }, [names])

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-blue-600" />
        <h2 className="font-semibold text-stone-900">Sélecteur d&apos;élève</h2>
      </div>
      {(selected || spinning) && (
        <div className={`rounded-xl bg-blue-50 border-2 border-blue-200 p-6 text-center ${spinning ? 'opacity-70' : ''}`}>
          <p className="text-3xl font-bold text-blue-700">{selected}</p>
          {!spinning && <p className="text-sm text-blue-500 mt-1">a été sélectionné·e!</p>}
        </div>
      )}
      <div className="space-y-2">
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNames() } }}
          placeholder="Un nom par ligne..." rows={3}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none" />
        <Button size="sm" variant="outline" onClick={addNames} className="w-full">Ajouter</Button>
      </div>
      {names.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-stone-500">{names.length} élève{names.length > 1 ? 's' : ''}</p>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {names.map(name => (
              <span key={name} className="flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-700">
                {name}
                <button onClick={() => setNames(p => p.filter(n => n !== name))} className="text-stone-400 hover:text-red-500 ml-0.5"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>
      )}
      <Button onClick={pick} disabled={names.length === 0 || spinning} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
        <Shuffle className="h-4 w-4" />{spinning ? 'Sélection...' : 'Choisir un élève'}
      </Button>
    </div>
  )
}

// ─── Niveau de bruit ──────────────────────────────────────────────────────────

function NiveauBruit() {
  const [active, setActive] = useState(false)
  const [level, setLevel] = useState(0)
  const [denied, setDenied] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const animRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser
      setActive(true)
      const data = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteFrequencyData(data)
        const avg = data.reduce((a, b) => a + b, 0) / data.length
        setLevel(Math.min(100, (avg / 128) * 100 * 2))
        animRef.current = requestAnimationFrame(tick)
      }
      animRef.current = requestAnimationFrame(tick)
    } catch {
      setDenied(true)
    }
  }

  const stop = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    setActive(false); setLevel(0)
  }

  useEffect(() => () => stop(), [])

  const emoji = level < 30 ? '🤫' : level < 65 ? '🙂' : '📢'
  const segments = 20

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-blue-600" />
        <h2 className="font-semibold text-stone-900">Niveau de bruit</h2>
      </div>
      {denied ? (
        <p className="text-sm text-red-500 text-center py-4">Accès au microphone refusé. Vérifiez les permissions du navigateur.</p>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl">{active ? emoji : '🎤'}</div>
          <div className="flex gap-1 items-end h-16">
            {Array.from({ length: segments }).map((_, i) => {
              const threshold = ((i + 1) / segments) * 100
              const lit = active && level >= threshold
              const color = i < segments * 0.5 ? (lit ? '#22c55e' : '#dcfce7') : i < segments * 0.75 ? (lit ? '#f59e0b' : '#fef9c3') : (lit ? '#ef4444' : '#fee2e2')
              return <div key={i} className="w-3 rounded-sm transition-colors" style={{ height: `${40 + i * 2}px`, backgroundColor: color }} />
            })}
          </div>
          <Button size="sm" onClick={active ? stop : start} className={`w-full gap-2 ${active ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {active ? <><Pause className="h-3.5 w-3.5" />Arrêter</> : <><Play className="h-3.5 w-3.5" />Démarrer</>}
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Dés ──────────────────────────────────────────────────────────────────────

const DIE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

function Des() {
  const [count, setCount] = useState(2)
  const [values, setValues] = useState<number[]>([1, 1])
  const [rolling, setRolling] = useState(false)

  const roll = () => {
    setRolling(true)
    let ticks = 0
    const interval = setInterval(() => {
      setValues(Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1))
      if (++ticks >= 8) { clearInterval(interval); setRolling(false) }
    }, 80)
  }

  const updateCount = (n: number) => {
    setCount(n)
    setValues(Array.from({ length: n }, () => Math.floor(Math.random() * 6) + 1))
  }

  const total = values.reduce((a, b) => a + b, 0)

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Dices className="h-4 w-4 text-blue-600" />
        <h2 className="font-semibold text-stone-900">Dés</h2>
      </div>
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map(n => (
          <button key={n} onClick={() => updateCount(n)}
            className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${count === n ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
            {n}
          </button>
        ))}
        <span className="text-xs text-stone-400 ml-1">dé{count > 1 ? 's' : ''}</span>
      </div>
      <div className={`flex justify-center gap-3 flex-wrap ${rolling ? 'animate-bounce' : ''}`}>
        {values.slice(0, count).map((v, i) => (
          <span key={i} className="text-5xl select-none">{DIE_FACES[v - 1]}</span>
        ))}
      </div>
      {count > 1 && <p className="text-center text-lg font-bold text-stone-700">Total : {total}</p>}
      <Button onClick={roll} disabled={rolling} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
        <Dices className="h-4 w-4" />{rolling ? 'Lancement...' : 'Lancer'}
      </Button>
    </div>
  )
}

// ─── Roue de la chance ────────────────────────────────────────────────────────

const WHEEL_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d']

function RoueChance() {
  const [input, setInput] = useState('')
  const [names, setNames] = useState<string[]>([])
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)

  const addNames = () => {
    const newNames = input.split(/[\n,;]+/).map(n => n.trim()).filter(n => n.length > 0)
    setNames(prev => [...new Set([...prev, ...newNames])])
    setInput('')
  }

  const spin = () => {
    if (names.length === 0 || spinning) return
    setWinner(null)
    setSpinning(true)
    const extraSpins = 5 + Math.random() * 5
    const finalAngle = rotation + extraSpins * 360 + Math.random() * 360
    setRotation(finalAngle)
    setTimeout(() => {
      const normalized = ((finalAngle % 360) + 360) % 360
      const segAngle = 360 / names.length
      const idx = Math.floor(((360 - normalized) % 360) / segAngle) % names.length
      setWinner(names[idx])
      setSpinning(false)
    }, 3500)
  }

  const conicGradient = names.length > 0
    ? names.map((_, i) => {
        const start = (i / names.length) * 100
        const end = ((i + 1) / names.length) * 100
        return `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${start}% ${end}%`
      }).join(', ')
    : '#e7e5e4 0% 100%'

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4 text-blue-600" />
        <h2 className="font-semibold text-stone-900">Roue de la chance</h2>
      </div>
      {winner && (
        <div className="rounded-xl bg-yellow-50 border-2 border-yellow-300 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">🎉 {winner}</p>
        </div>
      )}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-40 h-40">
          <div className="w-40 h-40 rounded-full" style={{
            background: `conic-gradient(${conicGradient})`,
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3.5s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none',
          }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white border-2 border-stone-300 shadow" />
          </div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xl">▼</div>
        </div>
        <div className="w-full space-y-2">
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNames() } }}
            placeholder="Un nom par ligne..." rows={2}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none" />
          <Button size="sm" variant="outline" onClick={addNames} className="w-full">Ajouter</Button>
        </div>
        {names.length > 0 && (
          <div className="flex flex-wrap gap-1 w-full">
            {names.map(n => (
              <span key={n} className="flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
                {n}<button onClick={() => setNames(p => p.filter(x => x !== n))} className="text-stone-400 hover:text-red-500"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
        <Button onClick={spin} disabled={names.length < 2 || spinning} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
          <RefreshCw className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
          {spinning ? 'En cours...' : 'Tourner'}
        </Button>
      </div>
    </div>
  )
}

// ─── Affichage consignes ──────────────────────────────────────────────────────

function AffichageConsignes() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  const goFullscreen = () => {
    previewRef.current?.requestFullscreen().catch(() => {})
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Monitor className="h-4 w-4 text-blue-600" />
        <h2 className="font-semibold text-stone-900">Affichage consignes</h2>
      </div>
      <div className="space-y-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre..."
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Consignes..." rows={3}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none" />
      </div>
      <div ref={previewRef} className="rounded-xl p-5 min-h-[100px] flex flex-col justify-center"
        style={{ backgroundColor: '#1e3a5f' }}>
        {title && <p className="text-white text-xl font-bold mb-2">{title}</p>}
        {body && <p className="text-blue-100 text-sm whitespace-pre-line">{body}</p>}
        {!title && !body && <p className="text-blue-300 text-sm text-center">Aperçu du tableau</p>}
      </div>
      <Button onClick={goFullscreen} disabled={!title && !body} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
        <Maximize2 className="h-4 w-4" />Afficher en plein écran
      </Button>
    </div>
  )
}

// ─── Générateur de groupes ────────────────────────────────────────────────────

function GenerateurGroupes() {
  const [input, setInput] = useState('')
  const [names, setNames] = useState<string[]>([])
  const [groupCount, setGroupCount] = useState(3)
  const [groups, setGroups] = useState<string[][]>([])

  const addNames = () => {
    const newNames = input.split(/[\n,;]+/).map(n => n.trim()).filter(n => n.length > 0)
    setNames(prev => [...new Set([...prev, ...newNames])])
    setInput('')
  }

  const generate = () => {
    const shuffled = [...names].sort(() => Math.random() - 0.5)
    const result: string[][] = Array.from({ length: groupCount }, () => [])
    shuffled.forEach((name, i) => result[i % groupCount].push(name))
    setGroups(result)
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-blue-600" />
        <h2 className="font-semibold text-stone-900">Générateur de groupes</h2>
      </div>
      <div className="space-y-2">
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNames() } }}
          placeholder="Un nom par ligne..." rows={3}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none" />
        <Button size="sm" variant="outline" onClick={addNames} className="w-full">Ajouter</Button>
      </div>
      {names.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {names.map(n => (
            <span key={n} className="flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
              {n}<button onClick={() => setNames(p => p.filter(x => x !== n))} className="text-stone-400 hover:text-red-500"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3">
        <label className="text-sm text-stone-600 shrink-0">Nombre de groupes :</label>
        <div className="flex gap-1">
          {[2, 3, 4, 5, 6].map(n => (
            <button key={n} onClick={() => setGroupCount(n)}
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${groupCount === n ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {n}
            </button>
          ))}
        </div>
      </div>
      {groups.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {groups.map((g, i) => (
            <div key={i} className="rounded-lg p-3" style={{ backgroundColor: WEEK_COLORS[i % WEEK_COLORS.length] }}>
              <p className="text-xs font-bold text-stone-600 mb-1">Groupe {i + 1}</p>
              {g.map(name => <p key={name} className="text-sm text-stone-800">{name}</p>)}
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={generate} disabled={names.length < 2} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
          <Shuffle className="h-4 w-4" />{groups.length > 0 ? 'Regénérer' : 'Générer les groupes'}
        </Button>
      </div>
    </div>
  )
}

// ─── Sondage rapide ───────────────────────────────────────────────────────────

interface PollData { id: string; question: string; options: string[]; votes: number[] }

function SondageRapide() {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [poll, setPoll] = useState<PollData | null>(null)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState(false)
  const pollUrl = poll ? `${typeof window !== 'undefined' ? window.location.origin : ''}/sondage/${poll.id}` : ''

  useEffect(() => {
    if (!poll) return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/sondage/${poll.id}`)
      if (res.ok) setPoll(await res.json())
    }, 3000)
    return () => clearInterval(interval)
  }, [poll?.id])

  const createPoll = async () => {
    const validOptions = options.filter(o => o.trim())
    if (!question.trim() || validOptions.length < 2) return
    setCreating(true)
    const res = await fetch('/api/sondage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question.trim(), options: validOptions }),
    })
    if (res.ok) setPoll(await res.json())
    setCreating(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(pollUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const total = poll?.votes.reduce((a, b) => a + b, 0) ?? 0

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <BarChart2 className="h-4 w-4 text-blue-600" />
        <h2 className="font-semibold text-stone-900">Sondage rapide</h2>
      </div>
      {!poll ? (
        <div className="space-y-3">
          <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Question..."
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input value={opt} onChange={e => setOptions(o => o.map((x, j) => j === i ? e.target.value : x))}
                placeholder={`Option ${i + 1}`}
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
              {options.length > 2 && (
                <button onClick={() => setOptions(o => o.filter((_, j) => j !== i))} className="text-stone-400 hover:text-red-500"><X className="h-4 w-4" /></button>
              )}
            </div>
          ))}
          {options.length < 4 && (
            <button onClick={() => setOptions(o => [...o, ''])} className="text-xs text-blue-600 hover:underline">+ Ajouter une option</button>
          )}
          <Button onClick={createPoll} disabled={creating || !question.trim() || options.filter(o => o.trim()).length < 2}
            className="w-full bg-blue-600 hover:bg-blue-700">
            {creating ? 'Création...' : 'Créer le sondage'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="font-medium text-stone-900">{poll.question}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-stone-100 px-3 py-2 text-xs text-stone-700">{pollUrl}</code>
            <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0 gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <div className="space-y-2">
            {poll.options.map((opt, i) => {
              const pct = total > 0 ? Math.round((poll.votes[i] / total) * 100) : 0
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-700">{opt}</span>
                    <span className="text-stone-500">{poll.votes[i]} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-stone-400 text-center">{total} réponse{total > 1 ? 's' : ''} · mise à jour en direct</p>
          <Button size="sm" variant="outline" onClick={() => { setPoll(null); setQuestion(''); setOptions(['', '']) }} className="w-full">
            Nouveau sondage
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Mode projecteur ──────────────────────────────────────────────────────────

function ModeProjecteur() {
  const [slug, setSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/parent-portal').then(r => r.json()).then(data => { setSlug(data.slug ?? null); setLoading(false) })
  }, [])

  const projecteurUrl = slug ? `/p/${slug}?projecteur=1` : null

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Projector className="h-4 w-4 text-blue-600" />
        <h2 className="font-semibold text-stone-900">Mode projecteur</h2>
      </div>
      <p className="text-sm text-stone-500">Affiche la semaine en plein écran pour votre tableau blanc.</p>
      {loading ? (
        <div className="text-sm text-stone-400">Chargement...</div>
      ) : projecteurUrl ? (
        <Link href={projecteurUrl} target="_blank">
          <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <Maximize2 className="h-4 w-4" />Ouvrir en plein écran
          </Button>
        </Link>
      ) : (
        <p className="text-sm text-red-500">Configurez d&apos;abord votre portail parents.</p>
      )}
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'temps',   label: '⏱ Temps & ambiance' },
  { id: 'eleves',  label: '👥 Élèves' },
  { id: 'affichage', label: '📺 Affichage' },
]

export default function ClassePage() {
  const [tab, setTab] = useState<string>('temps')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Outils de classe</h1>
        <p className="mt-1 text-stone-500">Outils interactifs pour animer votre classe au quotidien.</p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 rounded-xl bg-stone-100 p-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'temps' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Minuterie />
          <NiveauBruit />
          <Des />
        </div>
      )}

      {tab === 'eleves' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SelecteurEleve />
          <RoueChance />
          <GenerateurGroupes />
          <SondageRapide />
        </div>
      )}

      {tab === 'affichage' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AffichageConsignes />
          <ModeProjecteur />
        </div>
      )}
    </div>
  )
}
