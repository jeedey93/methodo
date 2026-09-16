import type { LessonPlanParams } from '@/types/ai'

export function buildLessonPlanPrompt(params: LessonPlanParams): { system: string; user: string } {
  const system = `Tu es un expert en pédagogie québécoise au niveau primaire, spécialisé dans la création de planifications de cours selon le Programme de formation de l'école québécoise (PFÉQ).

Tu dois toujours répondre en français québécois. Tu génères des planifications détaillées, pratiques et adaptées à la réalité des enseignants.

IMPORTANT: Tu dois retourner UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après, sans bloc de code markdown. Suis exactement cette structure:

{
  "title": "Titre de la planification",
  "grade": "niveau",
  "subject": "matière",
  "objectives": ["objectif 1", "objectif 2"],
  "introduction": "Description de la mise en situation",
  "phases": [
    {
      "name": "Mise en situation",
      "duration": 10,
      "description": "Description de la phase",
      "activities": ["activité 1", "activité 2"],
      "materials": ["matériel 1"]
    }
  ],
  "materials": ["liste du matériel nécessaire"],
  "differentiation": [
    {
      "group": "Élèves en difficulté",
      "strategy": "stratégie adaptée"
    }
  ],
  "conclusion": "Description de la conclusion et objectivation",
  "assessmentCheck": "Comment vérifier les apprentissages",
  "totalDuration": 60
}`

  const contextLine = params.teacherContext
    ? `\nContexte de l'enseignant: ${params.teacherContext.firstName}, ${params.teacherContext.grades.join(', ')}, matières: ${params.teacherContext.subjects.join(', ')}`
    : ''

  const user = `Crée une planification de cours pour:
- Niveau: ${params.grade}e année du primaire
- Matière: ${params.subject}
- Sujet: ${params.topic}
- Nombre de périodes: ${params.periods}
- Durée par période: ${params.duration} minutes
- Objectif principal: ${params.objective}
- Niveau de difficulté: ${params.difficulty}
${params.differentiation ? `- Besoins de différenciation: ${params.differentiation}` : ''}
${params.constraints ? `- Contraintes particulières: ${params.constraints}` : ''}${contextLine}

Génère une planification complète avec des activités concrètes et engageantes pour des élèves de ${params.grade}e année.`

  return { system, user }
}
