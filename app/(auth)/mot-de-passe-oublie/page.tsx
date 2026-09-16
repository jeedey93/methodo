'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    })
    if (error) {
      toast.error('Une erreur est survenue. Réessayez.')
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mb-4 text-4xl">📬</div>
        <h1 className="mb-2 text-2xl font-bold text-stone-900">Courriel envoyé</h1>
        <p className="mb-6 text-stone-500">
          Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien pour réinitialiser votre mot de passe.
        </p>
        <Link href="/connexion">
          <Button variant="outline" className="w-full">Retour à la connexion</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-stone-900">Mot de passe oublié</h1>
        <p className="mt-2 text-stone-500">Entrez votre courriel pour recevoir un lien de réinitialisation.</p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Courriel</Label>
            <Input
              id="email"
              type="email"
              placeholder="prenom@ecole.qc.ca"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-stone-500">
        <Link href="/connexion" className="text-blue-600 hover:underline font-medium">
          Retour à la connexion
        </Link>
      </p>
    </div>
  )
}
