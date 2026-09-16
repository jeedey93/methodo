import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import WeekGrid, { WeekSlot } from '@/components/features/planner/WeekGrid'
import WeekNavClient from './WeekNavClient'

export default async function WeekPlanPage({ params }: { params: Promise<{ weekId: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { weekId } = await params
  const plan = await prisma.weekPlan.findUnique({ where: { id: weekId } })
  if (!plan || plan.userId !== user.id) notFound()

  const slots = (Array.isArray(plan.slots) ? plan.slots : []) as unknown as WeekSlot[]

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <Link href="/planificateur">
            <Button variant="ghost" size="sm" className="mb-2 gap-2 text-stone-500">
              <ArrowLeft className="h-4 w-4" />Planificateur
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-stone-900">{plan.title}</h1>
          <p className="text-sm text-stone-400">
            Semaine du {format(new Date(plan.weekStart), 'd MMMM yyyy', { locale: fr })}
          </p>
        </div>
        <WeekNavClient planId={weekId} weekStart={plan.weekStart.toISOString()} />
      </div>

      <WeekGrid planId={weekId} initialSlots={slots} />
    </div>
  )
}
