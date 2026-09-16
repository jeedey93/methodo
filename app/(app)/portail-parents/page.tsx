'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Copy, Check, Plus, Trash2, Eye, EyeOff, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PortalMessage {
  id: string
  title: string
  body: string
  publishedAt: string
}

interface Portal {
  id: string
  slug: string
  className: string
  messages: PortalMessage[]
  isActive: boolean
}

export default function PortailParentsPage() {
  const [portal, setPortal] = useState<Portal | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [className, setClassName] = useState('')
  const [savingClass, setSavingClass] = useState(false)
  const [editingSlug, setEditingSlug] = useState(false)
  const [slugInput, setSlugInput] = useState('')
  const [savingSlug, setSavingSlug] = useState(false)
  const [showNewMsg, setShowNewMsg] = useState(false)
  const [msgTitle, setMsgTitle] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [savingMsg, setSavingMsg] = useState(false)

  useEffect(() => {
    fetch('/api/parent-portal')
      .then(r => r.json())
      .then(data => {
        setPortal(data)
        setClassName(data.className ?? '')
        setSlugInput(data.slug ?? '')
        setLoading(false)
      })
  }, [])

  const portalUrl = portal ? `${window.location.origin}/p/${portal.slug}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Lien copié!')
  }

  const handleToggleActive = async () => {
    if (!portal) return
    const updated = await fetch('/api/parent-portal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !portal.isActive }),
    }).then(r => r.json())
    setPortal(updated)
    toast.success(updated.isActive ? 'Portail activé' : 'Portail désactivé')
  }

  const handleSaveSlug = async () => {
    if (!portal || !slugInput.trim()) return
    setSavingSlug(true)
    const res = await fetch('/api/parent-portal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: slugInput.trim() }),
    })
    const data = await res.json()
    setSavingSlug(false)
    if (res.status === 409) {
      toast.error('Ce lien est déjà utilisé par un autre enseignant.')
      return
    }
    if (!res.ok) {
      toast.error('Lien invalide — utilisez seulement des lettres, chiffres et tirets.')
      return
    }
    setPortal(data)
    setSlugInput(data.slug)
    setEditingSlug(false)
    toast.success('Lien mis à jour')
  }

  const handleSaveClass = async () => {
    if (!portal) return
    setSavingClass(true)
    const updated = await fetch('/api/parent-portal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ className }),
    }).then(r => r.json())
    setPortal(updated)
    setSavingClass(false)
    toast.success('Nom de classe sauvegardé')
  }

  const handleAddMessage = async () => {
    if (!portal || !msgTitle.trim() || !msgBody.trim()) return
    setSavingMsg(true)
    const newMsg: PortalMessage = {
      id: crypto.randomUUID(),
      title: msgTitle.trim(),
      body: msgBody.trim(),
      publishedAt: new Date().toISOString(),
    }
    const updated = await fetch('/api/parent-portal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...portal.messages, newMsg] }),
    }).then(r => r.json())
    setPortal(updated)
    setMsgTitle('')
    setMsgBody('')
    setShowNewMsg(false)
    setSavingMsg(false)
    toast.success('Message publié')
  }

  const handleDeleteMessage = async (id: string) => {
    if (!portal) return
    const updated = await fetch('/api/parent-portal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: portal.messages.filter(m => m.id !== id) }),
    }).then(r => r.json())
    setPortal(updated)
    toast.success('Message supprimé')
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-stone-400">Chargement...</div>
  }

  if (!portal) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Portail parents</h1>
        <p className="mt-1 text-stone-500">Partagez ce lien avec les parents pour qu&apos;ils voient votre semaine et vos communications.</p>
      </div>

      {/* Lien du portail */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Lien du portail</h2>
          <button
            onClick={handleToggleActive}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
              portal.isActive
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {portal.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {portal.isActive ? 'Actif' : 'Inactif'}
          </button>
        </div>

        {editingSlug ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2">
              <span className="text-sm text-stone-400 shrink-0">{window.location.origin}/p/</span>
              <input
                value={slugInput}
                onChange={e => setSlugInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveSlug() }}
                className="flex-1 bg-transparent text-sm text-stone-800 focus:outline-none"
                autoFocus
              />
            </div>
            <p className="text-xs text-stone-400">Lettres, chiffres et tirets seulement. Les accents seront convertis automatiquement.</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveSlug} disabled={savingSlug} className="bg-blue-600 hover:bg-blue-700">
                {savingSlug ? 'Sauvegarde...' : 'Confirmer'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditingSlug(false); setSlugInput(portal.slug) }}>
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-700 truncate">
              {portalUrl}
            </code>
            <Button size="sm" variant="outline" onClick={() => setEditingSlug(true)} className="gap-1.5 shrink-0">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 shrink-0">
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copié' : 'Copier'}
            </Button>
          </div>
        )}
      </section>

      {/* Nom de la classe */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold text-stone-900">Nom de la classe</h2>
        <p className="text-sm text-stone-500">Affiché en haut du portail (ex: Classe de Mme Tremblay — 3e année).</p>
        <div className="flex items-center gap-2">
          <input
            value={className}
            onChange={e => setClassName(e.target.value)}
            placeholder="ex: Classe de Mme Tremblay — 3e année"
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <Button size="sm" onClick={handleSaveClass} disabled={savingClass} className="bg-blue-600 hover:bg-blue-700 shrink-0">
            {savingClass ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </section>

      {/* Messages */}
      <section className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Communications aux parents</h2>
          <Button size="sm" onClick={() => setShowNewMsg(true)} className="gap-1.5 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-3.5 w-3.5" /> Nouveau message
          </Button>
        </div>

        {showNewMsg && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
            <input
              value={msgTitle}
              onChange={e => setMsgTitle(e.target.value)}
              placeholder="Titre du message..."
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <textarea
              value={msgBody}
              onChange={e => setMsgBody(e.target.value)}
              placeholder="Contenu du message..."
              rows={4}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddMessage} disabled={savingMsg || !msgTitle.trim() || !msgBody.trim()} className="bg-blue-600 hover:bg-blue-700">
                {savingMsg ? 'Publication...' : 'Publier'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowNewMsg(false); setMsgTitle(''); setMsgBody('') }}>
                Annuler
              </Button>
            </div>
          </div>
        )}

        {portal.messages.length === 0 && !showNewMsg && (
          <p className="text-sm text-stone-400 text-center py-4">Aucun message publié.</p>
        )}

        <div className="space-y-3">
          {[...portal.messages]
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
            .map(msg => (
              <div key={msg.id} className="flex items-start gap-3 rounded-lg border border-stone-100 p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="font-medium text-sm text-stone-900 truncate">{msg.title}</p>
                    <span className="text-xs text-stone-400 shrink-0">
                      {new Date(msg.publishedAt).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 mt-0.5 line-clamp-2">{msg.body}</p>
                </div>
                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="text-stone-300 hover:text-red-500 shrink-0 mt-0.5"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}
