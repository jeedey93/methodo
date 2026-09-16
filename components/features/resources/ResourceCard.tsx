'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Download, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { GRADE_LABELS, SUBJECTS } from '@/lib/constants'

const TYPE_COLORS: Record<string, string> = {
  planification: 'bg-purple-100 text-purple-700',
  materiel: 'bg-blue-100 text-blue-700',
  evaluation: 'bg-orange-100 text-orange-700',
  communication: 'bg-green-100 text-green-700',
}

const TYPE_LABELS: Record<string, string> = {
  planification: 'Planification',
  materiel: 'Matériel',
  evaluation: 'Évaluation',
  communication: 'Communication',
}

const SUBJECT_LABELS = Object.fromEntries(SUBJECTS.map(s => [s.value, s.label]))

export interface ResourceCardData {
  id: string
  title: string
  description: string
  type: string
  grades: string[]
  subjects: string[]
  downloads: number
  favoritesCount: number
  isFavorited: boolean
  isOwn: boolean
  authorName: string
  createdAt: string
  fileType?: string | null
}

interface Props {
  resource: ResourceCardData
}

export default function ResourceCard({ resource }: Props) {
  const [favorited, setFavorited] = useState(resource.isFavorited)
  const [favCount, setFavCount] = useState(resource.favoritesCount)
  const [toggling, setToggling] = useState(false)

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (toggling) return
    setToggling(true)
    const prev = favorited
    setFavorited(!prev)
    setFavCount(c => c + (prev ? -1 : 1))
    try {
      const res = await fetch(`/api/shared-resources/${resource.id}/favorite`, { method: 'POST' })
      const data = await res.json()
      setFavorited(data.favorited)
    } catch {
      setFavorited(prev)
      setFavCount(c => c + (prev ? 1 : -1))
    } finally {
      setToggling(false)
    }
  }

  return (
    <Link
      href={`/communaute/${resource.id}`}
      className="group flex flex-col rounded-xl border border-stone-200 bg-white p-5 hover:border-stone-300 hover:shadow-sm transition-all"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <Badge className={`text-xs shrink-0 ${TYPE_COLORS[resource.type] ?? 'bg-stone-100 text-stone-700'}`}>
          {TYPE_LABELS[resource.type] ?? resource.type}
        </Badge>
        <button
          onClick={toggleFavorite}
          className="text-stone-400 hover:text-red-500 shrink-0 transition-colors"
          aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`h-4 w-4 ${favorited ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      <h3 className="mb-1 font-semibold text-stone-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
        {resource.title}
      </h3>
      {resource.description && (
        <p className="mb-3 text-sm text-stone-500 line-clamp-2">{resource.description}</p>
      )}

      <div className="mt-auto space-y-2">
        {(resource.grades.length > 0 || resource.subjects.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {resource.grades.map(g => (
              <span key={g} className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600">
                {GRADE_LABELS[g] ?? g}
              </span>
            ))}
            {resource.subjects.slice(0, 2).map(s => (
              <span key={s} className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600">
                {SUBJECT_LABELS[s] ?? s}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>{resource.authorName}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" /> {favCount}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" /> {resource.downloads}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
