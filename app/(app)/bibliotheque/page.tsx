import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Plus, Heart, Clock, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const TYPE_LABELS: Record<string, string> = {
  LESSON_PLAN: 'Planification', WORKSHEET: 'Matériel', ASSESSMENT: 'Évaluation', PARENT_MESSAGE: 'Communication',
}
const TYPE_COLORS: Record<string, string> = {
  LESSON_PLAN: 'bg-purple-100 text-purple-700', WORKSHEET: 'bg-blue-100 text-blue-700',
  ASSESSMENT: 'bg-orange-100 text-orange-700', PARENT_MESSAGE: 'bg-green-100 text-green-700',
}
const TYPE_HREFS: Record<string, string> = {
  LESSON_PLAN: '/planifier/nouveau', WORKSHEET: '/creer/nouveau',
  ASSESSMENT: '/evaluer/nouveau', PARENT_MESSAGE: '/parents/nouveau',
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
    LESSON_PLAN: documents.filter((d: typeof documents[0]) => d.type === 'LESSON_PLAN'),
    WORKSHEET: documents.filter((d: typeof documents[0]) => d.type === 'WORKSHEET'),
    ASSESSMENT: documents.filter((d: typeof documents[0]) => d.type === 'ASSESSMENT'),
    PARENT_MESSAGE: documents.filter((d: typeof documents[0]) => d.type === 'PARENT_MESSAGE'),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Ma bibliothèque</h1>
          <p className="text-stone-500">{documents.length} document{documents.length !== 1 ? 's' : ''} · Tout votre matériel en un seul endroit.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/planifier/nouveau"><Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4" />Nouveau</Button></Link>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
            <BookOpen className="h-8 w-8 text-stone-400" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-stone-900">Votre bibliothèque commence ici.</h2>
          <p className="mb-6 text-stone-500">Créez votre première activité et retrouvez-la ici pour toujours.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/planifier/nouveau"><Button className="bg-blue-600 hover:bg-blue-700">🧠 Planifier un cours</Button></Link>
            <Link href="/creer/nouveau"><Button variant="outline">📄 Créer du matériel</Button></Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {(Object.entries(byType) as [string, typeof documents][])
            .filter(([, docs]) => docs.length > 0)
            .map(([type, docs]) => (
              <div key={type}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-semibold text-stone-900">
                    <Badge className={`text-xs ${TYPE_COLORS[type]}`}>{TYPE_LABELS[type]}</Badge>
                    <span className="text-sm text-stone-400">({docs.length})</span>
                  </h2>
                  <Link href={TYPE_HREFS[type]}>
                    <Button variant="ghost" size="sm" className="gap-1 text-stone-500"><Plus className="h-3.5 w-3.5" />Nouveau</Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {docs.map((doc: (typeof docs)[0]) => {
                    const meta = doc.metadata as Record<string, string>
                    return (
                      <Link
                        key={doc.id}
                        href={`/bibliotheque/${doc.id}`}
                        className="group rounded-xl border border-stone-200 bg-white p-4 hover:border-stone-300 hover:shadow-md transition-all"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="font-medium text-stone-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">{doc.title}</h3>
                          {doc.isFavorite && <Heart className="h-4 w-4 fill-red-500 text-red-500 shrink-0 ml-2" />}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {meta.grade && <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-500">{meta.grade}e année</span>}
                          {meta.subject && <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-500 capitalize">{meta.subject.replace('_', ' ')}</span>}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-stone-400">
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
