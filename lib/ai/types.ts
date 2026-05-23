import type { ScoreResult, EnhanceResult, TargetModel } from '@/types'

export interface AIService {
  scorePrompt(promptText: string, targetModel?: TargetModel): Promise<ScoreResult>
  enhancePrompt(promptText: string, instruction?: string): Promise<EnhanceResult>
  suggestTags(promptText: string): Promise<string[]>
  suggestTitle(promptText: string): Promise<string>
}

export type AIProvider = 'openai' | 'anthropic' | 'placeholder'
