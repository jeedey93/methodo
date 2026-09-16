'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageSquare, Sparkles, ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import type { ParentMessageContent } from '@/types/ai'
import DocumentResult from '@/components/features/generation/DocumentResult'
import GenerationProgress from '@/components/features/generation/GenerationProgress'

const TONES = [
  { value: 'chaleureux', label: '🤗 Chaleureux' },
  { value: 'professionnel', label: '💼 Professionnel' },
  { value: 'positif', label: '✨ Positif' },
  { value: 'neutre', label: '📋 Neutre' },
  { value: 'rassurant', label: '🌿 Rassurant' },
]
const LENGTHS = [
  { value: 'courte', label: 'Court' },
  { value: 'moyenne', label: 'Moyen' },
  { value: 'detaillee', label: 'Détaillé' },
]

const PRIVACY_KEYWORDS = ['nom', 'prénom', 'adresse', 'téléphone', 'dossier', 'diagnostic', 'médicament', 'maladie']

function hasPrivacyFlag(text: string): boolean {
  const lower = text.toLowerCase()
  return PRIVACY_KEYWORDS.some(kw => lower.includes(kw))
}

export default function NouveauParentsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ data: ParentMessageContent; documentId: string } | null>(null)
  const [situation, setSituation] = useState('')
  const [tone, setTone] = useState<string>('professionnel')
  const [length, setLength] = useState<string>('moyenne')
  const [privacyWarning, setPrivacyWarning] = useState(false)

  const handleSituationChange = (v: string) => {
    setSituation(v)
    setPrivacyWarning(hasPrivacyFlag(v))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!situation.trim()) { toast.error('Veuillez décrire la situation.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/ai/parent-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, tone, length }),
      })
      if (res.status === 402) { toast.error('Limite de générations atteinte.'); setLoading(false); return }
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResult(data)
      toast.success('Message rédigé et sauvegardé!')
    } catch {
      toast.error('Une erreur est survenue pendant la génération. Réessayez dans quelques secondes.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <GenerationProgress title="Méthodo rédige votre message..." steps={['Analyse de la situation...', 'Adaptation du ton...', 'Rédaction du message...', 'Révision finale...']} />
  if (result) return <DocumentResult documentId={result.documentId} type="PARENT_MESSAGE" title={result.data.subject} content={result.data} onReset={() => setResult(null)} />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard"><Button variant="ghost" size="sm" className="mb-4 gap-2 text-stone-500"><ArrowLeft className="h-4 w-4" />Retour</Button></Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100"><MessageSquare className="h-5 w-5 text-green-600" /></div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Écrire aux parents</h1>
            <p className="text-sm text-stone-500">Décrivez la situation en quelques mots. Méthodo rédige le message.</p>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <strong>Confidentialité :</strong> Ne saisissez pas de renseignements personnels identifiables sur vos élèves (nom complet, adresse, numéro de dossier, diagnostic médical). Méthodo utilise votre description pour générer un message, mais ne connaît pas vos élèves.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="space-y-2">
          <Label htmlFor="situation">Décrivez la situation *</Label>
          <Textarea
            id="situation"
            placeholder="Ex: Un élève a eu de la difficulté avec les problèmes mathématiques cette semaine. Je veux informer ses parents de façon bienveillante et proposer des pistes à la maison."
            value={situation}
            onChange={e => handleSituationChange(e.target.value)}
            rows={4}
            required
            className="resize-none"
          />
          {privacyWarning && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Vérifiez que votre message ne contient pas d&apos;informations personnelles identifiables sur un élève.
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Ton du message</Label>
          <div className="flex flex-wrap gap-2">
            {TONES.map(t => (
              <button key={t.value} type="button" onClick={() => setTone(t.value)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${tone === t.value ? 'border-green-600 bg-green-50 text-green-700' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Longueur</Label>
          <div className="flex gap-2">
            {LENGTHS.map(l => (
              <button key={l.value} type="button" onClick={() => setLength(l.value)}
                className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors ${length === l.value ? 'border-green-600 bg-green-50 text-green-700' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full gap-2 bg-green-600 hover:bg-green-700 h-11"><Sparkles className="h-4 w-4" />Rédiger le message</Button>
      </form>
    </div>
  )
}
