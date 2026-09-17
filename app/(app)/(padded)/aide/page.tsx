'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Section {
  id: string
  emoji: string
  title: string
  description: string
  features: {
    title: string
    steps?: string[]
    tips?: string[]
  }[]
}

const SECTIONS: Section[] = [
  {
    id: 'planificateur',
    emoji: '📅',
    title: 'Planificateur de semaine',
    description: 'Planifiez votre semaine et partagez-la avec les parents en un clic.',
    features: [
      {
        title: 'Créer votre planification',
        steps: [
          'Allez dans Planificateur depuis le menu.',
          'La semaine courante s\'affiche automatiquement.',
          'Cliquez sur une cellule pour y écrire une activité (matière, sujet, notes).',
          'La sauvegarde est automatique.',
        ],
      },
      {
        title: 'Naviguer entre les semaines',
        steps: [
          'Utilisez les flèches < > en haut de la grille pour changer de semaine.',
          'Chaque semaine est sauvegardée séparément.',
        ],
      },
      {
        title: 'Afficher en mode projecteur',
        steps: [
          'Le lien du portail parents avec ?projecteur=1 affiche la grille en plein écran.',
          'Pratique pour projeter la semaine au tableau.',
        ],
      },
    ],
  },
  {
    id: 'bibliotheque',
    emoji: '📚',
    title: 'Bibliothèque de documents',
    description: 'Créez et organisez vos fiches, plans de leçon et évaluations.',
    features: [
      {
        title: 'Créer un document',
        steps: [
          'Cliquez sur Créer dans le menu, ou sur le bouton + dans la bibliothèque.',
          'Choisissez le type : fiche d\'exercice, plan de leçon, évaluation ou message aux parents.',
          'Remplissez le titre et le contenu.',
          'Sauvegardez — le document apparaît dans votre bibliothèque.',
        ],
      },
      {
        title: 'Organiser avec des tags',
        steps: [
          'Créez des étiquettes colorées (ex: Mathématiques, Lecture).',
          'Assignez-les à vos documents.',
          'Filtrez par tag dans la bibliothèque.',
        ],
      },
      {
        title: 'Exporter en PDF',
        steps: [
          'Ouvrez un document dans la bibliothèque.',
          'Cliquez sur Exporter PDF.',
          'Une nouvelle page s\'ouvre avec le dialogue d\'impression — choisissez Enregistrer en PDF.',
        ],
      },
    ],
  },
  {
    id: 'ressources',
    emoji: '🤝',
    title: 'Communauté & ressources partagées',
    description: 'Partagez et découvrez des ressources créées par d\'autres enseignants.',
    features: [
      {
        title: 'Parcourir les ressources',
        steps: [
          'Allez dans Communauté.',
          'Filtrez par cycle, matière ou type de document.',
          'Téléchargez ou consultez ce qui vous intéresse.',
        ],
      },
      {
        title: 'Partager une ressource',
        steps: [
          'Cliquez sur Partager une ressource.',
          'Ajoutez un titre, une description et les étiquettes (cycle, matière).',
          'Votre ressource est visible par tous les enseignants Méthodo.',
        ],
      },
    ],
  },
  {
    id: 'portail',
    emoji: '👨‍👩‍👧',
    title: 'Portail parents',
    description: 'Un lien public que vous partagez aux parents — sans qu\'ils aient besoin d\'un compte.',
    features: [
      {
        title: 'Activer le portail',
        steps: [
          'Allez dans Portail parents.',
          'Un lien mémorisable est créé automatiquement (ex: methodo.app/p/marie-tremblay).',
          'Le lien est actif par défaut — vous pouvez le désactiver à tout moment.',
        ],
      },
      {
        title: 'Personnaliser le lien',
        steps: [
          'Cliquez sur l\'icône crayon à côté du lien.',
          'Entrez un nom facile à retenir.',
          'Le lien se met à jour immédiatement.',
        ],
        tips: ['Choisissez quelque chose que les parents pourront taper facilement, comme votre nom ou le nom de la classe.'],
      },
      {
        title: 'Publier des communications',
        steps: [
          'Dans la section Communications, cliquez sur Nouveau message.',
          'Entrez un titre et un texte.',
          'Le message est visible aux parents dès la publication.',
          'Supprimez les anciens messages quand ils ne sont plus pertinents.',
        ],
      },
      {
        title: 'Remplir l\'agenda de la semaine',
        steps: [
          'Dans la section Agenda, cliquez sur Ajouter.',
          'Choisissez le jour, entrez la matière et une note (ex: "Apporter le livre").',
          'Les parents voient le tableau agenda sur leur portail.',
        ],
      },
      {
        title: 'Ce que voient les parents',
        steps: [
          'Le nom de votre classe en haut.',
          'La grille de planification de la semaine courante.',
          'Le tableau de l\'agenda avec les notes par jour.',
          'Vos communications, du plus récent au plus ancien.',
        ],
      },
    ],
  },
  {
    id: 'classe',
    emoji: '🖥️',
    title: 'Outils de classe',
    description: 'Des outils interactifs à utiliser directement au tableau ou sur votre tablette.',
    features: [
      {
        title: 'Temps & ambiance',
        steps: [
          'Minuterie — entrez un nombre de minutes, appuyez sur Démarrer. Le cercle se vide en temps réel.',
          'Horloge — affiche l\'heure en temps réel avec des aiguilles analogiques.',
          'Niveau de bruit — autorisez le micro ; la barre monte quand la classe est bruyante.',
          'Dés — choisissez 1 à 6 dés, lancez-les d\'un clic.',
          'Feux de circulation — rouge/jaune/vert pour gérer le niveau sonore. Cliquez sur Plein écran pour l\'afficher au tableau.',
        ],
      },
      {
        title: 'Élèves',
        steps: [
          'Sélecteur d\'élève — entrez les noms de votre classe, appuyez sur le bouton pour en choisir un au hasard.',
          'Roue de la chance — les noms apparaissent sur une roue qui tourne.',
          'Générateur de groupes — entrez vos élèves, choisissez la taille des groupes.',
          'Sondage rapide — créez un QCM, partagez le lien aux élèves sur leur appareil, voyez les résultats en direct.',
        ],
      },
      {
        title: 'Affichage',
        steps: [
          'Affichage de consignes — écrivez une consigne, affichez-la en plein écran au tableau.',
          'Mode projecteur — ouvre le portail parents en plein écran avec la grille de la semaine.',
        ],
      },
    ],
  },
  {
    id: 'compte',
    emoji: '⚙️',
    title: 'Compte & paramètres',
    description: 'Gérez votre profil et vos préférences.',
    features: [
      {
        title: 'Modifier votre profil',
        steps: [
          'Allez dans Paramètres (en bas du menu).',
          'Modifiez votre prénom, nom, école.',
          'Cochez les cycles et matières que vous enseignez.',
          'Sauvegardez.',
        ],
      },
      {
        title: 'Changer de mot de passe',
        steps: [
          'Sur la page de connexion, cliquez sur Mot de passe oublié.',
          'Entrez votre adresse courriel.',
          'Un lien de réinitialisation vous sera envoyé.',
        ],
      },
    ],
  },
]

function SectionCard({ section }: { section: Section }) {
  const [open, setOpen] = useState(false)
  const [openFeature, setOpenFeature] = useState<number | null>(null)

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-stone-50 transition-colors"
      >
        <span className="text-2xl">{section.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-stone-900">{section.title}</p>
          <p className="text-sm text-stone-500 mt-0.5">{section.description}</p>
        </div>
        {open
          ? <ChevronDown className="h-4 w-4 text-stone-400 shrink-0" />
          : <ChevronRight className="h-4 w-4 text-stone-400 shrink-0" />
        }
      </button>

      {open && (
        <div className="border-t border-stone-100 divide-y divide-stone-50">
          {section.features.map((feature, idx) => (
            <div key={idx}>
              <button
                onClick={() => setOpenFeature(openFeature === idx ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-stone-50 transition-colors"
              >
                <span className="text-sm font-medium text-stone-800">{feature.title}</span>
                {openFeature === idx
                  ? <ChevronDown className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  : <ChevronRight className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                }
              </button>

              {openFeature === idx && (
                <div className="px-5 pb-4 space-y-3">
                  {feature.steps && (
                    <ol className="space-y-1.5">
                      {feature.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-stone-600">
                          <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  )}
                  {feature.tips && feature.tips.map((tip, i) => (
                    <div key={i} className="flex gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                      <span className="text-amber-500 text-sm">💡</span>
                      <p className="text-sm text-amber-800">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AidePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Guide d&apos;utilisation</h1>
        <p className="mt-1 text-stone-500">Tout ce que Méthodo peut faire pour vous, expliqué étape par étape.</p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map(section => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
        <p className="text-sm font-medium text-blue-900 mb-1">Une question ou un problème ?</p>
        <p className="text-sm text-blue-700">
          Méthodo est en développement actif. Si vous rencontrez un bogue ou avez une suggestion,
          n&apos;hésitez pas à nous contacter.
        </p>
      </div>
    </div>
  )
}
