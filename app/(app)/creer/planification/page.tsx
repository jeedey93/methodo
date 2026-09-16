'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GRADES, GRADE_LABELS, SUBJECTS } from '@/lib/constants'

const PHASE_TEMPLATES = [
  { name: 'Mise en situation', duration: 10 },
  { name: 'Développement', duration: 30 },
  { name: 'Pratique guidée', duration: 15 },
  { name: 'Objectivation', duration: 5 },
]

interface Phase {
  name: string
  duration: string
  description: string
  activities: string[]
}

interface Differentiation {
  group: string
  strategy: string
}

export default function PlanificationPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const [grade, setGrade] = useState('')
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [objectives, setObjectives] = useState([''])
  const [phases, setPhases] = useState<Phase[]>(
    PHASE_TEMPLATES.map(p => ({ ...p, duration: String(p.duration), description: '', activities: [''] }))
  )
  const [materials, setMaterials] = useState([''])
  const [differentiation, setDifferentiation] = useState<Differentiation[]>([])
  const [conclusion, setConclusion] = useState('')
  const [assessmentCheck, setAssessmentCheck] = useState('')

  // Objectives
  const addObjective = () => setObjectives(o => [...o, ''])
  const removeObjective = (i: number) => setObjectives(o => o.filter((_, j) => j !== i))
  const updateObjective = (i: number, val: string) => setObjectives(o => o.map((v, j) => j === i ? val : v))

  // Phase activities
  const addActivity = (pi: number) => setPhases(ps => ps.map((p, i) => i === pi ? { ...p, activities: [...p.activities, ''] } : p))
  const removeActivity = (pi: number, ai: number) => setPhases(ps => ps.map((p, i) => i === pi ? { ...p, activities: p.activities.filter((_, j) => j !== ai) } : p))
  const updateActivity = (pi: number, ai: number, val: string) => setPhases(ps => ps.map((p, i) => i === pi ? { ...p, activities: p.activities.map((a, j) => j === ai ? val : a) } : p))
  const updatePhase = (pi: number, field: keyof Phase, val: string) => setPhases(ps => ps.map((p, i) => i === pi ? { ...p, [field]: val } : p))

  // Materials
  const addMaterial = () => setMaterials(m => [...m, ''])
  const removeMaterial = (i: number) => setMaterials(m => m.filter((_, j) => j !== i))
  const updateMaterial = (i: number, val: string) => setMaterials(m => m.map((v, j) => j === i ? val : v))

  // Differentiation
  const addDiff = () => setDifferentiation(d => [...d, { group: '', strategy: '' }])
  const removeDiff = (i: number) => setDifferentiation(d => d.filter((_, j) => j !== i))
  const updateDiff = (i: number, field: keyof Differentiation, val: string) =>
    setDifferentiation(d => d.map((v, j) => j === i ? { ...v, [field]: val } : v))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanObjectives = objectives.filter(o => o.trim())
    if (!grade || !subject || !topic.trim() || cleanObjectives.length === 0) {
      toast.error('Veuillez remplir le niveau, la matière, le sujet et au moins un objectif.')
      return
    }

    setSubmitting(true)
    try {
      const content = {
        title: `${topic} — ${GRADE_LABELS[grade]}`,
        grade,
        subject,
        objectives: cleanObjectives,
        phases: phases.map(p => ({
          name: p.name,
          duration: parseInt(p.duration) || 0,
          description: p.description,
          activities: p.activities.filter(a => a.trim()),
        })),
        materials: materials.filter(m => m.trim()),
        differentiation: differentiation.filter(d => d.group.trim() && d.strategy.trim()),
        conclusion,
        assessmentCheck,
        totalDuration: phases.reduce((sum, p) => sum + (parseInt(p.duration) || 0), 0),
      }

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'LESSON_PLAN',
          title: `${topic} — ${GRADE_LABELS[grade]}`,
          content,
          metadata: { grade, subject, topic },
        }),
      })

      if (!res.ok) throw new Error()
      const { document: doc } = await res.json()
      toast.success('Planification créée!')
      router.push(`/bibliotheque/${doc.id}`)
    } catch {
      toast.error('Erreur lors de la création.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/creer">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-stone-500">
            <ArrowLeft className="h-4 w-4" />Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-stone-900">Planification de cours</h1>
        <p className="mt-1 text-stone-500">Remplissez les sections pour créer votre planification PFÉQ.</p>
      </div>

      {/* Informations générales */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-stone-900">Informations générales</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Niveau *</label>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Choisir...</option>
              {GRADES.map(g => <option key={g} value={g}>{GRADE_LABELS[g]}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Matière *</label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Choisir...</option>
              {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Sujet / Thème *</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="ex: Les fractions simples"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </section>

      {/* Objectifs */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold text-stone-900">Objectifs d&apos;apprentissage *</h2>
        {objectives.map((obj, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-stone-400 text-sm w-5 shrink-0">{i + 1}.</span>
            <input
              value={obj}
              onChange={e => updateObjective(i, e.target.value)}
              placeholder="ex: Comprendre ce qu'est une fraction"
              className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            {objectives.length > 1 && (
              <button type="button" onClick={() => removeObjective(i)} className="text-stone-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addObjective} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700">
          <Plus className="h-4 w-4" /> Ajouter un objectif
        </button>
      </section>

      {/* Phases */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-stone-900">Phases du cours</h2>
        {phases.map((phase, pi) => (
          <div key={pi} className="rounded-lg border border-stone-100 bg-stone-50 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-medium text-stone-800">{phase.name}</span>
              <div className="flex items-center gap-1.5 ml-auto">
                <input
                  type="number"
                  value={phase.duration}
                  onChange={e => updatePhase(pi, 'duration', e.target.value)}
                  className="w-16 rounded-lg border border-stone-300 px-2 py-1 text-sm text-center focus:border-blue-500 focus:outline-none"
                  min="1" max="90"
                />
                <span className="text-xs text-stone-500">min</span>
              </div>
            </div>
            <textarea
              value={phase.description}
              onChange={e => updatePhase(pi, 'description', e.target.value)}
              placeholder="Description de la phase..."
              rows={2}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
            />
            <div className="space-y-2">
              <p className="text-xs font-medium text-stone-500">Activités</p>
              {phase.activities.map((act, ai) => (
                <div key={ai} className="flex items-center gap-2">
                  <input
                    value={act}
                    onChange={e => updateActivity(pi, ai, e.target.value)}
                    placeholder="ex: Discussion sur les fractions"
                    className="flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  {phase.activities.length > 1 && (
                    <button type="button" onClick={() => removeActivity(pi, ai)} className="text-stone-400 hover:text-red-500">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addActivity(pi)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                <Plus className="h-3.5 w-3.5" /> Ajouter
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Matériel */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold text-stone-900">Matériel requis</h2>
        <div className="flex flex-wrap gap-2">
          {materials.map((m, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5">
              <input
                value={m}
                onChange={e => updateMaterial(i, e.target.value)}
                placeholder="ex: Bandes de papier"
                className="bg-transparent text-sm outline-none w-32"
              />
              {materials.length > 1 && (
                <button type="button" onClick={() => removeMaterial(i)} className="text-stone-400 hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMaterial}
            className="flex items-center gap-1 rounded-full border border-dashed border-stone-300 px-3 py-1.5 text-sm text-stone-500 hover:border-blue-400 hover:text-blue-600"
          >
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </button>
        </div>
      </section>

      {/* Différenciation */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold text-stone-900">Différenciation <span className="text-stone-400 text-sm font-normal">(optionnel)</span></h2>
        {differentiation.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={d.group}
              onChange={e => updateDiff(i, 'group', e.target.value)}
              placeholder="Groupe (ex: Élèves en difficulté)"
              className="w-48 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              value={d.strategy}
              onChange={e => updateDiff(i, 'strategy', e.target.value)}
              placeholder="Stratégie d'adaptation"
              className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button type="button" onClick={() => removeDiff(i)} className="text-stone-400 hover:text-red-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {differentiation.length < 4 && (
          <button type="button" onClick={addDiff} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700">
            <Plus className="h-4 w-4" /> Ajouter un groupe
          </button>
        )}
      </section>

      {/* Conclusion */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-stone-900">Clôture et évaluation <span className="text-stone-400 text-sm font-normal">(optionnel)</span></h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Conclusion</label>
          <textarea
            value={conclusion}
            onChange={e => setConclusion(e.target.value)}
            placeholder="Résumé de la période, ce que les élèves devront retenir..."
            rows={2}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Vérification des apprentissages</label>
          <textarea
            value={assessmentCheck}
            onChange={e => setAssessmentCheck(e.target.value)}
            placeholder="Comment allez-vous vérifier la compréhension des élèves?"
            rows={2}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>
      </section>

      <div className="flex justify-end gap-3 pb-8">
        <Link href="/creer">
          <Button type="button" variant="outline">Annuler</Button>
        </Link>
        <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
          {submitting ? 'Enregistrement...' : 'Créer la planification'}
        </Button>
      </div>
    </form>
  )
}
