'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { startOfWeek, format } from 'date-fns'
import { fr } from 'date-fns/locale'

function getMonday(dateStr: string): Date {
  const d = new Date(dateStr + 'T12:00:00')
  const monday = startOfWeek(d, { weekStartsOn: 1 })
  monday.setUTCHours(0, 0, 0, 0)
  return monday
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function NouveauForm() {
  const router = useRouter()
  const params = useSearchParams()
  const prefillDate = params.get('weekStart') ?? todayISO()

  const [dateInput, setDateInput] = useState(prefillDate)
  const [title, setTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const monday = getMonday(dateInput)
  const mondayLabel = format(monday, 'd MMMM yyyy', { locale: fr })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/week-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: monday.toISOString(),
          title: title.trim() || `Semaine du ${mondayLabel}`,
        }),
      })
      if (!res.ok) throw new Error()
      const plan = await res.json()
      router.push(`/planificateur/${plan.id}`)
    } catch {
      toast.error('Erreur lors de la création.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
      <div>
        <Link href="/planificateur">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-stone-500">
            <ArrowLeft className="h-4 w-4" />Retour
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-stone-900">Nouvelle semaine</h1>
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Date de la semaine</label>
          <input
            type="date"
            value={dateInput}
            onChange={e => setDateInput(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-stone-400">Semaine du lundi {mondayLabel}</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">Titre <span className="text-stone-400">(optionnel)</span></label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={`Semaine du ${mondayLabel}`}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Link href="/planificateur">
          <Button type="button" variant="outline">Annuler</Button>
        </Link>
        <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
          {submitting ? 'Création...' : 'Créer la semaine'}
        </Button>
      </div>
    </form>
  )
}

export default function NouveauPlanificateurPage() {
  return (
    <Suspense>
      <NouveauForm />
    </Suspense>
  )
}
