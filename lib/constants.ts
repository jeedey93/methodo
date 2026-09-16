export const GRADES = ['1', '2', '3', '4', '5', '6'] as const
export type GradeLevel = (typeof GRADES)[number]

export const GRADE_LABELS: Record<string, string> = {
  '1': '1re année',
  '2': '2e année',
  '3': '3e année',
  '4': '4e année',
  '5': '5e année',
  '6': '6e année',
}

export const SUBJECTS = [
  { value: 'francais', label: 'Français' },
  { value: 'mathematiques', label: 'Mathématiques' },
  { value: 'sciences', label: 'Sciences et technologie' },
  { value: 'univers_social', label: 'Univers social' },
  { value: 'arts_plastiques', label: 'Arts plastiques' },
  { value: 'education_physique', label: 'Éducation physique' },
  { value: 'anglais', label: 'Anglais' },
  { value: 'autre', label: 'Autre' },
] as const

export const RESOURCE_TYPES = [
  { value: 'planification', label: 'Planification' },
  { value: 'materiel', label: 'Matériel' },
  { value: 'evaluation', label: 'Évaluation' },
  { value: 'communication', label: 'Communication' },
] as const

export const WEEK_COLORS = [
  '#e0f2fe', '#fef9c3', '#dcfce7', '#fce7f3',
  '#ede9fe', '#ffedd5', '#f1f5f9', '#fee2e2',
] as const
