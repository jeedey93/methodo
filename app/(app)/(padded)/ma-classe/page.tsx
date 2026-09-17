'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, GripVertical, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Student {
  id: string
  firstName: string
  lastName: string
  order: number
}

export default function MaClassePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [saving, setSaving] = useState(false)
  const [bulkMode, setBulkMode] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [savingBulk, setSavingBulk] = useState(false)
  const dragIdx = useRef<number | null>(null)

  useEffect(() => {
    fetch('/api/students')
      .then(r => r.json())
      .then(data => { setStudents(data); setLoading(false) })
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim()) return
    setSaving(true)
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() }),
    })
    if (res.ok) {
      const student = await res.json()
      setStudents(prev => [...prev, student])
      setFirstName('')
      setLastName('')
      toast.success('Élève ajouté')
    } else {
      toast.error('Erreur lors de l\'ajout')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await fetch('/api/students', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setStudents(prev => prev.filter(s => s.id !== id))
    toast.success('Élève retiré')
  }

  const handleBulkAdd = async () => {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    if (lines.length === 0) return
    setSavingBulk(true)
    const added: Student[] = []
    for (const line of lines) {
      const parts = line.split(/\s+/)
      const fn = parts[0] ?? ''
      const ln = parts.slice(1).join(' ')
      if (!fn) continue
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: fn, lastName: ln }),
      })
      if (res.ok) added.push(await res.json())
    }
    setStudents(prev => [...prev, ...added])
    setBulkText('')
    setBulkMode(false)
    setSavingBulk(false)
    toast.success(`${added.length} élève${added.length > 1 ? 's' : ''} ajouté${added.length > 1 ? 's' : ''}`)
  }

  const handleDragStart = (idx: number) => { dragIdx.current = idx }

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIdx.current === null || dragIdx.current === idx) return
    const reordered = [...students]
    const [moved] = reordered.splice(dragIdx.current, 1)
    reordered.splice(idx, 0, moved)
    dragIdx.current = idx
    setStudents(reordered)
  }

  const handleDragEnd = async () => {
    dragIdx.current = null
    await fetch('/api/students', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: students.map(s => s.id) }),
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-stone-400">Chargement...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Ma classe</h1>
        <p className="mt-1 text-stone-500">
          Gérez votre liste d&apos;élèves — elle sera utilisée automatiquement dans les outils de classe.
        </p>
      </div>

      {/* Ajouter un élève */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Ajouter des élèves</h2>
          <button
            onClick={() => setBulkMode(v => !v)}
            className="text-sm text-blue-600 hover:underline"
          >
            {bulkMode ? 'Ajouter un à la fois' : 'Importer une liste'}
          </button>
        </div>

        {bulkMode ? (
          <div className="space-y-3">
            <p className="text-xs text-stone-500">Un élève par ligne. Format : Prénom Nom (le nom est optionnel).</p>
            <textarea
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder={"Alice Tremblay\nBob Martin\nChloé"}
              rows={6}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none font-mono"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleBulkAdd}
                disabled={savingBulk || !bulkText.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {savingBulk ? 'Importation...' : 'Importer'}
              </Button>
              <Button variant="ghost" onClick={() => { setBulkMode(false); setBulkText('') }}>
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Prénom *"
              className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              required
            />
            <input
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Nom"
              className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <Button type="submit" disabled={saving || !firstName.trim()} className="gap-1.5 bg-blue-600 hover:bg-blue-700 shrink-0">
              <Plus className="h-4 w-4" />
              {saving ? '...' : 'Ajouter'}
            </Button>
          </form>
        )}
      </section>

      {/* Liste des élèves */}
      <section className="rounded-xl border border-stone-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-stone-400" />
            <h2 className="font-semibold text-stone-900">
              {students.length === 0
                ? 'Aucun élève'
                : `${students.length} élève${students.length > 1 ? 's' : ''}`}
            </h2>
          </div>
          {students.length > 0 && (
            <p className="text-xs text-stone-400">Glissez pour réordonner</p>
          )}
        </div>

        {students.length === 0 ? (
          <div className="px-5 py-10 text-center text-stone-400 text-sm">
            Ajoutez vos élèves ci-dessus pour commencer.
          </div>
        ) : (
          <ul className="divide-y divide-stone-50">
            {students.map((student, idx) => (
              <li
                key={student.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50 transition-colors cursor-grab active:cursor-grabbing group"
              >
                <GripVertical className="h-4 w-4 text-stone-300 group-hover:text-stone-400 shrink-0" />
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-600">
                    {student.firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900">
                    {student.firstName}
                    {student.lastName && <span className="text-stone-500"> {student.lastName}</span>}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="text-stone-300 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {students.length > 0 && (
        <p className="text-xs text-center text-stone-400">
          Ces élèves sont utilisés automatiquement dans les outils Sélecteur d&apos;élève, Roue de la chance et Générateur de groupes.
        </p>
      )}
    </div>
  )
}
