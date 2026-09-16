import type { WorksheetParams } from '@/types/ai'

export function buildWorksheetPrompt(params: WorksheetParams): { system: string; user: string } {
  const system = `Tu es un expert en pédagogie québécoise au niveau primaire. Tu crées du matériel pédagogique de haute qualité, clair et adapté à l'âge des élèves.

Tu dois toujours répondre en français québécois. Retourne UNIQUEMENT un objet JSON valide:

{
  "title": "Titre de l'activité",
  "grade": "niveau",
  "subject": "matière",
  "instructions": "Instructions générales pour l'élève",
  "questions": [
    {
      "number": 1,
      "type": "texte",
      "question": "Texte de la question",
      "options": null,
      "points": 2,
      "space": 3
    }
  ],
  "answerKey": [
    {
      "number": 1,
      "answer": "Réponse attendue"
    }
  ]
}

Types de questions valides: "texte", "choix_multiple", "vrai_faux", "courte"
Pour "choix_multiple", inclure un tableau "options" avec les choix.
"space" indique le nombre de lignes d'espace à laisser pour la réponse (1-5).`

  const contextLine = params.teacherContext
    ? `\nContexte: ${params.teacherContext.firstName}, ${params.teacherContext.grades.join(', ')}`
    : ''

  const user = `Crée une ${params.type} pour:
- Niveau: ${params.grade}e année
- Matière: ${params.subject}
- Sujet: ${params.topic}
- Difficulté: ${params.difficulty}
- Nombre de questions: ${params.questionCount}
${params.duration ? `- Durée prévue: ${params.duration} minutes` : ''}
${params.instructions ? `- Instructions particulières: ${params.instructions}` : ''}${contextLine}

Crée des questions variées, progressives et adaptées aux élèves de ${params.grade}e année.`

  return { system, user }
}
