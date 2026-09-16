import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Plus, Heart, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const TYPE_LABELS: Record<string, string> = {
  LESSON_PLAN: 'Planification', WORKSHEET: 'Matériel', ASSESSMENT: 'Évaluation', PARENT_MESSAGE: 'Communication',
}
const TYPE_COLORS: Record<string, string> = {
  LESSON_PLAN: 'bg-purple-100 text-purple-700', WORKSHEET: 'bg-blue-100 text-blue-700',
  ASSESSMENT: 'bg-orange-100 text-orange-700', PARENT_MESSAGE: 'bg-green-100 text-green-700',
}
const TYPE_ICONS: Record<string, string> = {
  LESSON_PLAN: '📘', WORKSHEET: '📄', ASSESSMENT: '📝', PARENT_MESSAGE: '💬',
}

export default async function BibliothequePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: { tags: { include: { tag: true } } },
  })

  const byType = {
    LESSON_PLAN: documents.filter(d => d.type === 'LESSON_PLAN'),
    WORKSHEET: documents.filter(d => d.type === 'WORKSHEET'),
    ASSESSMENT: documents.filter(d => d.type === 'ASSESSMENT'),
    PARENT_MESSAGE: documents.filter(d => d.type === 'PARENT_MESSAGE'),
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Ma bibliothèque</h1>
          <p className="mt-1 text-stone-500 text-sm">
            {documents.length} document{documents.length !== 1 ? 's' : ''} · Tout votre matériel en un seul endroit.
          </p>
        </div>
        <Link href="/creer">
          <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-sm">
            <Plus className="h-4 w-4" />Nouveau
          </Button>
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
            <BookOpen className="h-8 w-8 text-stone-300" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-stone-900">Votre bibliothèque commence ici.</h2>
          <p className="mb-6 text-sm text-stone-500">Créez votre première activité et retrouvez-la ici pour toujours.</p>
          <Link href="/creer">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-1.5 h-4 w-4" />Créer un document
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {(Object.entries(byType) as [string, typeof documents][])
            .filter(([, docs]) => docs.length > 0)
            .map(([type, docs]) => (
              <div key={type}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-lg">{TYPE_ICONS[type]}</span>
                  <h2 className="font-semibold text-stone-800">{TYPE_LABELS[type]}</h2>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">{docs.length}</span>
                  <div className="flex-1 h-px bg-stone-100" />
                  <Link href="/creer">
                    <Button variant="ghost" size="sm" className="gap-1 text-stone-400 hover:text-stone-700 h-7 text-xs">
                      <Plus className="h-3.5 w-3.5" />Nouveau
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {docs.map(doc => {
                    const meta = doc.metadata as Record<string, string>
                    return (
                      <Link key={doc.id} href={`/bibliotheque/${doc.id}`}
                        className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white p-4 hover:border-stone-300 hover:shadow-md transition-all">
                        <div className={`absolute inset-x-0 top-0 h-0.5 ${TYPE_COLORS[type].includes('purple') ? 'bg-purple-300' : TYPE_COLORS[type].includes('blue') ? 'bg-blue-300' : TYPE_COLORS[type].includes('orange') ? 'bg-orange-300' : 'bg-green-300'}`} />
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-stone-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2 text-sm">
                            {doc.title}
                          </h3>
                          {doc.isFavorite && <Heart className="h-4 w-4 fill-red-400 text-red-400 shrink-0" />}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {meta.grade && <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-500">{meta.grade}e année</span>}
                          {meta.subject && <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-500 capitalize">{(meta.subject as string).replace('_', ' ')}</span>}
                          {doc.tags.slice(0, 2).map(t => (
                            <span key={t.tag.id} className="rounded-md px-2 py-0.5 text-xs font-medium"
                              style={{ backgroundColor: t.tag.color + '22', color: t.tag.color }}>
                              {t.tag.name}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-stone-400">
                          <Clock className="h-3 w-3" />
                          {format(new Date(doc.updatedAt), 'd MMMM yyyy', { locale: fr })}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
