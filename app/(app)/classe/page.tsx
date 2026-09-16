'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Timer, Users, Projector, Play, Pause, RotateCcw, Shuffle, X, Maximize2, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// ─── Minuterie ────────────────────────────────────────────────────────────────

function Minuterie() {
  const [totalSeconds, setTotalSeconds] = useState(300)
  const [remaining, setRemaining] = useState(300)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const inputMinutes = Math.floor(totalSeconds / 60)
  const inputSeconds = totalSeconds % 60

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            setFinished(true)
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

  const reset = () => {
    setRunning(false)
    setFinished(false)
    setRemaining(totalSeconds)
  }

  const setPreset = (secs: number) => {
    setRunning(false)
    setFinished(false)
    setTotalSeconds(secs)
    setRemaining(secs)
  }

  const adjustTime = (delta: number) => {
    const next = Math.max(60, totalSeconds + delta)
    setRunning(false)
    setFinished(false)
    setTotalSeconds(next)
    setRemaining(next)
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
        {/* Cercle SVG */}
        <div className="relative">
          <svg width="128" height="128" className="-rotate-90">
            <circle cx="64" cy="64" r={radius} fill="none" stroke="#e7e5e4" strokeWidth="8" />
            <circle
              cx="64" cy="64" r={radius} fill="none"
              stroke={color} strokeWidth="8"
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold tabular-nums ${finished ? 'text-red-500 animate-pulse' : 'text-stone-900'}`}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Ajuster le temps */}
        {!running && (
          <div className="flex items-center gap-3">
            <button onClick={() => adjustTime(-60)} className="rounded-full p-1.5 hover:bg-stone-100 text-stone-500">
              <ChevronDown className="h-4 w-4" />
            </button>
            <span className="text-sm text-stone-500">{inputMinutes}:{String(inputSeconds).padStart(2,'0')}</span>
            <button onClick={() => adjustTime(60)} className="rounded-full p-1.5 hover:bg-stone-100 text-stone-500">
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Presets */}
        <div className="flex gap-2 flex-wrap justify-center">
          {[1, 2, 3, 5, 10, 15, 20].map(m => (
            <button
              key={m}
              onClick={() => setPreset(m * 60)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                totalSeconds === m * 60 && !running
                  ? 'bg-blue-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {m} min
            </button>
          ))}
        </div>

        {/* Contrôles */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => { setFinished(false); setRunning(r => !r) }}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 w-24"
          >
            {running ? <><Pause className="h-3.5 w-3.5" />Pause</> : <><Play className="h-3.5 w-3.5" />Démarrer</>}
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
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
    const newNames = input
      .split(/[\n,;]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0)
    setNames(prev => {
      const all = [...new Set([...prev, ...newNames])]
      return all
    })
    setInput('')
  }

  const removeName = (name: string) => setNames(prev => prev.filter(n => n !== name))

  const pick = useCallback(() => {
    if (names.length === 0) return
    setSpinning(true)
    setSelected(null)
    let count = 0
    const total = 15
    const interval = setInterval(() => {
      setSelected(names[Math.floor(Math.random() * names.length)])
      count++
      if (count >= total) {
        clearInterval(interval)
        setSpinning(false)
      }
    }, 80)
  }, [names])

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-blue-600" />
        <h2 className="font-semibold text-stone-900">Sélecteur d&apos;élève</h2>
      </div>

      {/* Résultat */}
      {(selected || spinning) && (
        <div className={`rounded-xl bg-blue-50 border-2 border-blue-200 p-6 text-center transition-all ${spinning ? 'opacity-70' : ''}`}>
          <p className="text-3xl font-bold text-blue-700">{selected}</p>
          {!spinning && <p className="text-sm text-blue-500 mt-1">a été sélectionné·e!</p>}
        </div>
      )}

      {/* Ajouter des noms */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700">Ajouter des élèves</label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNames() } }}
          placeholder="Un nom par ligne (ou séparés par virgule)..."
          rows={3}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
        />
        <Button size="sm" variant="outline" onClick={addNames} className="w-full">Ajouter</Button>
      </div>

      {/* Liste */}
      {names.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-stone-500">{names.length} élève{names.length > 1 ? 's' : ''}</p>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {names.map(name => (
              <span key={name} className="flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-700">
                {name}
                <button onClick={() => removeName(name)} className="text-stone-400 hover:text-red-500 ml-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={pick}
        disabled={names.length === 0 || spinning}
        className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
      >
        <Shuffle className="h-4 w-4" />
        {spinning ? 'Sélection...' : 'Choisir un élève'}
      </Button>
    </div>
  )
}

// ─── Mode projecteur ──────────────────────────────────────────────────────────

function ModeProjecteur() {
  const [slug, setSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/parent-portal')
      .then(r => r.json())
      .then(data => { setSlug(data.slug ?? null); setLoading(false) })
  }, [])

  const projecteurUrl = slug ? `/p/${slug}?projecteur=1` : null

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Projector className="h-4 w-4 text-blue-600" />
        <h2 className="font-semibold text-stone-900">Mode projecteur</h2>
      </div>
      <p className="text-sm text-stone-500">
        Affiche la semaine en plein écran pour votre tableau blanc.
      </p>
      {loading ? (
        <div className="text-sm text-stone-400">Chargement...</div>
      ) : projecteurUrl ? (
        <Link href={projecteurUrl} target="_blank">
          <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <Maximize2 className="h-4 w-4" />
            Ouvrir en plein écran
          </Button>
        </Link>
      ) : (
        <p className="text-sm text-red-500">Configurez d&apos;abord votre portail parents.</p>
      )}
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ClassePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Outils de classe</h1>
        <p className="mt-1 text-stone-500">Outils interactifs pour animer votre classe au quotidien.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Minuterie />
        <SelecteurEleve />
      </div>
      <ModeProjecteur />
    </div>
  )
}
