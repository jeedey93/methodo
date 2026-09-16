import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Brain, ClipboardCheck, MessageSquare, Library, Clock, Sparkles, ChevronRight, Check } from 'lucide-react'

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
            <a href="#tarifs" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">Tarifs</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/connexion">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link href="/inscription">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Commencer gratuitement</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-16 text-center">
        <Badge variant="secondary" className="mb-6 bg-blue-50 text-blue-700 hover:bg-blue-50">
          🇶🇨 Conçu pour les enseignants québécois
        </Badge>

        {/* Grand logo centré */}
        <div className="mx-auto mb-8 relative w-80 h-56 sm:w-[480px] sm:h-72">
          <Image src="/logo.png" alt="Méthodo" fill className="object-contain" priority />
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-stone-900 sm:text-6xl md:text-7xl">
          L&apos;assistant intelligent<br />
          <span className="text-blue-600">des profs.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-stone-500 leading-relaxed">
          Planifiez vos cours, créez votre matériel et simplifiez votre quotidien d&apos;enseignant. Méthodo génère en secondes ce qui vous prend des heures.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/inscription">
            <Button size="lg" className="gap-2 bg-blue-600 px-8 hover:bg-blue-700 text-base">
              Commencer gratuitement
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#comment">
            <Button size="lg" variant="outline" className="px-8 text-base">
              Voir comment ça fonctionne
            </Button>
          </a>
        </div>
        <p className="mt-4 text-sm text-stone-400">Aucune carte de crédit requise · 5 générations gratuites par mois</p>
      </section>

      {/* Demo preview */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="overflow-hidden rounded-2xl border border-stone-200 shadow-2xl shadow-stone-100">
          <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-stone-400">méthodo.ca/planifier</span>
          </div>
          <div className="grid grid-cols-2 divide-x divide-stone-100 bg-white">
            <div className="p-6">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-stone-400">Votre demande</p>
              <div className="rounded-lg bg-stone-50 p-4 text-sm text-stone-700 italic">
                « Je dois préparer deux périodes de mathématiques de 3e année sur les fractions. Je veux une activité pratique pour une classe avec des niveaux différents. »
              </div>
            </div>
            <div className="p-6">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-500">Résultat généré</p>
              <div className="space-y-2 text-sm">
                <div className="font-semibold text-stone-900">Fractions — 3e année</div>
                <div className="text-stone-500">✓ 4 objectifs PFÉQ</div>
                <div className="text-stone-500">✓ Mise en situation (10 min)</div>
                <div className="text-stone-500">✓ Développement (30 min)</div>
                <div className="text-stone-500">✓ Pratique guidée (15 min)</div>
                <div className="text-stone-500">✓ Objectivation (5 min)</div>
                <div className="text-stone-500">✓ 2 niveaux de différenciation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-stone-50 py-20" id="probleme">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-stone-900">
              Moins de temps à préparer.<br />Plus de temps pour enseigner.
            </h2>
            <p className="text-lg text-stone-500">Chaque semaine, des heures perdues sur des tâches répétitives.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: BookOpen, title: 'Planification', desc: 'Préparer les cours, séquences et progressions pour chaque période.' },
              { icon: ClipboardCheck, title: 'Matériel', desc: 'Créer activités, fiches d\'exercices et documents adaptés à chaque niveau.' },
              { icon: Brain, title: 'Évaluations', desc: 'Concevoir des examens équilibrés avec corrigés et critères.' },
              { icon: MessageSquare, title: 'Communications', desc: 'Rédiger des messages professionnels aux parents à chaque situation.' },
              { icon: Library, title: 'Organisation', desc: 'Retrouver et réutiliser le matériel créé les années précédentes.' },
              { icon: Clock, title: 'Recommencer', desc: 'Refaire tout ça chaque semaine, pour chaque groupe, chaque année.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100">
                  <item.icon className="h-5 w-5 text-stone-500" />
                </div>
                <h3 className="mb-2 font-semibold text-stone-900">{item.title}</h3>
                <p className="text-sm text-stone-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20" id="comment">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-stone-900">Comment ça fonctionne</h2>
            <p className="text-lg text-stone-500">Trois étapes. Pas de formation requise.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { step: '1', title: 'Décrivez', desc: 'Dites à Méthodo ce dont vous avez besoin. Niveau, matière, sujet, durée — en quelques clics.', color: 'bg-blue-50 text-blue-600' },
              { step: '2', title: 'Générez', desc: 'Méthodo crée le contenu pour vous en quelques secondes. Planification complète, exercices, évaluation ou message aux parents.', color: 'bg-green-50 text-green-600' },
              { step: '3', title: 'Adaptez', desc: 'Modifiez le résultat à votre goût, sauvegardez dans votre bibliothèque et exportez en PDF prêt à imprimer.', color: 'bg-purple-50 text-purple-600' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${item.color}`}>
                  <span className="text-2xl font-bold">{item.step}</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-stone-900">{item.title}</h3>
                <p className="text-stone-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-stone-50 py-20" id="fonctionnalites">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-stone-900">5 outils. Un seul endroit.</h2>
            <p className="text-lg text-stone-500">Tout est connecté. Générez un cours, créez le matériel, puis l&apos;évaluation — en quelques minutes.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '🧠', title: 'Planificateur de cours', desc: 'Créez des planifications complètes avec objectifs, phases, différenciation et matériel requis.', badge: 'Populaire' },
              { icon: '📄', title: 'Générateur de matériel', desc: 'Activités, fiches d\'exercices, jeux pédagogiques, devoirs — adaptés à votre niveau et matière.' },
              { icon: '📊', title: 'Générateur d\'évaluations', desc: 'Quiz, examens, évaluations formatives avec corrigés automatiques et critères de réussite.' },
              { icon: '💬', title: 'Communications aux parents', desc: 'Des messages professionnels et bienveillants, dans le ton que vous souhaitez.' },
              { icon: '📚', title: 'Bibliothèque personnelle', desc: 'Retrouvez, modifiez et réutilisez tout votre matériel. Organisé par matière, niveau et tags.' },
            ].map((item) => (
              <div key={item.title} className="relative rounded-xl bg-white p-6 shadow-sm">
                {item.badge && (
                  <Badge className="absolute -top-2 right-4 bg-blue-600 text-white text-xs">{item.badge}</Badge>
                )}
                <div className="mb-3 text-3xl">{item.icon}</div>
                <h3 className="mb-2 font-semibold text-stone-900">{item.title}</h3>
                <p className="text-sm text-stone-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20" id="tarifs">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-stone-900">Tarifs simples et transparents</h2>
            <p className="text-lg text-stone-500">Commencez gratuitement. Passez au Pro quand vous en avez besoin.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl border border-stone-200 p-8">
              <div className="mb-1 text-sm font-medium text-stone-500">Gratuit</div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-stone-900">0 $</span>
                <span className="text-stone-400"> /mois</span>
              </div>
              <ul className="mb-8 space-y-3">
                {[
                  '5 générations par mois',
                  'Tous les outils inclus',
                  'Bibliothèque personnelle',
                  'Export PDF',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-stone-600">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/inscription">
                <Button className="w-full" variant="outline">Commencer gratuitement</Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl border-2 border-blue-600 bg-blue-600 p-8 text-white">
              <Badge className="absolute -top-3 right-4 bg-white text-blue-600">Le plus populaire</Badge>
              <div className="mb-1 text-sm font-medium text-blue-200">Méthodo Pro</div>
              <div className="mb-6">
                <span className="text-4xl font-bold">12 $</span>
                <span className="text-blue-200"> CAD /mois</span>
              </div>
              <ul className="mb-8 space-y-3">
                {[
                  '200 générations par mois',
                  'Planificateur avancé',
                  'Matériel différencié',
                  'Évaluations avec corrigés',
                  'Communications aux parents',
                  'Bibliothèque illimitée',
                  'Export PDF haute qualité',
                  'Support prioritaire',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/90">
                    <Check className="h-4 w-4 text-blue-200 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/inscription">
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">Commencer l&apos;essai gratuit</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-stone-900 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Prêt à gagner du temps chaque semaine?
          </h2>
          <p className="mb-8 text-lg text-stone-400">
            Rejoignez des enseignants qui utilisent Méthodo pour simplifier leur préparation.
          </p>
          <Link href="/inscription">
            <Button size="lg" className="gap-2 bg-blue-600 px-8 hover:bg-blue-700 text-base">
              Commencer gratuitement
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
              <a href="#" className="hover:text-stone-900">À propos</a>
              <a href="#fonctionnalites" className="hover:text-stone-900">Fonctionnalités</a>
              <a href="#tarifs" className="hover:text-stone-900">Tarifs</a>
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
