import Link from 'next/link'
import { BookOpen, FileText, ArrowRight, Sparkles, GraduationCap } from 'lucide-react'

const types = [
  {
    href: '/creer/planification',
    icon: BookOpen,
    label: 'Planification de cours',
    desc: 'Créez une planification complète conforme au PFÉQ : objectifs, phases, matériel et différenciation.',
    tags: ['PFÉQ', 'Objectifs', 'Différenciation'],
    color: 'from-purple-500 to-violet-600',
    lightBg: 'bg-purple-50',
    border: 'border-purple-100 hover:border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    tagBg: 'bg-purple-100/60 text-purple-700',
    badge: null,
  },
  {
    href: '/creer/exercices',
    icon: FileText,
    label: 'Feuille d\'exercices',
    desc: 'Construisez une feuille d\'exercices structurée avec des questions de différents types.',
    tags: ['Questions', 'Choix multiples', 'Espaces réponse'],
    color: 'from-blue-500 to-cyan-600',
    lightBg: 'bg-blue-50',
    border: 'border-blue-100 hover:border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    tagBg: 'bg-blue-100/60 text-blue-700',
    badge: null,
  },
]

export default function CreerPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Créer un document</h1>
        <p className="mt-1.5 text-stone-500">Choisissez le type de document à générer avec l&apos;IA.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {types.map(t => (
          <Link key={t.href} href={t.href}
            className={`group relative overflow-hidden rounded-2xl border bg-white ${t.border} p-6 transition-all hover:shadow-md`}>

            {/* Top gradient strip */}
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${t.color}`} />

            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${t.iconBg} shadow-sm`}>
              <t.icon className={`h-6 w-6 ${t.iconColor}`} />
            </div>

            <h2 className="mb-2 text-base font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
              {t.label}
            </h2>
            <p className="text-sm text-stone-500 leading-relaxed mb-4">{t.desc}</p>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {t.tags.map(tag => (
                <span key={tag} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.tagBg}`}>{tag}</span>
              ))}
            </div>

            <div className="flex items-center gap-1 text-sm font-semibold text-stone-400 group-hover:text-blue-600 transition-colors">
              Commencer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* IA nudge */}
      <div className="rounded-xl border border-stone-200 bg-gradient-to-r from-stone-50 to-slate-50 px-5 py-4 flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100">
          <Sparkles className="h-4 w-4 text-stone-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-800">Généré avec l&apos;IA, personnalisé par vous</p>
          <p className="text-xs text-stone-500 mt-0.5">
            Méthodo utilise vos informations de profil (niveau, matières) pour produire des contenus adaptés à votre classe.
            Vous pouvez modifier et sauvegarder chaque document dans votre bibliothèque.
          </p>
        </div>
      </div>
    </div>
  )
}
