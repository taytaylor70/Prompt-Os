import type { AIService } from './types'
import { placeholderAI } from './placeholder'
import { openaiService } from './openai'

function getAIService(): AIService {
  if (process.env.OPENAI_API_KEY) return openaiService
  return placeholderAI
}

export const ai = getAIService()

export type { AIService } from './types'
