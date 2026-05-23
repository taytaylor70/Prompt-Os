export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// ─── Domain Types ────────────────────────────────────────────────────────────

export type TargetModel =
  | 'gpt-4o'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'
  | 'claude-3-5-sonnet'
  | 'claude-3-opus'
  | 'claude-3-haiku'
  | 'gemini-1.5-pro'
  | 'llama-3.1-70b'
  | 'mistral-large'
  | 'any'

export type OutputType = 'text' | 'json' | 'code' | 'markdown' | 'list' | 'table' | 'email' | 'other'

export type Tone =
  | 'professional'
  | 'casual'
  | 'technical'
  | 'creative'
  | 'formal'
  | 'friendly'
  | 'authoritative'
  | 'concise'

export type PromptCategory =
  | 'coding'
  | 'writing'
  | 'analysis'
  | 'marketing'
  | 'research'
  | 'education'
  | 'productivity'
  | 'creative'
  | 'business'
  | 'data'
  | 'other'

// ─── Database Row Types ───────────────────────────────────────────────────────

export interface Prompt {
  id: string
  user_id: string
  title: string
  description: string | null
  prompt_text: string
  category: PromptCategory
  target_model: TargetModel
  output_type: OutputType
  tone: Tone
  score: number | null
  is_favorite: boolean
  is_public: boolean
  created_at: string
  updated_at: string
  // joined
  tags?: Tag[]
  latest_score?: PromptScore | null
}

export interface PromptVersion {
  id: string
  prompt_id: string
  user_id: string
  prompt_text: string
  version_number: number
  change_note: string | null
  created_at: string
}

export interface PromptScore {
  id: string
  prompt_id: string
  total: number
  clarity: number
  specificity: number
  context: number
  output_control: number
  reusability: number
  model_compatibility: number
  safety: number
  commercial_value: number
  recommendations: string[]
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
}

export interface Tag {
  id: string
  name: string
  slug: string
  color: string | null
}

export interface PromptTag {
  prompt_id: string
  tag_id: string
}

export interface UserSettings {
  user_id: string
  default_model: TargetModel
  default_tone: Tone
  default_output_type: OutputType
  theme: 'dark' | 'light' | 'system'
  email_notifications: boolean
  updated_at: string
}

export interface AnalyticsEvent {
  id: string
  user_id: string | null
  event_name: string
  properties: Json
  created_at: string
}

// ─── AI Service Types ─────────────────────────────────────────────────────────

export interface ScoreDimensions {
  clarity: number
  specificity: number
  context: number
  output_control: number
  reusability: number
  model_compatibility: number
  safety: number
  commercial_value: number
}

export interface ScoreResult {
  total: number
  dimensions: ScoreDimensions
  recommendations: string[]
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'
}

export interface EnhanceResult {
  enhanced_prompt: string
  changes: string[]
  improvement_summary: string
}

// ─── UI / Component Types ─────────────────────────────────────────────────────

export interface DashboardStats {
  total_prompts: number
  avg_score: number
  prompts_this_week: number
  top_category: PromptCategory | null
  score_trend: number // delta vs last week
}

export interface PricingTier {
  id: 'free' | 'pro' | 'team'
  name: string
  price_monthly: number
  price_yearly: number
  description: string
  features: string[]
  limits: {
    prompts: number | 'unlimited'
    enhancements_per_month: number | 'unlimited'
    versions_per_prompt: number | 'unlimited'
    team_members: number | 'unlimited'
  }
  badge?: string
  highlighted?: boolean
}

export type SortOption = 'newest' | 'oldest' | 'highest_score' | 'lowest_score' | 'title_asc'

export interface VaultFilters {
  category: PromptCategory | 'all'
  tags: string[]
  target_model: TargetModel | 'all'
  sort: SortOption
  search: string
}
