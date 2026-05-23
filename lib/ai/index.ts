/**
 * AI service factory.
 * Swap provider by setting NEXT_PUBLIC_AI_PROVIDER or adding real implementations.
 */
import type { AIService } from './types'
import { placeholderAI } from './placeholder'

// Real provider implementations go here — same AIService interface, drop-in replaceable.
// import { openaiService } from './openai'
// import { anthropicService } from './anthropic'

function getAIService(): AIService {
  const provider = process.env.NEXT_PUBLIC_AI_PROVIDER ?? 'placeholder'

  switch (provider) {
    // case 'openai':     return openaiService
    // case 'anthropic':  return anthropicService
    default:           return placeholderAI
  }
}

export const ai = getAIService()

export type { AIService } from './types'
