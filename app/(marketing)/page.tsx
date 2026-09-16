import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Share2, Calendar, PenLine, BookOpen, Users, ChevronRight, Check } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-stone-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl flex-shrink-0">
              <Image src="/logo-icon.jpeg" alt="Méthodo" fill className="object-cover object-center scale-[1.15]" priority />
            </div>
            <span className="text-lg font-bold tracking-tight text-stone-900">Méthodo</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#fonctionnalites" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">Fonctionnalités</a>
            <a href="#comment" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">Comment ça fonctionne</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/inscription">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Commencer gratuitement</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 text-center">
        <Badge variant="secondary" className="mb-6 bg-blue-50 text-blue-700 hover:bg-blue-50">
          🇶🇨 Conçu pour les enseignants québécois
        </Badge>

        <div className="mx-auto mb-8 relative w-80 h-56 sm:w-[480px] sm:h-72">
          <Image src="/logo.png" alt="Méthodo" fill className="object-contain mix-blend-multiply" priority />
        </div>

        <h1 className="mb-4 text-5xl font-bold tracking-tight text-stone-900 sm:text-6xl md:text-7xl">
          La plateforme collaborative<br />
          <span className="text-blue-600">des profs québécois.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-xl text-stone-500 leading-relaxed">
          Trois outils simples pour mieux préparer votre enseignement — entièrement gratuit, pour toujours.
        </p>

        {/* 3 outils en puces */}
        <div className="mx-auto mb-10 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-8 text-sm text-stone-600">
          <span className="flex items-center gap-2"><span className="text-lg">📚</span> Bibliothèque partagée</span>
          <span className="hidden sm:block text-stone-300">·</span>
          <span className="flex items-center gap-2"><span className="text-lg">📅</span> Planificateur hebdomadaire</span>
          <span className="hidden sm:block text-stone-300">·</span>
          <span className="flex items-center gap-2"><span className="text-lg">📝</span> Créateur de fiches</span>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/inscription">
            <Button size="lg" className="gap-2 bg-blue-600 px-8 hover:bg-blue-700 text-base">
              Commencer gratuitement
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#fonctionnalites">
            <Button size="lg" variant="outline" className="px-8 text-base">
              Voir les fonctionnalités
            </Button>
          </a>
        </div>
        <p className="mt-4 text-sm text-stone-400">Aucune carte de crédit requise · 100% gratuit pour toujours</p>
      </section>

      {/* Features — mis en avant immédiatement */}
      <section className="bg-stone-50 py-16" id="fonctionnalites">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold text-stone-900">3 outils. 1 plateforme.</h2>
            <p className="text-lg text-stone-500">Tout ce dont vous avez besoin pour mieux organiser votre enseignement.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: '📚', title: 'Bibliothèque partagée', desc: 'Parcourez des ressources partagées par des enseignants de partout au Québec. Planifications, fiches, évaluations — téléchargez et partagez gratuitement.', badge: 'Communauté' },
              { icon: '📅', title: 'Planificateur hebdomadaire', desc: 'Grille 5 jours × 6 périodes. Cliquez sur une cellule pour renseigner la matière, le titre et des notes. Imprimable en un clic.' },
              { icon: '📝', title: 'Créateur de fiches', desc: 'Formulaires guidés pour créer vos planifications PFÉQ et feuilles d\'exercices. Sauvegardez dans votre bibliothèque et exportez en PDF.' },
            ].map((item) => (
              <div key={item.title} className="relative rounded-xl bg-white p-6 shadow-sm">
                {item.badge && (
                  <Badge className="absolute -top-2 right-4 bg-teal-600 text-white text-xs">{item.badge}</Badge>
                )}
                <div className="mb-3 text-3xl">{item.icon}</div>
                <h3 className="mb-2 font-semibold text-stone-900">{item.title}</h3>
                <p className="text-sm text-stone-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — 100% free */}
      <section className="py-20" id="tarifs">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-stone-900">100% gratuit. Pour toujours.</h2>
          <p className="mb-10 text-lg text-stone-500">Méthodo est une plateforme collaborative, pas un SaaS à abonnement.</p>
          <div className="rounded-2xl border-2 border-stone-200 p-10">
            <div className="mb-2 text-5xl font-bold text-stone-900">0 $</div>
            <p className="mb-8 text-stone-400">Aucune carte de crédit. Aucun abonnement. Jamais.</p>
            <ul className="mb-8 space-y-3 text-left max-w-xs mx-auto">
              {[
                'Bibliothèque partagée illimitée',
                'Planificateur hebdomadaire',
                'Créateur de fiches et planifications',
                'Bibliothèque personnelle',
                'Export PDF',
                'Tous les futurs outils',
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-stone-700">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/inscription">
              <Button size="lg" className="gap-2 bg-blue-600 px-10 hover:bg-blue-700">
                Commencer gratuitement
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-stone-900 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Prêt à collaborer avec vos collègues?
          </h2>
          <p className="mb-8 text-lg text-stone-400">
            Rejoignez la communauté des enseignants québécois sur Méthodo.
          </p>
          <Link href="/inscription">
            <Button size="lg" className="gap-2 bg-blue-600 px-8 hover:bg-blue-700 text-base">
              Créer mon compte gratuitement
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg flex-shrink-0">
                <Image src="/logo-icon.jpeg" alt="Méthodo" fill className="object-cover object-center scale-[1.15]" />
              </div>
              <span className="font-bold text-stone-900">Méthodo</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-stone-500">
              <a href="#fonctionnalites" className="hover:text-stone-900">Fonctionnalités</a>
              <a href="#comment" className="hover:text-stone-900">Comment ça fonctionne</a>
              <a href="#" className="hover:text-stone-900">Confidentialité</a>
              <a href="#" className="hover:text-stone-900">Conditions</a>
              <a href="#" className="hover:text-stone-900">Contact</a>
            </nav>
            <p className="text-sm text-stone-400">© 2026 Méthodo. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
