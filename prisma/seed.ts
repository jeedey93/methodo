import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding demo data...')

  const DEMO_USER_ID = 'demo-jennifer-villeneuve-001'
  const DEMO_EMAIL = 'jennifer@demo.methodo.ca'

  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    create: { id: DEMO_USER_ID, email: DEMO_EMAIL },
    update: {},
  })

  await prisma.teacherProfile.upsert({
    where: { userId: DEMO_USER_ID },
    create: {
      userId: DEMO_USER_ID,
      firstName: 'Jennifer',
      lastName: 'Villeneuve',
      grades: ['3'],
      subjects: ['mathematiques', 'francais'],
      language: 'fr',
    },
    update: {},
  })

  await prisma.subscription.upsert({
    where: { userId: DEMO_USER_ID },
    create: { userId: DEMO_USER_ID, plan: 'FREE' },
    update: {},
  })

  const billingPeriod = new Date().toISOString().slice(0, 7)
  await prisma.usageTracking.upsert({
    where: { userId_billingPeriod: { userId: DEMO_USER_ID, billingPeriod } },
    create: { userId: DEMO_USER_ID, billingPeriod, count: 3 },
    update: { count: 3 },
  })

  // Demo documents
  const docs = [
    {
      type: 'LESSON_PLAN' as const,
      title: 'Fractions simples — 3e année',
      metadata: { grade: '3', subject: 'mathematiques', topic: 'Fractions', duration: 60, periods: 2 },
      content: {
        title: 'Fractions simples — 3e année',
        grade: '3', subject: 'mathematiques',
        objectives: ['Comprendre ce qu\'est une fraction', 'Représenter ½ et ¼', 'Comparer des fractions simples'],
        introduction: 'Mise en situation avec une pizza partagée entre amis.',
        phases: [
          { name: 'Mise en situation', duration: 10, description: 'Discussion sur le partage équitable.', activities: ['Qu\'est-ce que partager équitablement?', 'Dessiner une pizza coupée en 4 parts'] },
          { name: 'Développement', duration: 35, description: 'Introduction au concept de fraction.', activities: ['Définition d\'une fraction', 'Manipulation de bandes de papier', 'Exercices guidés'] },
          { name: 'Objectivation', duration: 15, description: 'Retour sur les apprentissages.', activities: ['Qu\'avons-nous appris?', 'Ticket de sortie'] },
        ],
        materials: ['Bandes de papier', 'Feuilles d\'exercices', 'Tickets de sortie'],
        differentiation: [
          { group: 'Élèves en difficulté', strategy: 'Utiliser des formes concrètes plus longtemps' },
          { group: 'Élèves avancés', strategy: 'Introduire les fractions équivalentes' },
        ],
        conclusion: 'Résumé des concepts clés et annonce de la prochaine période.',
        assessmentCheck: 'Observer les tickets de sortie pour identifier les difficultés.',
        totalDuration: 60,
      },
    },
    {
      type: 'WORKSHEET' as const,
      title: 'Compréhension de lecture — Le voyage',
      metadata: { grade: '3', subject: 'francais', topic: 'Compréhension' },
      content: {
        title: 'Compréhension de lecture — Le voyage',
        grade: '3', subject: 'francais',
        instructions: 'Lis le texte attentivement, puis réponds aux questions.',
        questions: [
          { number: 1, type: 'courte', question: 'Quel est le personnage principal de l\'histoire?', points: 2, space: 2 },
          { number: 2, type: 'texte', question: 'Décris le lieu où se déroule l\'histoire en tes propres mots.', points: 4, space: 4 },
          { number: 3, type: 'choix_multiple', question: 'Quelle est la principale émotion du personnage?', options: ['A) La joie', 'B) La tristesse', 'C) La peur', 'D) La colère'], points: 2, space: 0 },
        ],
        answerKey: [{ number: 1, answer: 'Réponse selon le texte fourni' }, { number: 2, answer: 'Réponse ouverte — évaluer la compréhension' }, { number: 3, answer: 'A) La joie' }],
      },
    },
    {
      type: 'ASSESSMENT' as const,
      title: 'Évaluation de mathématiques — Fractions',
      metadata: { grade: '3', subject: 'mathematiques', topic: 'Fractions' },
      content: {
        title: 'Évaluation de mathématiques — Fractions',
        grade: '3', subject: 'mathematiques',
        duration: 45, totalPoints: 20,
        instructions: 'Réponds à toutes les questions. Tu as 45 minutes.',
        sections: [
          {
            title: 'Partie 1 — Questions courtes', instructions: 'Réponds brièvement.',
            questions: [
              { number: 1, type: 'courte', question: 'Qu\'est-ce qu\'une fraction?', points: 4, space: 3 },
              { number: 2, type: 'courte', question: 'Représente ½ en dessinant une forme divisée.', points: 4, space: 4 },
            ],
          },
          {
            title: 'Partie 2 — Problèmes', instructions: 'Montre ta démarche.',
            questions: [
              { number: 3, type: 'texte', question: 'Marie partage sa pizza en 4 parts égales. Elle mange 2 parts. Quelle fraction a-t-elle mangée?', points: 6, space: 4 },
              { number: 4, type: 'texte', question: 'Lucas a ¼ d\'une feuille de papier. Son ami a ½ de la même feuille. Qui a le plus grand morceau? Explique.', points: 6, space: 4 },
            ],
          },
        ],
        answerKey: [
          { number: 1, answer: 'Une fraction représente une partie d\'un tout', explanation: 'Accepter toute formulation claire' },
          { number: 2, answer: 'Dessin avec une forme coupée en deux parties égales, une coloriée' },
          { number: 3, answer: '2/4 ou ½ de la pizza', explanation: '2 parts sur 4 = 2/4 = ½' },
          { number: 4, answer: 'Lucas a moins (¼ < ½)', explanation: 'Comparer les fractions avec le même entier' },
        ],
        successCriteria: ['L\'élève peut définir une fraction', 'L\'élève représente correctement ½ et ¼', 'L\'élève résout des problèmes simples sur les fractions'],
      },
    },
    {
      type: 'PARENT_MESSAGE' as const,
      title: 'Information — Projet de sciences',
      metadata: { tone: 'chaleureux', length: 'moyenne' },
      content: {
        subject: 'Information concernant le projet de sciences',
        body: 'J\'aimerais vous informer que votre enfant entame cette semaine un projet de sciences passionnant sur les plantes et leur cycle de vie. Ce projet s\'étendra sur trois semaines et inclura une partie pratique à la maison.\n\nNous demandons à chaque élève d\'apporter un petit pot de fleurs ou de planter une graine dans un contenant recycled à la maison. L\'élève observera et documentera la croissance de sa plante dans son journal de bord.\n\nN\'hésitez pas à encourager votre enfant à partager ses observations avec vous. C\'est une belle occasion de créer des conversations sur les sciences à la maison!',
        closing: 'Merci pour votre précieuse collaboration,',
      },
    },
  ]

  for (const doc of docs) {
    await prisma.document.create({
      data: {
        userId: DEMO_USER_ID,
        type: doc.type,
        title: doc.title,
        content: doc.content,
        metadata: doc.metadata,
      },
    })
  }

  console.log('✅ Demo data created successfully!')
  console.log(`📧 Demo user: ${DEMO_EMAIL}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
