import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ResourceCard, { ResourceCardData } from '@/components/features/resources/ResourceCard'
import { RESOURCE_TYPES, GRADES, GRADE_LABELS, SUBJECTS } from '@/lib/constants'

export default async function CommunautePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const resources = await prisma.sharedResource.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      author: { include: { profile: { select: { firstName: true, lastName: true } } } },
      favorites: { where: { userId: user.id } },
      _count: { select: { favorites: true } },
    },
  })

  const data: ResourceCardData[] = resources.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    type: r.type,
    grades: r.grades,
    subjects: r.subjects,
    downloads: r.downloads,
    favoritesCount: r._count.favorites,
    isFavorited: r.favorites.length > 0,
    isOwn: r.authorId === user.id,
    authorName: r.author.profile
      ? `${r.author.profile.firstName} ${r.author.profile.lastName}`
      : r.author.email,
    createdAt: r.createdAt.toISOString(),
    fileType: r.fileType,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Ressources partagées</h1>
          <p className="mt-1 text-stone-500">
            {data.length > 0 ? `${data.length} ressource${data.length > 1 ? 's' : ''} disponible${data.length > 1 ? 's' : ''}` : 'Soyez le premier à partager une ressource !'}
          </p>
        </div>
        <Link href="/communaute/nouveau">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Partager
          </Button>
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-16 text-center">
          <div className="mx-auto mb-3 text-4xl">📚</div>
          <p className="text-sm font-medium text-stone-600">Aucune ressource pour l&apos;instant.</p>
          <p className="mt-1 text-sm text-stone-400">Partagez votre premier document avec la communauté.</p>
          <Link href="/communaute/nouveau">
            <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-1.5 h-4 w-4" />
              Partager une ressource
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map(r => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  )
}
