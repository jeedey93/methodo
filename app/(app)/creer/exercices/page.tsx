'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GRADES, GRADE_LABELS, SUBJECTS } from '@/lib/constants'

const QUESTION_TYPES = [
  { value: 'courte', label: 'Réponse courte' },
  { value: 'texte', label: 'Réponse développée' },
  { value: 'choix_multiple', label: 'Choix multiple' },
  { value: 'vrai_faux', label: 'Vrai / Faux' },
]

interface Question {
  type: string
  question: string
  options: string[]
  points: string
  space: string
}

export default function ExercicesPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const [grade, setGrade] = useState('')
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [instructions, setInstructions] = useState('')
  const [questions, setQuestions] = useState<Question[]>([
    { type: 'courte', question: '', options: ['', ''], points: '', space: '2' },
  ])

  const addQuestion = () => setQuestions(q => [...q, { type: 'courte', question: '', options: ['', ''], points: '', space: '2' }])
  const removeQuestion = (i: number) => setQuestions(q => q.filter((_, j) => j !== i))

  const updateQuestion = (i: number, field: keyof Question, val: string) =>
    setQuestions(qs => qs.map((q, j) => {
      if (j !== i) return q
      if (field === 'type' && val === 'choix_multiple') return { ...q, [field]: val, options: q.options.length < 2 ? ['', ''] : q.options }
      return { ...q, [field]: val }
    }))

  const addOption = (qi: number) =>
    setQuestions(qs => qs.map((q, i) => i === qi && q.options.length < 6 ? { ...q, options: [...q.options, ''] } : q))

  const removeOption = (qi: number, oi: number) =>
    setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q))

  const updateOption = (qi: number, oi: number, val: string) =>
    setQuestions(qs => qs.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? val : o) } : q))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validQuestions = questions.filter(q => q.question.trim())
    if (!grade || !subject || !topic.trim() || validQuestions.length === 0) {
      toast.error('Veuillez remplir le niveau, la matière, le sujet et au moins une question.')
      return
    }

    setSubmitting(true)
    try {
      const content = {
        title: `Exercices — ${topic}`,
        grade,
        subject,
        instructions,
        questions: validQuestions.map((q, i) => ({
          number: i + 1,
          type: q.type,
          question: q.question,
          ...(q.type === 'choix_multiple' ? { options: q.options.filter(o => o.trim()) } : {}),
          ...(q.points ? { points: parseInt(q.points) } : {}),
          space: parseInt(q.space) || 0,
        })),
      }

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'WORKSHEET',
          title: `Exercices — ${topic} (${GRADE_LABELS[grade]})`,
          content,
          metadata: { grade, subject, topic },
        }),
      })

      if (!res.ok) throw new Error()
      const doc = await res.json()
      toast.success('Feuille d\'exercices créée!')
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
        <h1 className="text-2xl font-bold text-stone-900">Feuille d&apos;exercices</h1>
        <p className="mt-1 text-stone-500">Construisez votre feuille avec des questions structurées.</p>
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
          <label className="mb-1 block text-sm font-medium text-stone-700">Sujet *</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="ex: Les fractions simples"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Consignes générales</label>
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder="ex: Réponds à toutes les questions. Montre ta démarche."
            rows={2}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>
      </section>

      {/* Questions */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-stone-900">Questions *</h2>
        {questions.map((q, qi) => (
          <div key={qi} className="rounded-lg border border-stone-100 bg-stone-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-600">Question {qi + 1}</span>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(qi)} className="text-stone-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <input
              value={q.question}
              onChange={e => updateQuestion(qi, 'question', e.target.value)}
              placeholder="Texte de la question..."
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs text-stone-500">Type</label>
                <select
                  value={q.type}
                  onChange={e => updateQuestion(qi, 'type', e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-stone-500">Points</label>
                <input
                  type="number"
                  value={q.points}
                  onChange={e => updateQuestion(qi, 'points', e.target.value)}
                  placeholder="—"
                  min="0"
                  className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-stone-500">Lignes réponse</label>
                <select
                  value={q.space}
                  onChange={e => updateQuestion(qi, 'space', e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {['0', '1', '2', '3', '4', '6'].map(n => <option key={n} value={n}>{n === '0' ? 'Aucune' : n}</option>)}
                </select>
              </div>
            </div>
            {q.type === 'choix_multiple' && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-stone-500">Options de réponse</p>
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 w-5">{String.fromCharCode(65 + oi)})</span>
                    <input
                      value={opt}
                      onChange={e => updateOption(qi, oi, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    {q.options.length > 2 && (
                      <button type="button" onClick={() => removeOption(qi, oi)} className="text-stone-400 hover:text-red-500">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {q.options.length < 6 && (
                  <button type="button" onClick={() => addOption(qi)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
                    <Plus className="h-3 w-3" /> Ajouter une option
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-4 w-4" /> Ajouter une question
        </button>
      </section>

      <div className="flex justify-end gap-3 pb-8">
        <Link href="/creer">
          <Button type="button" variant="outline">Annuler</Button>
        </Link>
        <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
          {submitting ? 'Enregistrement...' : 'Créer la feuille d\'exercices'}
        </Button>
      </div>
    </form>
  )
}
