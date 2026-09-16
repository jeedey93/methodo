import type {
  LessonPlanParams, LessonPlanContent,
  WorksheetParams, WorksheetContent,
  AssessmentParams, AssessmentContent,
  ParentMessageParams, ParentMessageContent,
  AIGenerationResult,
} from '@/types/ai'

export interface AIProvider {
  generateLessonPlan(params: LessonPlanParams): Promise<AIGenerationResult<LessonPlanContent>>
  generateWorksheet(params: WorksheetParams): Promise<AIGenerationResult<WorksheetContent>>
  generateAssessment(params: AssessmentParams): Promise<AIGenerationResult<AssessmentContent>>
  generateParentMessage(params: ParentMessageParams): Promise<AIGenerationResult<ParentMessageContent>>
}
