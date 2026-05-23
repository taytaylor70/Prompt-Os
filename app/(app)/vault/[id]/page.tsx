import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Copy, Clock, Tag, Cpu, FileText, Mic2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TopNav } from '@/components/top-nav'
import { ScoreBadge } from '@/components/score-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PromptScorePanel } from '@/components/prompt-score-panel'
import { categoryIcon, modelLabel, formatDate, scoreToGrade } from '@/lib/utils'
import type { Prompt, PromptVersion, PromptScore } from '@/types'

async function getPrompt(id: string) {
  const supabase = await createClient()

  const [{ data: prompt }, { data: versions }, { data: scores }] = await Promise.all([
    supabase
      .from('prompts')
      .select('*, tags:prompt_tags(tag:tags(*))')
      .eq('id', id)
      .single(),
    supabase
      .from('prompt_versions')
      .select('*')
      .eq('prompt_id', id)
      .order('version_number', { ascending: false })
      .limit(10),
    supabase
      .from('prompt_scores')
      .select('*')
      .eq('prompt_id', id)
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  return {
    prompt:   prompt as unknown as Prompt | null,
    versions: (versions ?? []) as PromptVersion[],
    latestScore: (scores?.[0] ?? null) as PromptScore | null,
  }
}

export default async function PromptDetailPage({ params }: { params: { id: string } }) {
  const { prompt, versions, latestScore } = await getPrompt(params.id)
  if (!prompt) notFound()

  const scoreResult = latestScore ? {
    total: latestScore.total,
    dimensions: {
      clarity:             latestScore.clarity,
      specificity:         latestScore.specificity,
      context:             latestScore.context,
      output_control:      latestScore.output_control,
      reusability:         latestScore.reusability,
      model_compatibility: latestScore.model_compatibility,
      safety:              latestScore.safety,
      commercial_value:    latestScore.commercial_value,
    },
    recommendations: latestScore.recommendations,
    grade:           scoreToGrade(latestScore.total),
  } : null

  return (
    <div className="flex flex-col flex-1">
      <TopNav
        title={prompt.title}
        subtitle={`${categoryIcon(prompt.category)} ${prompt.category} · ${modelLabel(prompt.target_model)}`}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/builder?edit=${prompt.id}`}>
              <Button variant="secondary" size="sm">
                <Edit className="w-3.5 h-3.5" />
                Edit
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 max-w-3xl">
          {/* Back */}
          <Link href="/vault" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors w-fit">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Vault
          </Link>

          {/* Header card */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-100 mb-1">{prompt.title}</h1>
                {prompt.description && (
                  <p className="text-sm text-slate-400">{prompt.description}</p>
                )}
              </div>
              <ScoreBadge score={prompt.score} size="md" showGrade />
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="default"><Cpu className="w-3 h-3" />{modelLabel(prompt.target_model)}</Badge>
              <Badge variant="default"><FileText className="w-3 h-3" />{prompt.output_type}</Badge>
              <Badge variant="default"><Mic2 className="w-3 h-3" />{prompt.tone}</Badge>
              <Badge variant="default"><Clock className="w-3 h-3" />{formatDate(prompt.created_at)}</Badge>
            </div>

            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {prompt.tags.map(tag => (
                  <Badge key={tag.id} variant="accent" size="sm">
                    <Tag className="w-2.5 h-2.5" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Prompt text */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prompt Text</p>
              <CopyButton text={prompt.prompt_text} />
            </div>
            <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
              {prompt.prompt_text}
            </pre>
          </div>

          {/* Version history */}
          {versions.length > 0 && (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Version History ({versions.length})
              </p>
              <div className="flex flex-col gap-2">
                {versions.map(v => (
                  <div key={v.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                    <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 mt-0.5">
                      v{v.version_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-1">{formatDate(v.created_at)}</p>
                      <p className="text-xs text-slate-400 font-mono truncate">{v.prompt_text.slice(0, 100)}…</p>
                      {v.change_note && <p className="text-xs text-slate-600 mt-1 italic">{v.change_note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Score sidebar */}
        <div className="w-72 xl:w-80 border-l border-white/[0.07] bg-white/[0.01] overflow-y-auto p-5 shrink-0">
          <PromptScorePanel result={scoreResult as any} />
        </div>
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  'use client'
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text) }}
      className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-colors"
    >
      <Copy className="w-3 h-3" />
      Copy
    </button>
  )
}
