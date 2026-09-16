import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Share2, Calendar, PenLine, BookOpen, ChevronRight, Plus, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  LESSON_PLAN: 'Planification',
  WORKSHEET: 'Matériel',
  ASSESSMENT: 'Évaluation',
  PARENT_MESSAGE: 'Communication',
}

const DOCUMENT_TYPE_COLORS: Record<string, string> = {
  LESSON_PLAN: 'bg-purple-100 text-purple-700',
  WORKSHEET: 'bg-blue-100 text-blue-700',
  ASSESSMENT: 'bg-orange-100 text-orange-700',
  PARENT_MESSAGE: 'bg-green-100 text-green-700',
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const [profile, recentDocuments] = await Promise.all([
    prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      select: { firstName: true, grades: true, subjects: true },
    }),
    prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, title: true, type: true, updatedAt: true, metadata: true },
    }),
  ])

  const firstName = profile?.firstName ?? 'Enseignant'

  const features = [
    { href: '/communaute', icon: Share2, title: 'Ressources partagées', desc: 'Découvrez et partagez du matériel avec la communauté.', color: 'bg-teal-50 border-teal-100', iconColor: 'bg-teal-100 text-teal-600' },
    { href: '/planificateur', icon: Calendar, title: 'Planificateur hebdomadaire', desc: 'Organisez votre semaine en un coup d\'œil.', color: 'bg-blue-50 border-blue-100', iconColor: 'bg-blue-100 text-blue-600' },
    { href: '/creer', icon: PenLine, title: 'Créer un document', desc: 'Planification PFÉQ ou feuille d\'exercices structurée.', color: 'bg-purple-50 border-purple-100', iconColor: 'bg-purple-100 text-purple-600' },
    { href: '/bibliotheque', icon: BookOpen, title: 'Ma bibliothèque', desc: 'Retrouvez tout votre matériel créé.', color: 'bg-stone-50 border-stone-100', iconColor: 'bg-stone-100 text-stone-600' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          Bonjour {firstName} 👋
        </h1>
        <p className="mt-1 text-stone-500">Qu&apos;est-ce qu&apos;on prépare aujourd&apos;hui?</p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {features.map(f => (
          <Link
            key={f.href}
            href={f.href}
            className={`group rounded-xl border p-5 transition-all hover:shadow-md ${f.color}`}
          >
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${f.iconColor}`}>
              <f.icon className="h-5 w-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-stone-900">{f.title}</h3>
              <ChevronRight className="h-4 w-4 text-stone-400 transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="mt-1 text-sm text-stone-500">{f.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent documents */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">Mes créations récentes</h2>
          <Link href="/bibliotheque">
            <Button variant="ghost" size="sm" className="gap-1 text-stone-500">
              Voir tout
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {recentDocuments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
              <BookOpen className="h-6 w-6 text-stone-400" />
            </div>
            <p className="text-sm font-medium text-stone-600">Vos créations apparaîtront ici.</p>
            <p className="mt-1 text-sm text-stone-400">Commencez par créer une planification ou une feuille d&apos;exercices.</p>
            <Link href="/creer">
              <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-1.5 h-4 w-4" />
                Créer mon premier document
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentDocuments.map((doc: (typeof recentDocuments)[0]) => (
              <Link
                key={doc.id}
                href={`/bibliotheque/${doc.id}`}
                className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 hover:border-stone-300 hover:shadow-sm transition-all"
              >
                <Badge className={`shrink-0 text-xs ${DOCUMENT_TYPE_COLORS[doc.type]}`}>
                  {DOCUMENT_TYPE_LABELS[doc.type]}
                </Badge>
                <span className="flex-1 font-medium text-stone-900 truncate">{doc.title}</span>
                <span className="flex items-center gap-1 text-xs text-stone-400 shrink-0">
                  <Clock className="h-3 w-3" />
                  {format(new Date(doc.updatedAt), 'd MMM', { locale: fr })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
