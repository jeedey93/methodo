'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { AssessmentContent } from '@/types/ai'
import DocumentResult from '@/components/features/generation/DocumentResult'
import GenerationProgress from '@/components/features/generation/GenerationProgress'

const GRADES = ['1', '2', '3', '4', '5', '6']
const SUBJECTS = [
  { value: 'francais', label: 'Français' }, { value: 'mathematiques', label: 'Mathématiques' },
  { value: 'sciences', label: 'Sciences' }, { value: 'univers_social', label: 'Univers social' },
]
const TYPES = [
  { value: 'formative', label: 'Évaluation formative' },
  { value: 'sommative', label: 'Évaluation sommative' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'mini_evaluation', label: 'Mini-évaluation' },
]
const QUESTION_TYPES = [
  { value: 'choix_multiple', label: 'Choix multiples' },
  { value: 'vrai_faux', label: 'Vrai / Faux' },
  { value: 'courte', label: 'Réponse courte' },
  { value: 'texte', label: 'Développement' },
]

export default function NouveauEvaluerPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ data: AssessmentContent; documentId: string } | null>(null)
  const [selectedQTypes, setSelectedQTypes] = useState<string[]>(['choix_multiple', 'courte'])
  const [form, setForm] = useState({ type: 'formative', grade: '', subject: '', topic: '', questionCount: '10', difficulty: 'moyen', duration: '45' })

  const updateForm = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))
  const toggleQType = (v: string) => setSelectedQTypes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.grade || !form.subject || !form.topic || selectedQTypes.length === 0) {
      toast.error('Veuillez remplir tous les champs et sélectionner au moins un type de question.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/ai/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, questionCount: parseInt(form.questionCount), duration: parseInt(form.duration), questionTypes: selectedQTypes }),
      })
      if (res.status === 402) { toast.error('Limite de générations atteinte.'); setLoading(false); return }
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResult(data)
      toast.success('Évaluation créée et sauvegardée!')
    } catch {
      toast.error('Une erreur est survenue pendant la génération. Réessayez dans quelques secondes.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <GenerationProgress title="Méthodo prépare votre évaluation..." steps={['Analyse du programme...', 'Sélection des compétences...', 'Rédaction des questions...', 'Préparation du corrigé...', 'Définition des critères de réussite...', 'Finalisation...']} />
  if (result) return <DocumentResult documentId={result.documentId} type="ASSESSMENT" title={result.data.title} content={result.data} onReset={() => setResult(null)} />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard"><Button variant="ghost" size="sm" className="mb-4 gap-2 text-stone-500"><ArrowLeft className="h-4 w-4" />Retour</Button></Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100"><BarChart3 className="h-5 w-5 text-orange-600" /></div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Créer une évaluation</h1>
            <p className="text-sm text-stone-500">Quiz, contrôle, grille — avec corrigé automatique.</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="space-y-2">
          <Label>Type d&apos;évaluation</Label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => updateForm('type', t.value)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${form.type === t.value ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Niveau *</Label>
            <Select value={form.grade} onValueChange={(v) => v && updateForm('grade', v)}>
              <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
              <SelectContent>{GRADES.map(g => <SelectItem key={g} value={g}>{g}e année</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Matière *</Label>
            <Select value={form.subject} onValueChange={(v) => v && updateForm('subject', v)}>
              <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
              <SelectContent>{SUBJECTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="topic">Sujet *</Label>
          <Input id="topic" placeholder="Ex: Les fractions, La phrase de base..." value={form.topic} onChange={e => updateForm('topic', e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Types de questions</Label>
          <div className="flex flex-wrap gap-2">
            {QUESTION_TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => toggleQType(t.value)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${selectedQTypes.includes(t.value) ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Nb questions</Label>
            <Select value={form.questionCount} onValueChange={(v) => v && updateForm('questionCount', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{[5, 8, 10, 12, 15, 20].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Difficulté</Label>
            <Select value={form.difficulty} onValueChange={(v) => v && updateForm('difficulty', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="facile">Facile</SelectItem><SelectItem value="moyen">Moyen</SelectItem><SelectItem value="difficile">Difficile</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Durée (min)</Label>
            <Input type="number" min={15} max={120} value={form.duration} onChange={e => updateForm('duration', e.target.value)} />
          </div>
        </div>
        <Button type="submit" className="w-full gap-2 bg-orange-600 hover:bg-orange-700 h-11"><Sparkles className="h-4 w-4" />Générer l&apos;évaluation</Button>
      </form>
    </div>
  )
}
