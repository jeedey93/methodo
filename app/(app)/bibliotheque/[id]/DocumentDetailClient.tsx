'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Heart, Download, Trash2, Pencil, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import DocumentResult from '@/components/features/generation/DocumentResult'

const TYPE_LABELS: Record<string, string> = {
  LESSON_PLAN: 'Planification', WORKSHEET: 'Matériel', ASSESSMENT: 'Évaluation', PARENT_MESSAGE: 'Communication',
}
const TYPE_COLORS: Record<string, string> = {
  LESSON_PLAN: 'bg-purple-100 text-purple-700', WORKSHEET: 'bg-blue-100 text-blue-700',
  ASSESSMENT: 'bg-orange-100 text-orange-700', PARENT_MESSAGE: 'bg-green-100 text-green-700',
}

interface DocumentDetailClientProps {
  document: {
    id: string; type: string; title: string; content: unknown; isFavorite: boolean
    metadata: unknown; createdAt: Date; updatedAt: Date
    tags: { tag: { id: string; name: string; color: string } }[]
  }
}

export default function DocumentDetailClient({ document }: DocumentDetailClientProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(document.isFavorite)
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(document.title)
  const [editTitle, setEditTitle] = useState(document.title)

  const toggleFavorite = async () => {
    const newVal = !isFavorite
    setIsFavorite(newVal)
    await fetch(`/api/documents/${document.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFavorite: newVal }),
    })
    toast.success(newVal ? 'Ajouté aux favoris' : 'Retiré des favoris')
  }

  const saveTitle = async () => {
    if (!editTitle.trim()) return
    await fetch(`/api/documents/${document.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle }),
    })
    setTitle(editTitle)
    setEditingTitle(false)
    toast.success('Titre mis à jour')
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer définitivement ce document?')) return
    await fetch(`/api/documents/${document.id}`, { method: 'DELETE' })
    toast.success('Document supprimé')
    router.push('/bibliotheque')
  }

  const handleExportPDF = async () => {
    toast.info('Export PDF en préparation...')
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: document.id }),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url; a.download = `${title}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Erreur lors de l\'export PDF.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/bibliotheque">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-stone-500"><ArrowLeft className="h-4 w-4" />Bibliothèque</Button>
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Badge className={`mb-2 text-xs ${TYPE_COLORS[document.type]}`}>{TYPE_LABELS[document.type]}</Badge>
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 rounded-lg border border-blue-400 px-3 py-1.5 text-xl font-bold text-stone-900 outline-none"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
                />
                <button onClick={saveTitle} className="rounded-lg bg-blue-600 p-1.5 text-white hover:bg-blue-700"><Check className="h-4 w-4" /></button>
                <button onClick={() => setEditingTitle(false)} className="rounded-lg bg-stone-200 p-1.5 text-stone-600 hover:bg-stone-300"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
                <button onClick={() => { setEditTitle(title); setEditingTitle(true) }} className="text-stone-400 hover:text-stone-600">
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}
            <p className="mt-1 text-sm text-stone-400">
              Créé le {format(new Date(document.createdAt), 'd MMMM yyyy', { locale: fr })}
              {document.updatedAt.getTime() !== document.createdAt.getTime() && ` · Modifié le ${format(new Date(document.updatedAt), 'd MMM', { locale: fr })}`}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={toggleFavorite} className="gap-1.5">
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-400'}`} />
              {isFavorite ? 'Favori' : 'Favori'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5">
              <Download className="h-4 w-4" />PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} className="gap-1.5 text-red-600 hover:bg-red-50 hover:border-red-200">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
        <DocumentResult
          documentId={document.id}
          type={document.type}
          title={title}
          content={document.content as any}
          onReset={() => router.push('/bibliotheque')}
        />
      </div>
    </div>
  )
}
