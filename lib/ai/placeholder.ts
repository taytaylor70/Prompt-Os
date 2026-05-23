/**
 * Placeholder AI service — uses heuristics to score/enhance prompts without
 * an API key. Drop-in replaceable with real OpenAI/Anthropic implementations.
 */
import type { AIService } from './types'
import type { ScoreResult, EnhanceResult, TargetModel } from '@/types'
import { scoreToGrade, countWords } from '@/lib/utils'

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)))
}

function scoreClarity(text: string): number {
  const words = countWords(text)
  const hasClearVerb = /\b(write|create|generate|analyze|summarize|explain|list|compare|build|describe|draft)\b/i.test(text)
  const hasAmbiguous  = /\b(something|stuff|thing|maybe|sort of|kind of)\b/i.test(text)
  let score = 50
  if (hasClearVerb)  score += 20
  if (!hasAmbiguous) score += 15
  if (words >= 20)   score += 15
  if (words >= 50)   score += 10
  return clamp(score)
}

function scoreSpecificity(text: string): number {
  const words = countWords(text)
  const hasNumbers   = /\b\d+\b/.test(text)
  const hasExamples  = /\b(example|e\.g\.|for instance|such as|like)\b/i.test(text)
  const hasQuotes    = /"[^"]{3,}"/.test(text)
  const hasSteps     = /\b(step|first|second|third|then|finally|lastly)\b/i.test(text)
  let score = 40
  if (words  >= 30)  score += 15
  if (words  >= 60)  score += 10
  if (hasNumbers)    score += 10
  if (hasExamples)   score += 10
  if (hasQuotes)     score += 10
  if (hasSteps)      score += 10
  return clamp(score)
}

function scoreContext(text: string): number {
  const hasBackground = /\b(context|background|scenario|situation|role|you are|act as|assume)\b/i.test(text)
  const hasAudience   = /\b(audience|user|reader|customer|client|student|developer)\b/i.test(text)
  const hasPurpose    = /\b(goal|purpose|objective|aim|want|need|trying to)\b/i.test(text)
  let score = 35
  if (hasBackground) score += 25
  if (hasAudience)   score += 20
  if (hasPurpose)    score += 20
  return clamp(score)
}

function scoreOutputControl(text: string): number {
  const hasFormat  = /\b(format|json|markdown|bullet|list|table|paragraph|heading|section)\b/i.test(text)
  const hasLength  = /\b(\d+\s*(words?|sentences?|paragraphs?|lines?|characters?|tokens?))\b/i.test(text)
  const hasTone    = /\b(tone|style|voice|formal|casual|professional|concise|detailed)\b/i.test(text)
  const hasDelimit = /\b(return only|output only|respond with|provide only)\b/i.test(text)
  let score = 30
  if (hasFormat)   score += 25
  if (hasLength)   score += 20
  if (hasTone)     score += 15
  if (hasDelimit)  score += 15
  return clamp(score)
}

function scoreReusability(text: string): number {
  const hasVariables   = /\{[\w\s]+\}|\[[\w\s]+\]|<[\w\s]+>|\$\{[\w]+\}/.test(text)
  const hasPlaceholder = /\b(insert|replace|your|customize|fill in)\b/i.test(text)
  const isGeneric      = !/\b(my name is|I am|today|yesterday|last week)\b/i.test(text)
  let score = 45
  if (hasVariables)   score += 30
  if (hasPlaceholder) score += 15
  if (isGeneric)      score += 10
  return clamp(score)
}

function scoreModelCompatibility(text: string, model: TargetModel): number {
  const len = text.length
  let score = 65
  // Penalize very short or very long prompts
  if (len < 50)    score -= 20
  if (len > 4000)  score -= 10
  if (len > 8000 && (model === 'gpt-3.5-turbo' || model === 'claude-3-haiku')) score -= 15
  // Reward structured prompts for capable models
  if (len > 200 && (model === 'gpt-4o' || model === 'claude-3-5-sonnet' || model === 'any')) score += 10
  return clamp(score)
}

function scoreSafety(text: string): number {
  const unsafe = /\b(hack|jailbreak|ignore previous|bypass|pretend you have no|DAN|do anything now)\b/i.test(text)
  const hasSafeGuard = /\b(safe|appropriate|ethical|responsible|professional)\b/i.test(text)
  let score = 85
  if (unsafe)      score -= 50
  if (hasSafeGuard) score += 10
  return clamp(score)
}

function scoreCommercialValue(text: string): number {
  const hasBusinessContext = /\b(business|product|customer|revenue|conversion|ROI|marketing|sales|brand|enterprise)\b/i.test(text)
  const hasProfessional    = /\b(professional|expert|quality|detailed|comprehensive|thorough)\b/i.test(text)
  const isReusable         = /\{[\w\s]+\}|\[[\w\s]+\]/.test(text)
  let score = 40
  if (hasBusinessContext) score += 25
  if (hasProfessional)    score += 15
  if (isReusable)         score += 20
  return clamp(score)
}

function buildRecommendations(text: string, dims: Record<string, number>): string[] {
  const recs: string[] = []

  if (dims.clarity < 60)
    recs.push('Start with a clear action verb (e.g., "Write", "Analyze", "Generate") to make the intent explicit.')

  if (dims.specificity < 60)
    recs.push('Add specific details, numbers, or concrete examples to reduce ambiguity.')

  if (dims.context < 55)
    recs.push('Provide context: define the role, audience, or background situation.')

  if (dims.output_control < 55)
    recs.push('Specify the desired output format (e.g., JSON, bullet points, paragraph count).')

  if (dims.reusability < 55)
    recs.push('Add template variables like {topic} or [audience] to make this prompt reusable.')

  if (dims.model_compatibility < 60)
    recs.push('Consider the target model\'s context limit — restructure if the prompt is too long or too short.')

  if (dims.safety < 70)
    recs.push('Review the prompt for potentially unsafe or ambiguous instructions.')

  if (dims.commercial_value < 50)
    recs.push('Frame the prompt in a business or professional context to increase its commercial applicability.')

  if (recs.length === 0)
    recs.push('This is a high-quality prompt. Consider adding version notes to track improvements over time.')

  return recs
}

export const placeholderAI: AIService = {
  async scorePrompt(promptText: string, targetModel: TargetModel = 'any'): Promise<ScoreResult> {
    await new Promise(r => setTimeout(r, 600)) // simulate latency

    const dims = {
      clarity:             scoreClarity(promptText),
      specificity:         scoreSpecificity(promptText),
      context:             scoreContext(promptText),
      output_control:      scoreOutputControl(promptText),
      reusability:         scoreReusability(promptText),
      model_compatibility: scoreModelCompatibility(promptText, targetModel),
      safety:              scoreSafety(promptText),
      commercial_value:    scoreCommercialValue(promptText),
    }

    const weights = {
      clarity:             0.20,
      specificity:         0.18,
      context:             0.15,
      output_control:      0.13,
      reusability:         0.12,
      model_compatibility: 0.10,
      safety:              0.07,
      commercial_value:    0.05,
    }

    const total = clamp(
      Object.entries(dims).reduce(
        (sum, [key, val]) => sum + val * (weights[key as keyof typeof weights] ?? 0),
        0
      )
    )

    return {
      total,
      dimensions: dims,
      recommendations: buildRecommendations(promptText, dims),
      grade: scoreToGrade(total),
    }
  },

  async enhancePrompt(promptText: string, instruction = ''): Promise<EnhanceResult> {
    await new Promise(r => setTimeout(r, 1000))

    const enhanced = `You are an expert assistant. ${instruction ? `Task: ${instruction}. ` : ''}

${promptText.trim()}

Please ensure your response is:
- Clear and well-structured
- Comprehensive yet concise
- Formatted appropriately for the content type
- Professional in tone

Provide your response below:`

    return {
      enhanced_prompt: enhanced,
      changes: [
        'Added expert persona framing',
        'Included formatting constraints',
        'Added professional tone directive',
        instruction ? `Applied custom instruction: "${instruction}"` : 'Added output structure guidance',
      ],
      improvement_summary: 'Enhanced with role-priming, output formatting guidance, and tone directives.',
    }
  },

  async suggestTags(promptText: string): Promise<string[]> {
    await new Promise(r => setTimeout(r, 300))
    const tagMap: [RegExp, string][] = [
      [/\b(code|function|class|algorithm|debug|refactor)\b/i, 'coding'],
      [/\b(write|essay|blog|article|copy|content)\b/i,       'writing'],
      [/\b(analyze|analysis|data|metrics|insights)\b/i,      'analysis'],
      [/\b(market|brand|campaign|audience|conversion)\b/i,   'marketing'],
      [/\b(research|study|literature|survey|review)\b/i,     'research'],
      [/\b(json|api|schema|structure|format)\b/i,            'structured-output'],
      [/\b(creative|story|fiction|imagine|narrative)\b/i,    'creative'],
      [/\b(summarize|summary|tldr|brief)\b/i,                'summarization'],
      [/\b(translate|language|multilingual)\b/i,             'translation'],
      [/\b(customer|support|service|help)\b/i,               'customer-success'],
    ]
    return tagMap.filter(([re]) => re.test(promptText)).map(([, tag]) => tag).slice(0, 5)
  },

  async suggestTitle(promptText: string): Promise<string> {
    await new Promise(r => setTimeout(r, 200))
    const words = promptText.trim().split(/\s+/).slice(0, 8).join(' ')
    return words.charAt(0).toUpperCase() + words.slice(1)
  },
}
