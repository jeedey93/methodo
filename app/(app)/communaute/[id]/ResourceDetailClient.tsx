'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Heart, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  resourceId: string
  textContent: string | null
  fileUrl: string | null
  fileName: string | null
  isFavorited: boolean
  favoritesCount: number
  downloads: number
  isOwn: boolean
  tags: string[]
}

export default function ResourceDetailClient({
  resourceId, textContent, fileUrl, fileName,
  isFavorited, favoritesCount, downloads, isOwn, tags,
}: Props) {
  const router = useRouter()
  const [favorited, setFavorited] = useState(isFavorited)
  const [favCount, setFavCount] = useState(favoritesCount)
  const [dlCount, setDlCount] = useState(downloads)

  const toggleFavorite = async () => {
    const prev = favorited
    setFavorited(!prev)
    setFavCount(c => c + (prev ? -1 : 1))
    try {
      const res = await fetch(`/api/shared-resources/${resourceId}/favorite`, { method: 'POST' })
      const data = await res.json()
      setFavorited(data.favorited)
    } catch {
      setFavorited(prev)
      setFavCount(c => c + (prev ? 1 : -1))
      toast.error('Erreur')
    }
  }

  const handleDownload = async () => {
    await fetch(`/api/shared-resources/${resourceId}?download=true`)
    setDlCount(c => c + 1)
    if (fileUrl) {
      window.open(fileUrl, '_blank')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer définitivement cette ressource?')) return
    await fetch(`/api/shared-resources/${resourceId}`, { method: 'DELETE' })
    toast.success('Ressource supprimée')
    router.push('/communaute')
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={toggleFavorite} className="gap-2">
          <Heart className={`h-4 w-4 ${favorited ? 'fill-red-500 text-red-500' : 'text-stone-400'}`} />
          {favorited ? 'Favori' : 'Ajouter aux favoris'}
          <span className="text-stone-400">({favCount})</span>
        </Button>
        {fileUrl && (
          <Button onClick={handleDownload} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Télécharger {fileName ? `(${fileName})` : ''}
            <span className="text-blue-200">({dlCount})</span>
          </Button>
        )}
        {isOwn && (
          <Button
            variant="outline"
            onClick={handleDelete}
            className="ml-auto gap-2 text-red-600 hover:bg-red-50 hover:border-red-200"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(t => (
            <span key={t} className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Text content */}
      {textContent && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-3 text-sm font-medium text-stone-500 uppercase tracking-wide">Contenu</h2>
          <pre className="whitespace-pre-wrap text-sm text-stone-700 font-sans leading-relaxed">{textContent}</pre>
        </div>
      )}

      {!textContent && !fileUrl && (
        <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 p-8 text-center text-stone-400 text-sm">
          Aucun contenu disponible.
        </div>
      )}
    </div>
  )
}
