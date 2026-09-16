'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Heart, Download, Trash2, Pencil, Check, X, Share2, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import DocumentResult from '@/components/features/generation/DocumentResult'
import { GRADES, GRADE_LABELS, SUBJECTS } from '@/lib/constants'

const TYPE_LABELS: Record<string, string> = {
  LESSON_PLAN: 'Planification', WORKSHEET: 'Matériel', ASSESSMENT: 'Évaluation', PARENT_MESSAGE: 'Communication',
}
const TYPE_COLORS: Record<string, string> = {
  LESSON_PLAN: 'bg-purple-100 text-purple-700', WORKSHEET: 'bg-blue-100 text-blue-700',
  ASSESSMENT: 'bg-orange-100 text-orange-700', PARENT_MESSAGE: 'bg-green-100 text-green-700',
}
const DOC_TYPE_TO_RESOURCE_TYPE: Record<string, string> = {
  LESSON_PLAN: 'planification', WORKSHEET: 'materiel', ASSESSMENT: 'evaluation', PARENT_MESSAGE: 'communication',
}

interface DocumentDetailClientProps {
  document: {
    id: string; type: string; title: string; content: unknown; isFavorite: boolean
    metadata: unknown; createdAt: Date; updatedAt: Date
    tags: { tag: { id: string; name: string; color: string } }[]
  }
}

function ShareModal({
  documentId,
  documentTitle,
  documentType,
  documentContent,
  onClose,
  onShared,
}: {
  documentId: string
  documentTitle: string
  documentType: string
  documentContent: unknown
  onClose: () => void
  onShared: (resourceId: string) => void
}) {
  const [grades, setGrades] = useState<string[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [sharing, setSharing] = useState(false)

  const toggle = <T extends string>(arr: T[], val: T, set: (v: T[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const handleShare = async () => {
    setSharing(true)
    const contentText = typeof documentContent === 'object' && documentContent !== null
      ? Object.values(documentContent as Record<string, unknown>)
          .filter(v => typeof v === 'string')
          .join('\n\n')
      : String(documentContent)

    const res = await fetch('/api/shared-resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: documentTitle,
        description: description.trim(),
        type: DOC_TYPE_TO_RESOURCE_TYPE[documentType] ?? 'materiel',
        grades,
        subjects,
        tags: [],
        textContent: contentText,
      }),
    })
    if (res.ok) {
      const resource = await res.json()
      // Sauvegarde l'ID dans les métadonnées du document
      await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: { sharedResourceId: resource.id } }),
      })
      onShared(resource.id)
      toast.success('Partagé à la communauté!')
    } else {
      toast.error('Erreur lors du partage.')
    }
    setSharing(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Partager à la communauté</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="rounded-lg bg-stone-50 border border-stone-200 px-4 py-3">
          <p className="text-sm font-medium text-stone-800 truncate">{documentTitle}</p>
          <p className="text-xs text-stone-400 mt-0.5">{TYPE_LABELS[documentType]}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Description <span className="text-stone-400 font-normal">(optionnel)</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Décrivez brièvement ce document pour aider vos collègues..."
            rows={2}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-stone-700 mb-2">
            Niveaux <span className="text-stone-400 font-normal">(optionnel)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {GRADES.map(g => (
              <button key={g} type="button" onClick={() => toggle(grades, g, setGrades)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${grades.includes(g) ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                {GRADE_LABELS[g]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-stone-700 mb-2">
            Matières <span className="text-stone-400 font-normal">(optionnel)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(s => (
              <button key={s.value} type="button" onClick={() => toggle(subjects, s.value, setSubjects)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${subjects.includes(s.value) ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={handleShare} disabled={sharing} className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2">
            <Share2 className="h-4 w-4" />
            {sharing ? 'Partage...' : 'Partager'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DocumentDetailClient({ document }: DocumentDetailClientProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(document.isFavorite)
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(document.title)
  const [editTitle, setEditTitle] = useState(document.title)
  const [showShare, setShowShare] = useState(false)

  const meta = (document.metadata ?? {}) as Record<string, unknown>
  const [sharedResourceId, setSharedResourceId] = useState<string | null>(
    typeof meta.sharedResourceId === 'string' ? meta.sharedResourceId : null
  )

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
    toast.info('Ouverture pour impression...')
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: document.id }),
      })
      if (!res.ok) throw new Error()
      const html = await res.text()
      const win = window.open('', '_blank')
      if (!win) throw new Error()
      win.document.write(html)
      win.document.close()
      win.focus()
      setTimeout(() => win.print(), 500)
    } catch {
      toast.error('Erreur lors de l\'export PDF.')
    }
  }

  const handleUnshare = async () => {
    if (!sharedResourceId) return
    if (!confirm('Retirer ce document de la communauté?')) return
    const res = await fetch(`/api/shared-resources/${sharedResourceId}`, { method: 'DELETE' })
    if (res.ok) {
      // Efface la référence dans les métadonnées
      await fetch(`/api/documents/${document.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: {} }),
      })
      setSharedResourceId(null)
      toast.success('Retiré de la communauté')
    } else {
      toast.error('Erreur lors du retrait.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {showShare && (
        <ShareModal
          documentId={document.id}
          documentTitle={title}
          documentType={document.type}
          documentContent={document.content}
          onClose={() => setShowShare(false)}
          onShared={id => { setSharedResourceId(id); setShowShare(false) }}
        />
      )}

      {/* Header */}
      <div>
        <Link href="/bibliotheque">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-stone-500">
            <ArrowLeft className="h-4 w-4" />Bibliothèque
          </Button>
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`text-xs ${TYPE_COLORS[document.type]}`}>{TYPE_LABELS[document.type]}</Badge>
              {sharedResourceId && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                  ✓ Partagé
                </span>
              )}
            </div>
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
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={toggleFavorite} className="gap-1.5">
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-400'}`} />
              {isFavorite ? 'Favori' : 'Favori'}
            </Button>
            {sharedResourceId ? (
              <Button variant="outline" size="sm" onClick={handleUnshare} className="gap-1.5 text-stone-600">
                <EyeOff className="h-4 w-4" />Retirer
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowShare(true)} className="gap-1.5">
                <Share2 className="h-4 w-4" />Partager
              </Button>
            )}
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
