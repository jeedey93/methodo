'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { X, Settings2, Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SUBJECTS, WEEK_COLORS } from '@/lib/constants'

export interface WeekSlot {
  day: number
  period: number
  subject: string
  title: string
  notes: string
  color: string
}

export interface WeekPeriod {
  id: number
  label: string
  startTime: string
  endTime: string
}

const DEFAULT_PERIODS: WeekPeriod[] = [
  { id: 0, label: 'Période 1', startTime: '08:30', endTime: '09:15' },
  { id: 1, label: 'Période 2', startTime: '09:15', endTime: '10:00' },
  { id: 2, label: 'Période 3', startTime: '10:15', endTime: '11:00' },
  { id: 3, label: 'Période 4', startTime: '11:00', endTime: '11:45' },
  { id: 4, label: 'Période 5', startTime: '13:00', endTime: '13:45' },
  { id: 5, label: 'Période 6', startTime: '13:45', endTime: '14:30' },
]

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven']

const SUBJECT_SHORT: Record<string, string> = {
  francais: 'FR',
  mathematiques: 'MATH',
  sciences: 'SC',
  univers_social: 'US',
  arts_plastiques: 'ART',
  education_physique: 'ÉP',
  anglais: 'ANG',
  autre: '—',
}

// ── Cell edit dialog ──────────────────────────────────────────────────────────

interface CellEditDialogProps {
  slot: WeekSlot | null
  day: number
  period: number
  onSave: (slot: WeekSlot) => void
  onClear: () => void
  onClose: () => void
}

export function CellEditDialog({ slot, day, period, onSave, onClear, onClose }: CellEditDialogProps) {
  const [subject, setSubject] = useState(slot?.subject ?? '')
  const [title, setTitle] = useState(slot?.title ?? '')
  const [notes, setNotes] = useState(slot?.notes ?? '')
  const [color, setColor] = useState(slot?.color ?? WEEK_COLORS[0])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4 mx-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-stone-900">Modifier la cellule</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-4 w-4" /></button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Matière</label>
          <select value={subject} onChange={e => setSubject(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none">
            <option value="">—</option>
            {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Titre</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="ex: Introduction aux fractions"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Notes optionnelles..." rows={2}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Couleur</label>
          <div className="flex gap-2 flex-wrap">
            {WEEK_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full border-2 transition-transform ${color === c ? 'border-stone-600 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => { onClear(); onClose() }} className="text-sm text-red-500 hover:text-red-600">
            Vider la cellule
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
            <Button size="sm" onClick={() => { onSave({ day, period, subject, title, notes, color }); onClose() }}
              className="bg-blue-600 hover:bg-blue-700">Enregistrer</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Period config panel ───────────────────────────────────────────────────────

interface PeriodConfigProps {
  periods: WeekPeriod[]
  onChange: (periods: WeekPeriod[]) => void
  onClose: () => void
}

function PeriodConfig({ periods, onChange, onClose }: PeriodConfigProps) {
  const [local, setLocal] = useState<WeekPeriod[]>(periods)
  const dragIdx = useRef<number | null>(null)
  const nextId = useRef(Math.max(0, ...periods.map(p => p.id)) + 1)

  const update = (idx: number, field: keyof WeekPeriod, value: string) => {
    setLocal(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p))
  }

  const addPeriod = () => {
    const last = local[local.length - 1]
    const newPeriod: WeekPeriod = {
      id: nextId.current++,
      label: `Période ${local.length + 1}`,
      startTime: last?.endTime ?? '08:30',
      endTime: '',
    }
    setLocal(prev => [...prev, newPeriod])
  }

  const removePeriod = (idx: number) => {
    setLocal(prev => prev.filter((_, i) => i !== idx))
  }

  const handleDragStart = (idx: number) => { dragIdx.current = idx }
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIdx.current === null || dragIdx.current === idx) return
    setLocal(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIdx.current!, 1)
      next.splice(idx, 0, moved)
      dragIdx.current = idx
      return next
    })
  }

  const handleSave = () => {
    onChange(local)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-stone-900">Configurer les périodes</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-4 w-4" /></button>
        </div>

        <p className="text-xs text-stone-400">Glissez pour réordonner. Les heures sont affichées dans la grille.</p>

        <div className="space-y-2">
          {local.map((p, idx) => (
            <div key={p.id} draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => handleDragOver(e, idx)}
              className="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-stone-300 shrink-0" />
              <input value={p.label} onChange={e => update(idx, 'label', e.target.value)}
                className="flex-1 min-w-0 rounded border border-stone-200 bg-white px-2 py-1 text-sm focus:border-blue-400 focus:outline-none" />
              <input type="time" value={p.startTime} onChange={e => update(idx, 'startTime', e.target.value)}
                className="w-24 rounded border border-stone-200 bg-white px-2 py-1 text-sm focus:border-blue-400 focus:outline-none" />
              <span className="text-stone-300 text-xs">→</span>
              <input type="time" value={p.endTime} onChange={e => update(idx, 'endTime', e.target.value)}
                className="w-24 rounded border border-stone-200 bg-white px-2 py-1 text-sm focus:border-blue-400 focus:outline-none" />
              <button onClick={() => removePeriod(idx)}
                className="text-stone-300 hover:text-red-500 transition-colors shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button onClick={addPeriod}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 py-2 text-sm text-stone-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
          <Plus className="h-4 w-4" />Ajouter une période
        </button>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">Appliquer</Button>
        </div>
      </div>
    </div>
  )
}

// ── WeekGrid ──────────────────────────────────────────────────────────────────

interface WeekGridProps {
  planId: string
  initialSlots: WeekSlot[]
  initialPeriods?: WeekPeriod[]
}

export default function WeekGrid({ planId, initialSlots, initialPeriods }: WeekGridProps) {
  const [slots, setSlots] = useState<WeekSlot[]>(initialSlots)
  const [periods, setPeriods] = useState<WeekPeriod[]>(
    initialPeriods && initialPeriods.length > 0 ? initialPeriods : DEFAULT_PERIODS
  )
  const [editing, setEditing] = useState<{ day: number; period: number } | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [saving, setSaving] = useState(false)

  const getSlot = (day: number, period: number) =>
    slots.find(s => s.day === day && s.period === period) ?? null

  const save = async (newSlots: WeekSlot[], newPeriods: WeekPeriod[]) => {
    setSaving(true)
    try {
      await fetch(`/api/week-plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: newSlots, periods: newPeriods }),
      })
      toast.success('Sauvegardé')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSlot = (newSlot: WeekSlot) => {
    const updated = slots.filter(s => !(s.day === newSlot.day && s.period === newSlot.period))
    if (newSlot.subject || newSlot.title) updated.push(newSlot)
    setSlots(updated)
    save(updated, periods)
  }

  const handleClearSlot = (day: number, period: number) => {
    const updated = slots.filter(s => !(s.day === day && s.period === period))
    setSlots(updated)
    save(updated, periods)
  }

  const handlePeriodChange = (newPeriods: WeekPeriod[]) => {
    // Remap slots: remove slots whose period index no longer exists
    const validIndices = new Set(newPeriods.map((_, i) => i))
    const updatedSlots = slots.filter(s => validIndices.has(s.period))
    setPeriods(newPeriods)
    setSlots(updatedSlots)
    save(updatedSlots, newPeriods)
  }

  const editingSlot = editing ? getSlot(editing.day, editing.period) : null

  return (
    <>
      <div className="flex items-center justify-between mb-4 print:hidden">
        <p className="text-sm text-stone-400">{saving ? 'Enregistrement...' : 'Cliquez sur une cellule pour la modifier'}</p>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowConfig(true)}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors">
            <Settings2 className="h-4 w-4" />Périodes
          </button>
          <button onClick={() => window.print()}
            className="text-sm text-stone-500 hover:text-stone-800 underline">
            Imprimer
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-32 border border-stone-200 bg-stone-50 p-2 text-xs font-medium text-stone-500"></th>
              {DAYS.map(d => (
                <th key={d} className="border border-stone-200 bg-stone-50 p-2 text-xs font-semibold text-stone-700">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period, pi) => (
              <tr key={period.id}>
                <td className="border border-stone-200 bg-stone-50 p-2 text-center align-middle">
                  <p className="text-xs font-medium text-stone-700">{period.label}</p>
                  {(period.startTime || period.endTime) && (
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      {period.startTime}{period.startTime && period.endTime ? '–' : ''}{period.endTime}
                    </p>
                  )}
                </td>
                {DAYS.map((_, di) => {
                  const slot = getSlot(di, pi)
                  return (
                    <td key={di}
                      onClick={() => setEditing({ day: di, period: pi })}
                      className="relative border border-stone-200 p-2 cursor-pointer hover:border-blue-300 transition-colors min-w-[120px] h-16 align-top"
                      style={slot ? { backgroundColor: slot.color } : {}}>
                      {slot ? (
                        <div>
                          {slot.subject && (
                            <span className="inline-block rounded px-1 py-0.5 text-[10px] font-bold text-stone-700 bg-white/60 mb-0.5">
                              {SUBJECT_SHORT[slot.subject] ?? slot.subject}
                            </span>
                          )}
                          {slot.title && <p className="text-xs font-medium text-stone-800 leading-tight">{slot.title}</p>}
                          {slot.notes && <p className="text-[10px] text-stone-500 leading-tight truncate">{slot.notes}</p>}
                        </div>
                      ) : (
                        <span className="text-stone-300 text-lg leading-none">+</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <CellEditDialog
          slot={editingSlot}
          day={editing.day}
          period={editing.period}
          onSave={handleSaveSlot}
          onClear={() => handleClearSlot(editing.day, editing.period)}
          onClose={() => setEditing(null)}
        />
      )}

      {showConfig && (
        <PeriodConfig
          periods={periods}
          onChange={handlePeriodChange}
          onClose={() => setShowConfig(false)}
        />
      )}
    </>
  )
}
