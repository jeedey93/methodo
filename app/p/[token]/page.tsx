import { prisma } from '@/lib/db/prisma'
import { WeekGridReadOnly } from '@/components/features/planner/WeekGridReadOnly'
import type { WeekSlot } from '@/components/features/planner/WeekGrid'
import Image from 'next/image'

const DAY_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

interface PortalMessage {
  id: string
  title: string
  body: string
  publishedAt: string
}

interface AgendaItem {
  id: string
  day: string
  subject: string
  note: string
}

export default async function PortailParentPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>
  searchParams: Promise<{ projecteur?: string }>
}) {
  const { token } = await params
  const { projecteur } = await searchParams
  const isProjecteur = projecteur === '1'

  const portal = await prisma.parentPortal.findUnique({
    where: { slug: token },
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
  const agenda = (portal.agenda ?? []) as unknown as AgendaItem[]
  const weekLabel = monday.toLocaleDateString('fr-CA', { month: 'long', day: 'numeric', year: 'numeric' })

  if (isProjecteur) {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              {portal.className || `Classe de ${teacherName}`}
            </h1>
            <p className="text-stone-500">Semaine du {weekLabel}</p>
          </div>
          <div className="relative h-10 w-10 overflow-hidden rounded-xl flex-shrink-0">
            <Image src="/logo-icon.jpeg" alt="Méthodo" fill className="object-cover object-center scale-[1.15]" />
          </div>
        </div>
        {weekPlan ? (
          <div className="flex-1 overflow-auto">
            <WeekGridReadOnly slots={slots} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-stone-400 text-lg">
            Aucune planification pour cette semaine.
          </div>
        )}
      </div>
    )
  }

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

        {/* Agenda */}
        {agenda.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-stone-900 mb-4">Agenda de la semaine</h2>
            <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="text-left px-4 py-2.5 font-semibold text-stone-600 w-28">Jour</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-stone-600">Matière</th>
                    <th className="text-left px-4 py-2.5 font-semibold text-stone-600">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {DAY_ORDER.filter(day => agenda.some(i => i.day === day)).flatMap(day =>
                    agenda.filter(i => i.day === day).map((item, idx) => (
                      <tr key={item.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                        <td className="px-4 py-2.5 text-stone-500 align-top">
                          {idx === 0 ? <span className="font-medium text-stone-700">{day}</span> : ''}
                        </td>
                        <td className="px-4 py-2.5 text-stone-800 align-top font-medium">{item.subject}</td>
                        <td className="px-4 py-2.5 text-stone-500 align-top">{item.note}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

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
