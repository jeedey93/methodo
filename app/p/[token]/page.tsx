import { prisma } from '@/lib/db/prisma'
import { WeekGridReadOnly } from '@/components/features/planner/WeekGridReadOnly'
import type { WeekSlot } from '@/components/features/planner/WeekGrid'
import Image from 'next/image'
import { notFound } from 'next/navigation'

interface PortalMessage {
  id: string
  title: string
  body: string
  publishedAt: string
}

export default async function PortailParentPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const portal = await prisma.parentPortal.findUnique({
    where: { token },
    include: {
      user: {
        include: { profile: { select: { firstName: true, lastName: true } } },
      },
    },
  })

  if (!portal || !portal.isActive) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-stone-900 mb-2">Lien inactif</h1>
          <p className="text-stone-500">Ce portail n&apos;est plus actif ou le lien est invalide.</p>
        </div>
      </div>
    )
  }

  // Semaine courante (lundi UTC)
  const now = new Date()
  const day = now.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() + diff)
  monday.setUTCHours(0, 0, 0, 0)
  const nextMonday = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000)

  const weekPlan = await prisma.weekPlan.findFirst({
    where: { userId: portal.userId, weekStart: { gte: monday, lt: nextMonday } },
    select: { title: true, slots: true, weekStart: true },
  })

  const teacherName = portal.user.profile
    ? `${portal.user.profile.firstName} ${portal.user.profile.lastName}`
    : portal.user.email

  const slots: WeekSlot[] = (weekPlan?.slots ?? []) as unknown as WeekSlot[]
  const messages = (portal.messages ?? []) as unknown as PortalMessage[]
  const weekLabel = monday.toLocaleDateString('fr-CA', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg flex-shrink-0">
            <Image src="/logo-icon.jpeg" alt="Méthodo" fill className="object-cover object-center scale-[1.15]" />
          </div>
          <div>
            <p className="text-xs text-stone-400">Portail parents — Méthodo</p>
            <h1 className="text-sm font-semibold text-stone-900">
              {portal.className || `Classe de ${teacherName}`}
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        {/* Semaine */}
        <section>
          <h2 className="text-lg font-bold text-stone-900 mb-4">Semaine du {weekLabel}</h2>
          {weekPlan ? (
            <div className="rounded-xl border border-stone-200 bg-white p-4 overflow-hidden">
              {weekPlan.title && weekPlan.title !== 'Ma semaine' && (
                <p className="text-sm text-stone-500 mb-3">{weekPlan.title}</p>
              )}
              <WeekGridReadOnly slots={slots} />
            </div>
          ) : (
            <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-400">
              Aucune planification pour cette semaine.
            </div>
          )}
        </section>

        {/* Messages */}
        <section>
          <h2 className="text-lg font-bold text-stone-900 mb-4">Communications</h2>
          {messages.length === 0 ? (
            <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-400">
              Aucun message pour le moment.
            </div>
          ) : (
            <div className="space-y-4">
              {[...messages]
                .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                .map(msg => (
                  <div key={msg.id} className="rounded-xl border border-stone-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-stone-900">{msg.title}</h3>
                      <span className="text-xs text-stone-400 whitespace-nowrap">
                        {new Date(msg.publishedAt).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 whitespace-pre-line">{msg.body}</p>
                  </div>
                ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-stone-200 mt-12 py-6 text-center text-xs text-stone-400">
        Portail généré avec <span className="font-medium">Méthodo</span> — plateforme collaborative des enseignants québécois
      </footer>
    </div>
  )
}
