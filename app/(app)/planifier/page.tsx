import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, Plus } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function PlanifierPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const plans = await prisma.document.findMany({
    where: { userId: user.id, type: 'LESSON_PLAN' },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100"><Brain className="h-5 w-5 text-purple-600" /></div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">Planifier</h1>
            <p className="text-sm text-stone-500">Vos planifications de cours</p>
          </div>
        </div>
        <Link href="/planifier/nouveau">
          <Button className="gap-1.5 bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4" />Nouvelle planification</Button>
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <Brain className="h-6 w-6 text-purple-400" />
          </div>
          <p className="text-sm font-medium text-stone-600">Aucune planification pour l&apos;instant.</p>
          <p className="mt-1 text-sm text-stone-400">Créez votre première planification de cours.</p>
          <Link href="/planifier/nouveau">
            <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700"><Plus className="mr-1.5 h-4 w-4" />Créer une planification</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {plans.map((p: (typeof plans)[0]) => {
            const meta = p.metadata as Record<string, string>
            return (
              <Link key={p.id} href={`/bibliotheque/${p.id}`}
                className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 hover:border-stone-300 hover:shadow-sm transition-all">
                <div className="flex-1">
                  <p className="font-medium text-stone-900">{p.title}</p>
                  <p className="text-xs text-stone-400">{meta.grade && `${meta.grade}e année`} {meta.subject && `· ${meta.subject.replace('_', ' ')}`}</p>
                </div>
                <span className="text-xs text-stone-400">{format(new Date(p.updatedAt), 'd MMM', { locale: fr })}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
