import type { AssessmentParams } from '@/types/ai'

export function buildAssessmentPrompt(params: AssessmentParams): { system: string; user: string } {
  const system = `Tu es un expert en évaluation pédagogique au primaire québécois. Tu crées des évaluations équilibrées, équitables et alignées sur le PFÉQ.

Tu dois toujours répondre en français québécois. Retourne UNIQUEMENT un objet JSON valide:

{
  "title": "Titre de l'évaluation",
  "grade": "niveau",
  "subject": "matière",
  "duration": 45,
  "totalPoints": 40,
  "instructions": "Instructions générales",
  "sections": [
    {
      "title": "Partie 1 — Questions à choix multiples",
      "instructions": "Encercle la bonne réponse.",
      "questions": [
        {
          "number": 1,
          "type": "choix_multiple",
          "question": "Question?",
          "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
          "points": 2,
          "space": 0
        }
      ]
    }
  ],
  "answerKey": [
    {
      "number": 1,
      "answer": "B",
      "explanation": "Explication optionnelle"
    }
  ],
  "successCriteria": [
    "Critère de réussite 1",
    "Critère de réussite 2"
  ]
}`

  const contextLine = params.teacherContext
    ? `\nContexte: ${params.teacherContext.firstName}, ${params.teacherContext.grades.join(', ')}`
    : ''

  const user = `Crée une évaluation de type "${params.type}" pour:
- Niveau: ${params.grade}e année
- Matière: ${params.subject}
- Sujet: ${params.topic}
- Nombre de questions: ${params.questionCount}
- Difficulté: ${params.difficulty}
${params.duration ? `- Durée: ${params.duration} minutes` : ''}
- Types de questions: ${params.questionTypes.join(', ')}${contextLine}

Organise l'évaluation en sections claires. Inclus toujours le corrigé et des critères de réussite précis.`

  return { system, user }
}
