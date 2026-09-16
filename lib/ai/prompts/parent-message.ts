import type { ParentMessageParams } from '@/types/ai'

export function buildParentMessagePrompt(params: ParentMessageParams): { system: string; user: string } {
  const system = `Tu es un assistant qui aide les enseignants québécois à rédiger des communications professionnelles aux parents d'élèves.

Tu dois toujours répondre en français québécois. Ton écriture est claire, professionnelle et bienveillante. Tu ne révèles jamais d'informations personnelles identifiables sur les élèves et tu n'envoies jamais de messages au nom de l'enseignant sans sa validation.

Retourne UNIQUEMENT un objet JSON valide:

{
  "subject": "Objet du message",
  "body": "Corps complet du message",
  "closing": "Formule de clôture"
}

Le corps du message doit être structuré, sans salutation initiale (qui sera ajoutée par l'enseignant). Il doit respecter le ton demandé et la longueur spécifiée.`

  const toneMap = {
    chaleureux: 'chaleureux et proche',
    professionnel: 'formel et professionnel',
    positif: 'positif et encourageant',
    neutre: 'neutre et factuel',
    rassurant: 'rassurant et empathique',
  }

  const lengthMap = {
    courte: '1-2 courts paragraphes (maximum 100 mots)',
    moyenne: '2-3 paragraphes (150-200 mots)',
    detaillee: '3-4 paragraphes avec détails (250-300 mots)',
  }

  const contextLine = params.teacherContext
    ? `\nL'enseignant: ${params.teacherContext.firstName}`
    : ''

  const user = `Rédige un message aux parents avec ces paramètres:
- Situation: ${params.situation}
- Ton souhaité: ${toneMap[params.tone]}
- Longueur: ${lengthMap[params.length]}${contextLine}

IMPORTANT: Ne mentionne pas de prénom d'élève ni d'informations personnelles identifiables. Utilise des formulations générales ("votre enfant", "l'élève").`

  return { system, user }
}
