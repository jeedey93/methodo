import type { AIProvider } from './provider'
import type {
  LessonPlanParams, LessonPlanContent,
  WorksheetParams, WorksheetContent,
  AssessmentParams, AssessmentContent,
  ParentMessageParams, ParentMessageContent,
  AIGenerationResult,
} from '@/types/ai'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class MockProvider implements AIProvider {
  async generateLessonPlan(params: LessonPlanParams): Promise<AIGenerationResult<LessonPlanContent>> {
    await delay(1500)
    return {
      model: 'mock',
      durationMs: 1500,
      data: {
        title: `${params.topic} — ${params.grade}e année`,
        grade: params.grade,
        subject: params.subject,
        objectives: [
          `Comprendre le concept de ${params.topic}`,
          `Appliquer les notions de ${params.topic} dans des situations concrètes`,
          'Développer la pensée critique et la collaboration',
        ],
        introduction: `L'enseignant commence par une mise en situation engageante liée à ${params.topic}. Il pose des questions pour activer les connaissances antérieures des élèves et suscite leur curiosité.`,
        phases: [
          {
            name: 'Mise en situation',
            duration: 10,
            description: `Introduction au concept de ${params.topic} à travers une situation concrète et familière pour les élèves.`,
            activities: [
              `Discussion ouverte : «Qu'est-ce que vous savez déjà sur ${params.topic}?»`,
              'Activation des connaissances antérieures',
              'Présentation de l\'objectif de la leçon',
            ],
            materials: ['Tableau blanc', 'Marqueurs'],
          },
          {
            name: 'Développement',
            duration: Math.floor(params.duration * 0.5),
            description: 'Présentation des nouvelles notions avec exemples concrets et manipulation.',
            activities: [
              `Explication directe du concept de ${params.topic}`,
              'Démonstration avec exemples progressifs',
              'Questions-réponses interactives',
              'Exercices guidés en groupe',
            ],
            materials: ['Matériel de manipulation', 'Fiches de travail', 'Tableau blanc'],
          },
          {
            name: 'Pratique guidée',
            duration: Math.floor(params.duration * 0.25),
            description: 'Les élèves pratiquent les nouvelles notions avec le soutien de l\'enseignant.',
            activities: [
              'Travail en équipes de deux',
              'Résolution de problèmes guidés',
              'Rétroaction immédiate',
            ],
            materials: ['Feuilles d\'exercices', 'Crayons'],
          },
          {
            name: 'Objectivation',
            duration: 10,
            description: 'Retour réflexif sur les apprentissages réalisés.',
            activities: [
              'Qu\'avons-nous appris aujourd\'hui?',
              'Ticket de sortie : 1 question sur le sujet',
              'Partage des stratégies utilisées',
            ],
            materials: ['Tickets de sortie'],
          },
        ],
        materials: [
          'Tableau blanc et marqueurs',
          'Matériel de manipulation',
          'Feuilles d\'exercices',
          'Tickets de sortie',
        ],
        differentiation: params.differentiation ? [
          {
            group: 'Élèves en difficulté',
            strategy: `Fournir un aide-mémoire visuel sur ${params.topic}. Réduire le nombre de problèmes. Permettre l'utilisation de matériel de manipulation plus longtemps.`,
          },
          {
            group: 'Élèves avancés',
            strategy: `Proposer des problèmes d'enrichissement plus complexes sur ${params.topic}. Inviter à créer leurs propres exemples.`,
          },
        ] : undefined,
        conclusion: `L'enseignant fait un rappel des points clés de la leçon sur ${params.topic}. Il annonce ce qui sera vu lors de la prochaine période et comment cette notion se connecte à la suite du programme.`,
        assessmentCheck: `Observer la participation des élèves durant les discussions. Analyser les tickets de sortie pour évaluer la compréhension. Corriger les exercices guidés pour identifier les difficultés.`,
        totalDuration: params.duration,
      },
    }
  }

  async generateWorksheet(params: WorksheetParams): Promise<AIGenerationResult<WorksheetContent>> {
    await delay(1200)
    const questions = Array.from({ length: params.questionCount }, (_, i) => ({
      number: i + 1,
      type: i % 3 === 0 ? 'choix_multiple' : i % 3 === 1 ? 'courte' : 'texte',
      question: `Question ${i + 1} sur ${params.topic} pour la ${params.grade}e année`,
      options: i % 3 === 0 ? ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'] : undefined,
      points: 2,
      space: i % 3 === 2 ? 3 : 1,
    } as WorksheetContent['questions'][0]))

    return {
      model: 'mock',
      durationMs: 1200,
      data: {
        title: `${params.topic} — ${params.type}`,
        grade: params.grade,
        subject: params.subject,
        instructions: `Lis attentivement chaque question avant de répondre. Tu as ${params.duration || 30} minutes pour compléter cette activité.`,
        questions,
        answerKey: questions.map(q => ({ number: q.number, answer: `Réponse modèle pour la question ${q.number}` })),
      },
    }
  }

  async generateAssessment(params: AssessmentParams): Promise<AIGenerationResult<AssessmentContent>> {
    await delay(1500)
    return {
      model: 'mock',
      durationMs: 1500,
      data: {
        title: `Évaluation — ${params.topic}`,
        grade: params.grade,
        subject: params.subject,
        duration: params.duration || 45,
        totalPoints: params.questionCount * 2,
        instructions: `Cette évaluation porte sur ${params.topic}. Réponds à toutes les questions. Tu as ${params.duration || 45} minutes.`,
        sections: [
          {
            title: 'Partie 1 — Questions courtes',
            instructions: 'Réponds brièvement à chaque question.',
            questions: Array.from({ length: Math.ceil(params.questionCount / 2) }, (_, i) => ({
              number: i + 1,
              type: 'courte' as const,
              question: `Question ${i + 1} sur ${params.topic}`,
              points: 2,
              space: 2,
            })),
          },
          {
            title: 'Partie 2 — Développement',
            instructions: 'Explique ta réponse en quelques phrases.',
            questions: Array.from({ length: Math.floor(params.questionCount / 2) }, (_, i) => ({
              number: Math.ceil(params.questionCount / 2) + i + 1,
              type: 'texte' as const,
              question: `Question de développement ${i + 1} sur ${params.topic}`,
              points: 4,
              space: 4,
            })),
          },
        ],
        answerKey: Array.from({ length: params.questionCount }, (_, i) => ({
          number: i + 1,
          answer: `Réponse attendue pour la question ${i + 1}`,
          explanation: 'Explication du corrigé',
        })),
        successCriteria: [
          `L'élève démontre une compréhension de base de ${params.topic}`,
          'L\'élève utilise le vocabulaire approprié',
          'L\'élève peut appliquer les concepts dans des situations simples',
        ],
      },
    }
  }

  async generateParentMessage(params: ParentMessageParams): Promise<AIGenerationResult<ParentMessageContent>> {
    await delay(800)
    return {
      model: 'mock',
      durationMs: 800,
      data: {
        subject: 'Information concernant votre enfant',
        body: `Je vous écris pour vous informer de la situation suivante: ${params.situation}\n\nNous travaillons en étroite collaboration pour assurer le succès et le bien-être de votre enfant. N'hésitez pas à communiquer avec moi si vous avez des questions ou si vous souhaitez discuter de cette situation plus en détail.`,
        closing: 'Avec mes cordiales salutations,',
      },
    }
  }
}

export const mockAI: AIProvider = new MockProvider()
