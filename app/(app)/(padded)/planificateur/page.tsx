import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Calendar, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format, startOfWeek, addWeeks } from 'date-fns'
import { fr } from 'date-fns/locale'

function getMonday(date: Date): Date {
  const d = startOfWeek(date, { weekStartsOn: 1 })
  d.setUTCHours(0, 0, 0, 0)
  return d
}

export default async function PlanificateurPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const recentPlans = await prisma.weekPlan.findMany({
    where: { userId: user.id },
    orderBy: { weekStart: 'desc' },
    take: 8,
  })

  const thisWeekMonday = getMonday(new Date())
  const nextWeekMonday = getMonday(addWeeks(new Date(), 1))

  const thisWeekPlan = recentPlans.find(p => {
    const d = new Date(p.weekStart)
    return d.toISOString().slice(0, 10) === thisWeekMonday.toISOString().slice(0, 10)
  })

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Planificateur hebdomadaire</h1>
          <p className="mt-1 text-stone-500">Organisez votre semaine de cours.</p>
        </div>
        <Link href="/planificateur/nouveau">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Nouvelle semaine
          </Button>
        </Link>
      </div>

      {/* Cette semaine */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-stone-500 uppercase tracking-wide">Cette semaine</h2>
        {thisWeekPlan ? (
          <Link
            href={`/planificateur/${thisWeekPlan.id}`}
            className="flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 hover:shadow-sm transition-all"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-stone-900">{thisWeekPlan.title}</p>
              <p className="text-sm text-stone-500">
                Semaine du {format(new Date(thisWeekPlan.weekStart), 'd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-stone-400" />
          </Link>
        ) : (
          <Link
            href={`/planificateur/nouveau?weekStart=${thisWeekMonday.toISOString().slice(0, 10)}`}
            className="flex items-center gap-4 rounded-xl border border-dashed border-stone-300 bg-white p-4 hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <div className="h-10 w-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
              <Plus className="h-5 w-5 text-stone-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-stone-600">Créer la planification de cette semaine</p>
              <p className="text-sm text-stone-400">
                Semaine du {format(thisWeekMonday, 'd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </Link>
        )}
      </section>

      {/* Semaines récentes */}
      {recentPlans.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-stone-500 uppercase tracking-wide">Semaines récentes</h2>
          <div className="space-y-2">
            {recentPlans.map(plan => (
              <Link
                key={plan.id}
                href={`/planificateur/${plan.id}`}
                className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 hover:border-stone-300 hover:shadow-sm transition-all"
              >
                <div className="h-9 w-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-stone-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-900">{plan.title}</p>
                  <p className="text-sm text-stone-400">
                    Semaine du {format(new Date(plan.weekStart), 'd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-stone-400" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentPlans.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
            <Calendar className="h-6 w-6 text-stone-400" />
          </div>
          <p className="text-sm font-medium text-stone-600">Aucune planification pour l&apos;instant.</p>
          <p className="mt-1 text-sm text-stone-400">Créez votre première planification hebdomadaire.</p>
          <Link href={`/planificateur/nouveau?weekStart=${thisWeekMonday.toISOString().slice(0, 10)}`}>
            <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-1.5 h-4 w-4" />
              Créer cette semaine
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
