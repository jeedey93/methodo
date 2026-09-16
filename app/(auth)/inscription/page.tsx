'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const GRADES = ['1', '2', '3', '4', '5', '6']
const GRADE_LABELS: Record<string, string> = { '1': '1re année', '2': '2e année', '3': '3e année', '4': '4e année', '5': '5e année', '6': '6e année' }
const SUBJECTS = [
  { value: 'francais', label: 'Français' },
  { value: 'mathematiques', label: 'Mathématiques' },
  { value: 'sciences', label: 'Sciences et technologie' },
  { value: 'univers_social', label: 'Univers social' },
  { value: 'arts_plastiques', label: 'Arts plastiques' },
  { value: 'education_physique', label: 'Éducation physique' },
  { value: 'anglais', label: 'Anglais' },
]

export default function InscriptionPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    grades: [] as string[],
    subjects: [] as string[],
  })

  const updateForm = (field: string, value: string | string[]) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const toggleItem = (field: 'grades' | 'subjects', value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }))
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password || form.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || form.grades.length === 0 || form.subjects.length === 0) {
      toast.error('Veuillez compléter tous les champs requis.')
      return
    }
    setLoading(true)

    const supabase = createSupabaseBrowserClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { firstName: form.firstName, lastName: form.lastName },
      },
    })

    if (authError || !authData.user) {
      toast.error(authError?.message ?? 'Une erreur est survenue lors de la création du compte.')
      setLoading(false)
      return
    }

    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        grades: form.grades,
        subjects: form.subjects,
      }),
    })

    if (!response.ok) {
      toast.error('Compte créé, mais profil non sauvegardé. Complétez-le dans les paramètres.')
    }

    toast.success('Compte créé avec succès! Bienvenue dans Méthodo.')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-stone-900">Créer un compte</h1>
        <p className="mt-2 text-stone-500">
          {step === 1 ? 'Commençons par vos informations de connexion.' : 'Dites-nous qui vous êtes pour personnaliser Méthodo.'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2">
        <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-stone-200'}`} />
        <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-stone-200'}`} />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        {step === 1 ? (
          <form onSubmit={handleStep1} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Courriel professionnel</Label>
              <Input
                id="email"
                type="email"
                placeholder="prenom@ecole.qc.ca"
                value={form.email}
                onChange={e => updateForm('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Au moins 6 caractères"
                value={form.password}
                onChange={e => updateForm('password', e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Continuer →
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  placeholder="Jennifer"
                  value={form.firstName}
                  onChange={e => updateForm('firstName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  placeholder="Villeneuve"
                  value={form.lastName}
                  onChange={e => updateForm('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Niveau(x) enseigné(s)</Label>
              <div className="flex flex-wrap gap-2">
                {GRADES.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleItem('grades', g)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      form.grades.includes(g)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {GRADE_LABELS[g]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Matière(s) enseignée(s)</Label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleItem('subjects', s.value)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      form.subjects.includes(s.value)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                ← Retour
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? 'Création...' : 'Créer mon compte'}
              </Button>
            </div>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-stone-500">
        Déjà un compte?{' '}
        <Link href="/connexion" className="text-blue-600 hover:underline font-medium">
          Se connecter
        </Link>
      </p>
      <p className="mt-4 text-center text-xs text-stone-400">
        En créant un compte, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité.
      </p>
    </div>
  )
}
