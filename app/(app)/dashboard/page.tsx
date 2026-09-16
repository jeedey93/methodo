import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Share2, Calendar, PenLine, BookOpen, ChevronRight, Plus, Clock, ArrowRight, Sparkles, Users, MonitorPlay } from 'lucide-react'
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

const quickActions = [
  {
    href: '/creer/planification',
    icon: PenLine,
    label: 'Nouvelle planification',
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50 hover:bg-purple-100/80',
    border: 'border-purple-100',
    text: 'text-purple-700',
    iconBg: 'bg-purple-100',
  },
  {
    href: '/creer/exercices',
    icon: Sparkles,
    label: 'Feuille d\'exercices',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 hover:bg-blue-100/80',
    border: 'border-blue-100',
    text: 'text-blue-700',
    iconBg: 'bg-blue-100',
  },
  {
    href: '/planificateur',
    icon: Calendar,
    label: 'Planifier ma semaine',
    color: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50 hover:bg-teal-100/80',
    border: 'border-teal-100',
    text: 'text-teal-700',
    iconBg: 'bg-teal-100',
  },
  {
    href: '/classe',
    icon: MonitorPlay,
    label: 'Outils de classe',
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50 hover:bg-orange-100/80',
    border: 'border-orange-100',
    text: 'text-orange-700',
    iconBg: 'bg-orange-100',
  },
]

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const [profile, recentDocuments, communityCount] = await Promise.all([
    prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      select: { firstName: true, grades: true },
    }),
    prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, title: true, type: true, updatedAt: true },
    }),
    prisma.sharedResource.count({ where: { isPublished: true, isAiGenerated: false } }),
  ])

  const firstName = profile?.firstName ?? 'Enseignant'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div className="space-y-8 max-w-4xl">

      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 px-7 py-8 text-white shadow-lg shadow-blue-200">
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium mb-1">{format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {firstName}&nbsp;👋
          </h1>
          <p className="mt-1.5 text-blue-100/90 text-sm">Qu&apos;est-ce qu&apos;on prépare aujourd&apos;hui&nbsp;?</p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/creer"
              className="inline-flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/30 transition-all">
              <Plus className="h-4 w-4" />Créer un document
            </Link>
            <Link href="/communaute"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 border border-white/10 px-4 py-2 text-sm font-medium text-blue-100 hover:bg-white/20 transition-all">
              <Users className="h-4 w-4" />{communityCount} ressources partagées
            </Link>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 top-16 h-24 w-24 rounded-full bg-white/5" />
        <div className="absolute right-20 -bottom-6 h-32 w-32 rounded-full bg-indigo-500/30" />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-widest mb-3">Actions rapides</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map(a => (
            <Link key={a.href} href={a.href}
              className={`group rounded-xl border ${a.border} ${a.bg} p-4 transition-all hover:shadow-sm`}>
              <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${a.iconBg}`}>
                <a.icon className={`h-4 w-4 ${a.text}`} />
              </div>
              <p className={`text-sm font-semibold leading-snug ${a.text}`}>{a.label}</p>
              <ArrowRight className={`mt-2 h-3.5 w-3.5 ${a.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent documents */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-widest">Créations récentes</h2>
          <Link href="/bibliotheque" className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Voir tout <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentDocuments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100">
              <BookOpen className="h-6 w-6 text-stone-300" />
            </div>
            <p className="text-sm font-medium text-stone-600">Rien ici pour l&apos;instant.</p>
            <p className="mt-1 text-sm text-stone-400">Créez votre premier document pour le voir apparaître ici.</p>
            <Link href="/creer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />Créer un document
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            {recentDocuments.map((doc, i) => (
              <Link key={doc.id} href={`/bibliotheque/${doc.id}`}
                className={`group flex items-center gap-4 px-5 py-3.5 hover:bg-stone-50 transition-colors ${i !== recentDocuments.length - 1 ? 'border-b border-stone-100' : ''}`}>
                <Badge className={`shrink-0 text-xs ${DOCUMENT_TYPE_COLORS[doc.type]}`}>
                  {DOCUMENT_TYPE_LABELS[doc.type]}
                </Badge>
                <span className="flex-1 text-sm font-medium text-stone-800 truncate group-hover:text-blue-700 transition-colors">{doc.title}</span>
                <span className="flex items-center gap-1.5 text-xs text-stone-400 shrink-0">
                  <Clock className="h-3 w-3" />
                  {format(new Date(doc.updatedAt), 'd MMM', { locale: fr })}
                </span>
                <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nudge: communauté */}
      <div className="rounded-xl border border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-teal-900 text-sm">Partagez avec la communauté</p>
          <p className="text-xs text-teal-700 mt-0.5">
            {communityCount > 0
              ? `${communityCount} ressource${communityCount > 1 ? 's' : ''} partagée${communityCount > 1 ? 's' : ''} par des collègues. À votre tour ?`
              : 'Soyez le premier à partager du matériel avec la communauté !'}
          </p>
        </div>
        <Link href="/communaute"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 transition-all shadow-sm">
          Explorer <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

    </div>
  )
}
