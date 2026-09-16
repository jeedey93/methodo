'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GRADES, GRADE_LABELS, SUBJECTS } from '@/lib/constants'
import { LogOut } from 'lucide-react'

export default function ParametresPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [school, setSchool] = useState('')
  const [grades, setGrades] = useState<string[]>([])
  const [subjects, setSubjects] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data.profile) {
          setFirstName(data.profile.firstName ?? '')
          setLastName(data.profile.lastName ?? '')
          setSchool(data.profile.school ?? '')
          setGrades(data.profile.grades ?? [])
          setSubjects(data.profile.subjects ?? [])
        }
        setLoading(false)
      })
  }, [])

  const toggleGrade = (g: string) =>
    setGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])

  const toggleSubject = (s: string) =>
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || grades.length === 0 || subjects.length === 0) {
      toast.error('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, school, grades, subjects }),
    })
    setSaving(false)
    if (res.ok) {
      toast.success('Profil mis à jour')
    } else {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/connexion')
    router.refresh()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-stone-400">Chargement...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Paramètres</h1>
        <p className="mt-1 text-stone-500">Gérez votre profil enseignant.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-stone-900">Informations personnelles</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nom *</Label>
              <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="school">École</Label>
            <Input id="school" value={school} onChange={e => setSchool(e.target.value)} placeholder="Nom de votre école" />
          </div>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-stone-900">Niveaux enseignés *</h2>
          <div className="flex flex-wrap gap-2">
            {GRADES.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGrade(g)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  grades.includes(g)
                    ? 'bg-blue-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {GRADE_LABELS[g]}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
          <h2 className="font-semibold text-stone-900">Matières enseignées *</h2>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleSubject(s.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  subjects.includes(s.value)
                    ? 'bg-blue-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        <Button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700">
          {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
        </Button>
      </form>

      <section className="rounded-xl border border-red-100 bg-white p-5">
        <h2 className="font-semibold text-stone-900 mb-3">Déconnexion</h2>
        <Button variant="outline" onClick={handleSignOut} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </Button>
      </section>
    </div>
  )
}
