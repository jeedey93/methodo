'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
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

  const handleSave = () => {
    onSave({ day, period, subject, title, notes, color })
    onClose()
  }

  const handleClear = () => {
    onClear()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4 mx-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-stone-900">Modifier la cellule</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Matière</label>
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">—</option>
            {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Titre</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="ex: Introduction aux fractions"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes optionnelles..."
            rows={2}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Couleur</label>
          <div className="flex gap-2 flex-wrap">
            {WEEK_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full border-2 transition-transform ${color === c ? 'border-stone-600 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-red-500 hover:text-red-600"
          >
            Vider la cellule
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Annuler</Button>
            <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Enregistrer</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven']
const PERIODS = ['Période 1', 'Période 2', 'Période 3', 'Période 4', 'Période 5', 'Période 6']

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

interface WeekGridProps {
  planId: string
  initialSlots: WeekSlot[]
}

export default function WeekGrid({ planId, initialSlots }: WeekGridProps) {
  const [slots, setSlots] = useState<WeekSlot[]>(initialSlots)
  const [editing, setEditing] = useState<{ day: number; period: number } | null>(null)
  const [saving, setSaving] = useState(false)

  const getSlot = (day: number, period: number) =>
    slots.find(s => s.day === day && s.period === period) ?? null

  const saveSlots = async (newSlots: WeekSlot[]) => {
    setSaving(true)
    try {
      await fetch(`/api/week-plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: newSlots }),
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
    saveSlots(updated)
  }

  const handleClearSlot = (day: number, period: number) => {
    const updated = slots.filter(s => !(s.day === day && s.period === period))
    setSlots(updated)
    saveSlots(updated)
  }

  const editingSlot = editing ? getSlot(editing.day, editing.period) : null

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-400">{saving ? 'Enregistrement...' : 'Cliquez sur une cellule pour la modifier'}</p>
        <button
          onClick={() => window.print()}
          className="text-sm text-stone-500 hover:text-stone-800 underline print:hidden"
        >
          Imprimer
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-24 border border-stone-200 bg-stone-50 p-2 text-xs font-medium text-stone-500"></th>
              {DAYS.map(d => (
                <th key={d} className="border border-stone-200 bg-stone-50 p-2 text-xs font-semibold text-stone-700">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period, pi) => (
              <tr key={pi}>
                <td className="border border-stone-200 bg-stone-50 p-2 text-xs font-medium text-stone-500 text-center whitespace-nowrap">
                  {period}
                </td>
                {DAYS.map((_, di) => {
                  const slot = getSlot(di, pi)
                  return (
                    <td
                      key={di}
                      onClick={() => setEditing({ day: di, period: pi })}
                      className="relative border border-stone-200 p-2 cursor-pointer hover:border-blue-300 transition-colors min-w-[120px] h-16 align-top"
                      style={slot ? { backgroundColor: slot.color } : {}}
                    >
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
    </>
  )
}
