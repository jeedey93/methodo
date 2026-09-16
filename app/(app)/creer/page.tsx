import Link from 'next/link'
import { BookOpen, FileText } from 'lucide-react'

export default function CreerPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Créer un document</h1>
        <p className="mt-1 text-stone-500">Choisissez le type de document à créer.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/creer/planification"
          className="group rounded-xl border border-purple-100 bg-purple-50 p-6 transition-all hover:shadow-md"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
            <BookOpen className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-stone-900">Planification de cours</h2>
          <p className="text-sm text-stone-500">
            Créez une planification complète conforme au PFÉQ : objectifs, phases, matériel et différenciation.
          </p>
          <div className="mt-4 text-xs font-medium text-purple-600">
            Planification · Objectifs · Phases · PFÉQ →
          </div>
        </Link>

        <Link
          href="/creer/exercices"
          className="group rounded-xl border border-blue-100 bg-blue-50 p-6 transition-all hover:shadow-md"
        >
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-stone-900">Feuille d&apos;exercices</h2>
          <p className="text-sm text-stone-500">
            Construisez une feuille d&apos;exercices structurée avec des questions de différents types.
          </p>
          <div className="mt-4 text-xs font-medium text-blue-600">
            Questions · Choix multiples · Espaces réponse →
          </div>
        </Link>
      </div>
    </div>
  )
}
