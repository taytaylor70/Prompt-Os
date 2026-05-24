import OpenAI from 'openai'
import type { AIService } from './types'
import type { ScoreResult, EnhanceResult, TargetModel } from '@/types'
import { scoreToGrade } from '@/lib/utils'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SCORE_SYSTEM = `You are an expert prompt engineer. Evaluate the given prompt across 8 dimensions and return ONLY valid JSON — no prose, no markdown fences.

Schema:
{
  "clarity": 0-100,
  "specificity": 0-100,
  "context": 0-100,
  "output_control": 0-100,
  "reusability": 0-100,
  "model_compatibility": 0-100,
  "safety": 0-100,
  "commercial_value": 0-100,
  "recommendations": ["string", ...]
}

Dimension guidance:
- clarity: Is the intent unambiguous? Clear action verb?
- specificity: Concrete details, numbers, examples vs vague language?
- context: Role, audience, background provided?
- output_control: Format, length, tone specified?
- reusability: Template variables, generic vs one-off?
- model_compatibility: Well-suited to stated/implied model? Appropriate length?
- safety: Avoids harmful, jailbreak, or edge-case outputs?
- commercial_value: Useful in a professional or product context?

Be rigorous. A mediocre prompt should score 50-65. Only truly excellent prompts score 85+.`

const ENHANCE_SYSTEM = `You are an expert prompt engineer. Improve the given prompt based on the optional instruction.
Return ONLY valid JSON — no prose, no markdown fences.

Schema:
{
  "enhanced_prompt": "the improved prompt text",
  "changes": ["change 1", "change 2", ...],
  "improvement_summary": "one sentence summary of what changed and why"
}`

const TAG_SYSTEM = `You are an expert prompt engineer. Suggest 1-5 relevant tags for the given prompt.
Return ONLY a JSON array of lowercase hyphenated strings. Example: ["coding", "python", "data-analysis"]
Choose from or extend: coding, writing, analysis, marketing, research, education, creative, summarization, translation, customer-success, productivity, data, business, structured-output, reasoning, roleplay`

const TITLE_SYSTEM = `You are an expert prompt engineer. Suggest a concise, descriptive title (4-8 words) for the given prompt.
Return ONLY the title string — no quotes, no punctuation at the end.`

export const openaiService: AIService = {
  async scorePrompt(promptText: string, targetModel: TargetModel = 'any'): Promise<ScoreResult> {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SCORE_SYSTEM },
        { role: 'user', content: `Target model: ${targetModel}\n\nPrompt to evaluate:\n${promptText}` },
      ],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const raw = JSON.parse(response.choices[0].message.content ?? '{}')
    const dims = {
      clarity:             clamp(raw.clarity),
      specificity:         clamp(raw.specificity),
      context:             clamp(raw.context),
      output_control:      clamp(raw.output_control),
      reusability:         clamp(raw.reusability),
      model_compatibility: clamp(raw.model_compatibility),
      safety:              clamp(raw.safety),
      commercial_value:    clamp(raw.commercial_value),
    }
    const weights = { clarity: 0.20, specificity: 0.18, context: 0.15, output_control: 0.13, reusability: 0.12, model_compatibility: 0.10, safety: 0.07, commercial_value: 0.05 }
    const total = clamp(Object.entries(dims).reduce((s, [k, v]) => s + v * (weights[k as keyof typeof weights] ?? 0), 0))

    return {
      total,
      dimensions: dims,
      recommendations: Array.isArray(raw.recommendations) ? raw.recommendations.slice(0, 5) : [],
      grade: scoreToGrade(total),
    }
  },

  async enhancePrompt(promptText: string, instruction = ''): Promise<EnhanceResult> {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: ENHANCE_SYSTEM },
        { role: 'user', content: `${instruction ? `Instruction: ${instruction}\n\n` : ''}Prompt to enhance:\n${promptText}` },
      ],
      temperature: 0.4,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    })

    const raw = JSON.parse(response.choices[0].message.content ?? '{}')
    return {
      enhanced_prompt:     raw.enhanced_prompt     ?? promptText,
      changes:             raw.changes             ?? [],
      improvement_summary: raw.improvement_summary ?? '',
    }
  },

  async suggestTags(promptText: string): Promise<string[]> {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: TAG_SYSTEM },
        { role: 'user', content: promptText },
      ],
      temperature: 0.2,
      max_tokens: 80,
    })

    try {
      const tags = JSON.parse(response.choices[0].message.content ?? '[]')
      return Array.isArray(tags) ? tags.slice(0, 5) : []
    } catch {
      return []
    }
  },

  async suggestTitle(promptText: string): Promise<string> {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: TITLE_SYSTEM },
        { role: 'user', content: promptText.slice(0, 500) },
      ],
      temperature: 0.3,
      max_tokens: 30,
    })

    return response.choices[0].message.content?.trim() ?? ''
  },
}

function clamp(n: unknown): number {
  const num = typeof n === 'number' ? n : Number(n)
  return Math.max(0, Math.min(100, Math.round(isNaN(num) ? 0 : num)))
}
