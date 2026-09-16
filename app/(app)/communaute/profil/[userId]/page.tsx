import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GRADE_LABELS, SUBJECTS, RESOURCE_TYPES } from '@/lib/constants'
import ResourceCard, { ResourceCardData } from '@/components/features/resources/ResourceCard'

const SUBJECT_LABELS = Object.fromEntries(SUBJECTS.map(s => [s.value, s.label]))

export default async function CommunauteProfilPage({ params }: { params: Promise<{ userId: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user: me } } = await supabase.auth.getUser()
  if (!me) redirect('/connexion')

  const { userId } = await params

  const target = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        select: { firstName: true, lastName: true, school: true, grades: true, subjects: true, avatarUrl: true },
      },
    },
  })

  if (!target || !target.profile) notFound()

  const resources = await prisma.sharedResource.findMany({
    where: { authorId: userId, isPublished: true, isAiGenerated: false },
    orderBy: { createdAt: 'desc' },
    include: {
      favorites: { where: { userId: me.id } },
      _count: { select: { favorites: true } },
    },
  })

  const { firstName, lastName, school, grades, subjects, avatarUrl } = target.profile
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase()

  const resourceCards: ResourceCardData[] = resources.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    type: r.type,
    grades: r.grades,
    subjects: r.subjects,
    downloads: r.downloads,
    favoritesCount: r._count.favorites,
    isFavorited: r.favorites.length > 0,
    isOwn: r.authorId === me.id,
    isAiGenerated: false,
    authorId: userId,
    authorName: `${firstName} ${lastName}`,
    createdAt: r.createdAt.toISOString(),
    fileType: r.fileType,
  }))

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link href="/communaute">
          <Button variant="ghost" size="sm" className="mb-4 gap-2 text-stone-500">
            <ArrowLeft className="h-4 w-4" />Communauté
          </Button>
        </Link>

        {/* Carte profil */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 flex items-start gap-5">
          <div className="shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${firstName} ${lastName}`}
                width={72}
                height={72}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="h-18 w-18 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600" style={{ width: 72, height: 72 }}>
                {initials}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-stone-900">{firstName} {lastName}</h1>
            {school && <p className="text-sm text-stone-500 mt-0.5">{school}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {grades.map(g => (
                <span key={g} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {GRADE_LABELS[g] ?? g}
                </span>
              ))}
              {subjects.map(s => (
                <span key={s} className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-600">
                  {SUBJECT_LABELS[s] ?? s}
                </span>
              ))}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-bold text-stone-900">{resources.length}</p>
            <p className="text-xs text-stone-400">ressource{resources.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Ressources partagées */}
      <div>
        <h2 className="text-sm font-semibold text-stone-700 mb-4">
          Ressources partagées par {firstName}
        </h2>
        {resourceCards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <p className="text-sm text-stone-500">Aucune ressource partagée pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {resourceCards.map(r => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
