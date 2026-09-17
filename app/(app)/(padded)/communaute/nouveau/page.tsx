'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RESOURCE_TYPES, GRADES, GRADE_LABELS, SUBJECTS } from '@/lib/constants'

export default function NouvelleRessourcePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const [mode, setMode] = useState<'texte' | 'fichier'>('texte')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('')
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [textContent, setTextContent] = useState('')

  const toggleGrade = (g: string) =>
    setSelectedGrades(gs => gs.includes(g) ? gs.filter(x => x !== g) : [...gs, g])

  const toggleSubject = (s: string) =>
    setSelectedSubjects(ss => ss.includes(s) ? ss.filter(x => x !== s) : [...ss, s])

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const t = tagInput.trim()
      if (t && !tags.includes(t)) setTags(ts => [...ts, t])
      setTagInput('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !type) {
      toast.error('Le titre et le type sont requis.')
      return
    }
    if (mode === 'texte' && !textContent.trim()) {
      toast.error('Le contenu texte est requis.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/shared-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          type,
          grades: selectedGrades,
          subjects: selectedSubjects,
          tags,
          textContent: mode === 'texte' ? textContent.trim() : null,
        }),
      })
      if (!res.ok) throw new Error()
      const resource = await res.json()
      toast.success('Ressource partagée!')
      router.push(`/communaute/${resource.id}`)
    } catch {
      toast.error('Erreur lors du partage.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/communaute">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-stone-500">
            <ArrowLeft className="h-4 w-4" />Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-stone-900">Partager une ressource</h1>
        <p className="mt-1 text-stone-500">Partagez votre matériel avec la communauté des enseignants.</p>
      </div>

      {/* Mode */}
      <div className="flex gap-2 rounded-xl border border-stone-200 bg-stone-50 p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode('texte')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === 'texte' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          Ressource texte
        </button>
        <button
          type="button"
          onClick={() => { setMode('fichier'); toast.info('Le téléversement de fichiers sera disponible prochainement.') }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === 'fichier' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          Fichier PDF / Word
        </button>
      </div>

      {/* Informations */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-stone-900">Informations</h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Titre *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="ex: Fiche de lecture — Les animaux de la forêt"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Décrivez brièvement ce que contient cette ressource..."
            rows={2}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Type *</label>
          <div className="flex flex-wrap gap-2">
            {RESOURCE_TYPES.map(rt => (
              <button
                key={rt.value}
                type="button"
                onClick={() => setType(rt.value)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  type === rt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-stone-300 text-stone-600 hover:border-stone-400'
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Niveaux et matières */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-stone-900">Niveaux et matières <span className="text-stone-400 text-sm font-normal">(optionnel)</span></h2>
        <div>
          <p className="mb-2 text-sm text-stone-600">Niveaux</p>
          <div className="flex flex-wrap gap-2">
            {GRADES.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGrade(g)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  selectedGrades.includes(g)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-stone-300 text-stone-600 hover:border-stone-400'
                }`}
              >
                {GRADE_LABELS[g]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm text-stone-600">Matières</p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleSubject(s.value)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  selectedSubjects.includes(s.value)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-stone-300 text-stone-600 hover:border-stone-400'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-stone-600">Mots-clés</label>
          <div className="flex flex-wrap gap-2 rounded-lg border border-stone-300 px-3 py-2">
            {tags.map(t => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-sm text-stone-700">
                {t}
                <button type="button" onClick={() => setTags(ts => ts.filter(x => x !== t))} className="text-stone-400 hover:text-stone-600">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder={tags.length === 0 ? 'ex: fractions, 3e année… (Entrée pour ajouter)' : ''}
              className="flex-1 min-w-24 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </section>

      {/* Contenu */}
      {mode === 'texte' && (
        <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
          <h2 className="font-semibold text-stone-900">Contenu *</h2>
          <textarea
            value={textContent}
            onChange={e => setTextContent(e.target.value)}
            placeholder="Collez ou rédigez le contenu de votre ressource ici..."
            rows={10}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-y"
          />
        </section>
      )}

      <div className="flex justify-end gap-3 pb-8">
        <Link href="/communaute">
          <Button type="button" variant="outline">Annuler</Button>
        </Link>
        <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
          {submitting ? 'Publication...' : 'Partager la ressource'}
        </Button>
      </div>
    </form>
  )
}
