import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider } from './provider'
import type {
  LessonPlanParams, LessonPlanContent,
  WorksheetParams, WorksheetContent,
  AssessmentParams, AssessmentContent,
  ParentMessageParams, ParentMessageContent,
  AIGenerationResult,
} from '@/types/ai'
import { buildLessonPlanPrompt } from './prompts/lesson-plan'
import { buildWorksheetPrompt } from './prompts/worksheet'
import { buildAssessmentPrompt } from './prompts/assessment'
import { buildParentMessagePrompt } from './prompts/parent-message'

const DEFAULT_MODEL = 'claude-sonnet-4-5'

class AnthropicProvider implements AIProvider {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  private async callClaude<T>(
    systemPrompt: string,
    userPrompt: string,
    maxTokens = 4096,
  ): Promise<{ raw: string; tokensUsed: number; model: string; durationMs: number }> {
    const start = Date.now()
    const response = await this.client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })
    const raw = response.content[0].type === 'text' ? response.content[0].text : ''
    return {
      raw,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      model: response.model,
      durationMs: Date.now() - start,
    }
  }

  private parseJSON<T>(raw: string): T {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned) as T
  }

  async generateLessonPlan(params: LessonPlanParams): Promise<AIGenerationResult<LessonPlanContent>> {
    const { system, user } = buildLessonPlanPrompt(params)
    const { raw, tokensUsed, model, durationMs } = await this.callClaude(system, user)
    return { data: this.parseJSON<LessonPlanContent>(raw), tokensUsed, model, durationMs }
  }

  async generateWorksheet(params: WorksheetParams): Promise<AIGenerationResult<WorksheetContent>> {
    const { system, user } = buildWorksheetPrompt(params)
    const { raw, tokensUsed, model, durationMs } = await this.callClaude(system, user)
    return { data: this.parseJSON<WorksheetContent>(raw), tokensUsed, model, durationMs }
  }

  async generateAssessment(params: AssessmentParams): Promise<AIGenerationResult<AssessmentContent>> {
    const { system, user } = buildAssessmentPrompt(params)
    const { raw, tokensUsed, model, durationMs } = await this.callClaude(system, user)
    return { data: this.parseJSON<AssessmentContent>(raw), tokensUsed, model, durationMs }
  }

  async generateParentMessage(params: ParentMessageParams): Promise<AIGenerationResult<ParentMessageContent>> {
    const { system, user } = buildParentMessagePrompt(params)
    const { raw, tokensUsed, model, durationMs } = await this.callClaude(system, user)
    return { data: this.parseJSON<ParentMessageContent>(raw), tokensUsed, model, durationMs }
  }
}

let _instance: AIProvider | null = null

export function getAIProvider(): AIProvider {
  if (!_instance) {
    _instance = new AnthropicProvider()
  }
  return _instance
}
