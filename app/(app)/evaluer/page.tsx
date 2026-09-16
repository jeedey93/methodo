import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BarChart3, Plus } from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function EvaluerPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')
  const docs = await prisma.document.findMany({ where: { userId: user.id, type: 'ASSESSMENT' }, orderBy: { updatedAt: 'desc' }, take: 10 })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100"><BarChart3 className="h-5 w-5 text-orange-600" /></div>
          <div><h1 className="text-xl font-bold text-stone-900">Évaluations</h1><p className="text-sm text-stone-500">Vos quiz, contrôles et évaluations</p></div>
        </div>
        <Link href="/evaluer/nouveau"><Button className="gap-1.5 bg-orange-600 hover:bg-orange-700"><Plus className="h-4 w-4" />Nouvelle évaluation</Button></Link>
      </div>
      {docs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100"><BarChart3 className="h-6 w-6 text-orange-400" /></div>
          <p className="text-sm font-medium text-stone-600">Aucune évaluation pour l&apos;instant.</p>
          <Link href="/evaluer/nouveau"><Button size="sm" className="mt-4 bg-orange-600 hover:bg-orange-700"><Plus className="mr-1.5 h-4 w-4" />Créer une évaluation</Button></Link>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((d: (typeof docs)[0]) => (
            <Link key={d.id} href={`/bibliotheque/${d.id}`} className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 hover:shadow-sm transition-all">
              <p className="flex-1 font-medium text-stone-900">{d.title}</p>
              <span className="text-xs text-stone-400">{format(new Date(d.updatedAt), 'd MMM', { locale: fr })}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
