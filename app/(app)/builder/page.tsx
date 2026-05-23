'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Wand2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TopNav } from '@/components/top-nav'
import { PromptEditor } from '@/components/prompt-editor'
import { PromptScorePanel } from '@/components/prompt-score-panel'
import { TagSelector } from '@/components/tag-selector'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { useScore } from '@/hooks/use-score'
import type { PromptCategory, TargetModel, OutputType, Tone } from '@/types'

const CATEGORY_OPTIONS  = ['coding','writing','analysis','marketing','research','education','productivity','creative','business','data','other'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))
const MODEL_OPTIONS     = [
  { value: 'any',               label: 'Any Model' },
  { value: 'gpt-4o',            label: 'GPT-4o' },
  { value: 'gpt-4-turbo',       label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo',     label: 'GPT-3.5 Turbo' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-opus',     label: 'Claude 3 Opus' },
  { value: 'claude-3-haiku',    label: 'Claude 3 Haiku' },
  { value: 'gemini-1.5-pro',    label: 'Gemini 1.5 Pro' },
  { value: 'llama-3.1-70b',     label: 'Llama 3.1 70B' },
  { value: 'mistral-large',     label: 'Mistral Large' },
]
const OUTPUT_OPTIONS    = ['text','json','code','markdown','list','table','email','other'].map(v => ({ value: v, label: v.toUpperCase() }))
const TONE_OPTIONS      = ['professional','casual','technical','creative','formal','friendly','authoritative','concise'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))

export default function BuilderPage() {
  const router   = useRouter()
  const supabase = createClient()
  const { result, loading: scoring, score } = useScore()

  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [promptText,  setPromptText]  = useState('')
  const [category,    setCategory]    = useState<PromptCategory>('other')
  const [model,       setModel]       = useState<TargetModel>('any')
  const [outputType,  setOutputType]  = useState<OutputType>('text')
  const [tone,        setTone]        = useState<Tone>('professional')
  const [tags,        setTags]        = useState<string[]>([])
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  // Auto-score on prompt change
  useEffect(() => {
    if (promptText.trim().length > 20) {
      score(promptText, model)
    }
  }, [promptText, model, score])

  async function handleSave() {
    if (!title.trim() || !promptText.trim()) {
      setError('Title and prompt text are required')
      return
    }
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: prompt, error: err } = await supabase
        .from('prompts')
        .insert({
          user_id:     user.id,
          title:       title.trim(),
          description: description.trim() || null,
          prompt_text: promptText.trim(),
          category,
          target_model: model,
          output_type:  outputType,
          tone,
          score:        result?.total ?? null,
        })
        .select()
        .single()

      if (err) throw err

      // Save tags
      if (tags.length > 0 && prompt) {
        const tagRows = await Promise.all(tags.map(async name => {
          const slug = name.toLowerCase().replace(/\s+/g, '-')
          const { data } = await supabase
            .from('tags')
            .upsert({ name, slug }, { onConflict: 'slug' })
            .select('id')
            .single()
          return data?.id
        }))

        const validTags = tagRows.filter(Boolean) as string[]
        if (validTags.length > 0) {
          await supabase.from('prompt_tags').insert(
            validTags.map(tag_id => ({ prompt_id: prompt.id, tag_id }))
          )
        }

        // Save score breakdown
        if (result) {
          await supabase.from('prompt_scores').insert({
            prompt_id:           prompt.id,
            total:               result.total,
            ...result.dimensions,
            recommendations:     result.recommendations,
          })
        }
      }

      router.push(`/vault/${prompt.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <TopNav
        title="Prompt Builder"
        subtitle="Craft a new prompt"
        action={
          <Button onClick={handleSave} loading={saving} size="sm">
            <Save className="w-3.5 h-3.5" />
            Save prompt
          </Button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: form */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Title"
                placeholder="e.g. Senior developer code review prompt"
                value={title}
                onChange={e => setTitle(e.target.value)}
                id="title"
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Description (optional)"
                placeholder="What does this prompt do?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                id="description"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Category"    options={CATEGORY_OPTIONS} value={category}   onChange={e => setCategory(e.target.value as PromptCategory)} />
            <Select label="Target Model" options={MODEL_OPTIONS}   value={model}      onChange={e => setModel(e.target.value as TargetModel)} />
            <Select label="Output Type" options={OUTPUT_OPTIONS}   value={outputType} onChange={e => setOutputType(e.target.value as OutputType)} />
            <Select label="Tone"        options={TONE_OPTIONS}     value={tone}       onChange={e => setTone(e.target.value as Tone)} />
          </div>

          <PromptEditor
            label="Prompt Text"
            value={promptText}
            onChange={setPromptText}
            placeholder="Write your prompt here. Be specific about the task, context, format, and any constraints…"
            minHeight={280}
          />

          <TagSelector selected={tags} onChange={setTags} />
        </div>

        {/* Right: score panel */}
        <div className="w-72 xl:w-80 border-l border-white/[0.07] bg-white/[0.01] overflow-y-auto p-5 shrink-0">
          <PromptScorePanel result={result} loading={scoring} />

          {/* Tips */}
          <div className="mt-6 pt-5 border-t border-white/[0.07]">
            <div className="flex items-center gap-2 mb-3">
              <Wand2 className="w-3.5 h-3.5 text-accent-400" />
              <p className="text-xs font-semibold text-slate-400">Builder Tips</p>
            </div>
            <ul className="flex flex-col gap-2">
              {[
                'Start with a clear action verb',
                'Specify the audience and context',
                'Define the exact output format',
                'Use {variables} for reusability',
              ].map(tip => (
                <li key={tip} className="text-[11px] text-slate-600 flex gap-1.5">
                  <span className="text-accent-600 shrink-0">·</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
