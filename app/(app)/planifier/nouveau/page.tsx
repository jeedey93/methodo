'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Brain, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { LessonPlanContent } from '@/types/ai'
import DocumentResult from '@/components/features/generation/DocumentResult'
import GenerationProgress from '@/components/features/generation/GenerationProgress'

const GRADES = ['1', '2', '3', '4', '5', '6']
const GRADE_LABELS: Record<string, string> = { '1': '1re', '2': '2e', '3': '3e', '4': '4e', '5': '5e', '6': '6e' } as const
const SUBJECTS = [
  { value: 'francais', label: 'Français' },
  { value: 'mathematiques', label: 'Mathématiques' },
  { value: 'sciences', label: 'Sciences et technologie' },
  { value: 'univers_social', label: 'Univers social' },
  { value: 'arts_plastiques', label: 'Arts plastiques' },
  { value: 'education_physique', label: 'Éducation physique' },
  { value: 'anglais', label: 'Anglais' },
]

export default function NouveauPlanPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ data: LessonPlanContent; documentId: string } | null>(null)
  const [form, setForm] = useState({
    grade: '',
    subject: '',
    topic: '',
    periods: '1',
    duration: '60',
    objective: '',
    difficulty: 'moyen',
    differentiation: '',
    constraints: '',
  })

  const updateForm = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.grade || !form.subject || !form.topic || !form.objective) {
      toast.error('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setLoading(true)

    try {
      const res = await fetch('/api/ai/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          periods: parseInt(form.periods),
          duration: parseInt(form.duration),
        }),
      })

      if (res.status === 402) {
        toast.error('Vous avez atteint votre limite de générations ce mois-ci. Passez au plan Pro pour continuer.')
        setLoading(false)
        return
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erreur lors de la génération')
      }

      const data = await res.json()
      setResult(data)
      toast.success('Planification créée et sauvegardée!')
    } catch (err) {
      toast.error('Une erreur est survenue pendant la génération. Vos informations ont été conservées. Réessayez dans quelques secondes.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <GenerationProgress
        title="Méthodo prépare votre planification..."
        steps={[
          'Analyse du programme PFÉQ...',
          'Définition des objectifs d\'apprentissage...',
          'Structuration des phases de la leçon...',
          'Préparation des activités...',
          'Ajout de la différenciation...',
          'Finalisation de la planification...',
        ]}
      />
    )
  }

  if (result) {
    return (
      <DocumentResult
        documentId={result.documentId}
        type="LESSON_PLAN"
        title={result.data.title}
        content={result.data}
        onReset={() => setResult(null)}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-stone-500">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Planifier ma semaine</h1>
            <p className="text-sm text-stone-500">Décrivez votre cours et Méthodo génère une planification complète.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Niveau *</Label>
            <Select value={form.grade} onValueChange={(v) => v && updateForm('grade', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map(g => (
                  <SelectItem key={g} value={g}>{GRADE_LABELS[g] ?? g}e année</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Matière *</Label>
            <Select value={form.subject} onValueChange={(v) => v && updateForm('subject', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic">Sujet / Notions à enseigner *</Label>
          <Input
            id="topic"
            placeholder="Ex: Les fractions simples, La mise en récit, La photosynthèse..."
            value={form.topic}
            onChange={e => updateForm('topic', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Périodes</Label>
            <Select value={form.periods} onValueChange={(v) => v && updateForm('periods', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map(n => (
                  <SelectItem key={n} value={String(n)}>{n} période{n > 1 ? 's' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Durée / période</Label>
            <Select value={form.duration} onValueChange={(v) => v && updateForm('duration', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[30, 45, 60, 75, 90].map(d => (
                  <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Difficulté</Label>
            <Select value={form.difficulty} onValueChange={(v) => v && updateForm('difficulty', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facile">Facile</SelectItem>
                <SelectItem value="moyen">Moyen</SelectItem>
                <SelectItem value="difficile">Difficile</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="objective">Objectif principal *</Label>
          <Input
            id="objective"
            placeholder="Ex: Comprendre le concept de fraction, pouvoir représenter ½ et ¼"
            value={form.objective}
            onChange={e => updateForm('objective', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="differentiation">Besoins particuliers de la classe (optionnel)</Label>
          <Input
            id="differentiation"
            placeholder="Ex: Classe hétérogène, 3 élèves avec TSA, difficultés en lecture..."
            value={form.differentiation}
            onChange={e => updateForm('differentiation', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="constraints">Contraintes ou notes (optionnel)</Label>
          <Textarea
            id="constraints"
            placeholder="Ex: Pas d'accès aux tablettes, classe divisée en deux groupes..."
            value={form.constraints}
            onChange={e => updateForm('constraints', e.target.value)}
            rows={2}
          />
        </div>

        <Button type="submit" className="w-full gap-2 bg-blue-600 hover:bg-blue-700 h-11">
          <Sparkles className="h-4 w-4" />
          Créer ma planification
        </Button>
      </form>
    </div>
  )
}
