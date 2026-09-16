'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { WorksheetContent } from '@/types/ai'
import DocumentResult from '@/components/features/generation/DocumentResult'
import GenerationProgress from '@/components/features/generation/GenerationProgress'

const GRADES = ['1', '2', '3', '4', '5', '6']
const SUBJECTS = [
  { value: 'francais', label: 'Français' },
  { value: 'mathematiques', label: 'Mathématiques' },
  { value: 'sciences', label: 'Sciences et technologie' },
  { value: 'univers_social', label: 'Univers social' },
  { value: 'arts_plastiques', label: 'Arts plastiques' },
  { value: 'education_physique', label: 'Éducation physique' },
  { value: 'anglais', label: 'Anglais' },
]
const TYPES = [
  { value: 'activite', label: 'Activité' },
  { value: 'feuille_exercices', label: 'Feuille d\'exercices' },
  { value: 'fiche_eleve', label: 'Fiche élève' },
  { value: 'devoir', label: 'Devoir' },
  { value: 'jeu_pedagogique', label: 'Jeu pédagogique' },
  { value: 'activite_equipe', label: 'Activité en équipe' },
]

export default function NouveauCreerPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ data: WorksheetContent; documentId: string } | null>(null)
  const [form, setForm] = useState({
    type: 'feuille_exercices',
    grade: '',
    subject: '',
    topic: '',
    difficulty: 'moyen',
    questionCount: '8',
    duration: '',
    instructions: '',
  })

  const updateForm = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.grade || !form.subject || !form.topic) {
      toast.error('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/ai/worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, questionCount: parseInt(form.questionCount), duration: form.duration ? parseInt(form.duration) : undefined }),
      })
      if (res.status === 402) { toast.error('Limite de générations atteinte.'); setLoading(false); return }
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResult(data)
      toast.success('Matériel créé et sauvegardé!')
    } catch {
      toast.error('Une erreur est survenue pendant la génération. Réessayez dans quelques secondes.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <GenerationProgress title="Méthodo prépare votre matériel..." steps={['Analyse du sujet...', 'Structuration des questions...', 'Rédaction du matériel...', 'Préparation du corrigé...', 'Finalisation...']} />
  if (result) return <DocumentResult documentId={result.documentId} type="WORKSHEET" title={result.data.title} content={result.data} onReset={() => setResult(null)} />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard"><Button variant="ghost" size="sm" className="mb-4 gap-2 text-stone-500"><ArrowLeft className="h-4 w-4" />Retour</Button></Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100"><FileText className="h-5 w-5 text-blue-600" /></div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Créer du matériel</h1>
            <p className="text-sm text-stone-500">Activité, feuille d&apos;exercices, fiche élève et plus.</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="space-y-2">
          <Label>Type de matériel</Label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => updateForm('type', t.value)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${form.type === t.value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}>
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
          <Input id="topic" placeholder="Ex: Les fractions, Le récit d'aventure..." value={form.topic} onChange={e => updateForm('topic', e.target.value)} required />
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
            <Input type="number" placeholder="30" min={10} max={120} value={form.duration} onChange={e => updateForm('duration', e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="instructions">Instructions particulières (optionnel)</Label>
          <Textarea id="instructions" placeholder="Ex: Inclure des images, adapter pour dyslexiques..." value={form.instructions} onChange={e => updateForm('instructions', e.target.value)} rows={2} />
        </div>
        <Button type="submit" className="w-full gap-2 bg-blue-600 hover:bg-blue-700 h-11"><Sparkles className="h-4 w-4" />Générer le matériel</Button>
      </form>
    </div>
  )
}
