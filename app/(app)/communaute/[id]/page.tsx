import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Heart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { GRADE_LABELS, SUBJECTS, RESOURCE_TYPES } from '@/lib/constants'
import ResourceDetailClient from './ResourceDetailClient'

const SUBJECT_LABELS = Object.fromEntries(SUBJECTS.map(s => [s.value, s.label]))
const TYPE_LABELS = Object.fromEntries(RESOURCE_TYPES.map(t => [t.value, t.label]))
const TYPE_COLORS: Record<string, string> = {
  planification: 'bg-purple-100 text-purple-700',
  materiel: 'bg-blue-100 text-blue-700',
  evaluation: 'bg-orange-100 text-orange-700',
  communication: 'bg-green-100 text-green-700',
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { id } = await params
  const resource = await prisma.sharedResource.findUnique({
    where: { id },
    include: {
      author: { include: { profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
      favorites: { where: { userId: user.id } },
      _count: { select: { favorites: true } },
    },
  })

  if (!resource || !resource.isPublished) notFound()

  const authorName = resource.author.profile
    ? `${resource.author.profile.firstName} ${resource.author.profile.lastName}`
    : resource.author.email

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/communaute">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-stone-500">
            <ArrowLeft className="h-4 w-4" />Communauté
          </Button>
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Badge className={`mb-2 text-xs ${TYPE_COLORS[resource.type] ?? 'bg-stone-100 text-stone-700'}`}>
              {TYPE_LABELS[resource.type] ?? resource.type}
            </Badge>
            <h1 className="text-2xl font-bold text-stone-900">{resource.title}</h1>
            <p className="mt-1 text-sm text-stone-400">
              {resource.isAiGenerated ? (
                <span>Par Méthodo IA</span>
              ) : (
                <>
                  Par{' '}
                  <Link href={`/communaute/profil/${resource.authorId}`} className="hover:text-blue-600 hover:underline transition-colors">
                    {authorName}
                  </Link>
                </>
              )}
              {' '}· {format(new Date(resource.createdAt), 'd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>
      </div>

      {(resource.grades.length > 0 || resource.subjects.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {resource.grades.map(g => (
            <span key={g} className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">
              {GRADE_LABELS[g] ?? g}
            </span>
          ))}
          {resource.subjects.map(s => (
            <span key={s} className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-600">
              {SUBJECT_LABELS[s] ?? s}
            </span>
          ))}
        </div>
      )}

      {resource.description && (
        <p className="text-stone-600">{resource.description}</p>
      )}

      <ResourceDetailClient
        resourceId={resource.id}
        textContent={resource.textContent}
        fileUrl={resource.fileUrl}
        fileName={resource.fileName}
        isFavorited={resource.favorites.length > 0}
        favoritesCount={resource._count.favorites}
        downloads={resource.downloads}
        isOwn={resource.authorId === user.id}
        tags={resource.tags}
      />
    </div>
  )
}
