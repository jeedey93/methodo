export type GradeLevel = '1' | '2' | '3' | '4' | '5' | '6'

export type Subject =
  | 'francais'
  | 'mathematiques'
  | 'sciences'
  | 'univers_social'
  | 'arts_plastiques'
  | 'education_physique'
  | 'anglais'
  | 'autre'

export const GRADE_LABELS: Record<GradeLevel, string> = {
  '1': '1re année',
  '2': '2e année',
  '3': '3e année',
  '4': '4e année',
  '5': '5e année',
  '6': '6e année',
}

export const SUBJECT_LABELS: Record<Subject, string> = {
  francais: 'Français',
  mathematiques: 'Mathématiques',
  sciences: 'Sciences et technologie',
  univers_social: 'Univers social',
  arts_plastiques: 'Arts plastiques',
  education_physique: 'Éducation physique',
  anglais: 'Anglais',
  autre: 'Autre',
}

export interface TeacherContext {
  firstName: string
  grades: string[]
  subjects: string[]
  language: string
}

export interface LessonPlanParams {
  grade: string
  subject: string
  topic: string
  periods: number
  duration: number
  objective: string
  difficulty: 'facile' | 'moyen' | 'difficile'
  differentiation?: string
  constraints?: string
  teacherContext?: TeacherContext
}

export interface WorksheetParams {
  type: string
  grade: string
  subject: string
  topic: string
  difficulty: string
  questionCount: number
  duration?: number
  instructions?: string
  teacherContext?: TeacherContext
}

export interface AssessmentParams {
  type: string
  grade: string
  subject: string
  topic: string
  questionCount: number
  difficulty: string
  duration?: number
  questionTypes: string[]
  teacherContext?: TeacherContext
}

export interface ParentMessageParams {
  situation: string
  tone: 'chaleureux' | 'professionnel' | 'positif' | 'neutre' | 'rassurant'
  length: 'courte' | 'moyenne' | 'detaillee'
  teacherContext?: TeacherContext
}

export interface LessonPhase {
  name: string
  duration: number
  description: string
  activities: string[]
  materials?: string[]
}

export interface DifferentiationNote {
  group: string
  strategy: string
}

export interface LessonPlanContent {
  title: string
  grade: string
  subject: string
  objectives: string[]
  introduction: string
  phases: LessonPhase[]
  materials: string[]
  differentiation?: DifferentiationNote[]
  conclusion: string
  assessmentCheck: string
  totalDuration: number
}

export interface WorksheetQuestion {
  number: number
  type: 'texte' | 'choix_multiple' | 'vrai_faux' | 'courte'
  question: string
  options?: string[]
  points?: number
  space?: number
}

export interface WorksheetContent {
  title: string
  grade: string
  subject: string
  instructions: string
  questions: WorksheetQuestion[]
  answerKey?: Array<{ number: number; answer: string }>
}

export interface AssessmentSection {
  title: string
  instructions?: string
  questions: WorksheetQuestion[]
}

export interface AssessmentContent {
  title: string
  grade: string
  subject: string
  duration: number
  totalPoints: number
  instructions: string
  sections: AssessmentSection[]
  answerKey?: Array<{ number: number; answer: string; explanation?: string }>
  successCriteria: string[]
}

export interface ParentMessageContent {
  subject: string
  body: string
  closing: string
}

export interface AIGenerationResult<T> {
  data: T
  tokensUsed?: number
  model: string
  durationMs: number
}
