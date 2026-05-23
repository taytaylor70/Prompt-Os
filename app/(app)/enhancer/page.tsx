'use client'

import { useState } from 'react'
import { Sparkles, ArrowRight, Copy, Save } from 'lucide-react'
import { TopNav } from '@/components/top-nav'
import { PromptEditor } from '@/components/prompt-editor'
import { PromptScorePanel } from '@/components/prompt-score-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { EnhanceResult, ScoreResult } from '@/types'

export default function EnhancerPage() {
  const [original,    setOriginal]    = useState('')
  const [instruction, setInstruction] = useState('')
  const [result,      setResult]      = useState<EnhanceResult | null>(null)
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)
  const [enhancing,   setEnhancing]   = useState(false)
  const [scoring,     setScoring]     = useState(false)
  const [copied,      setCopied]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  async function handleEnhance() {
    if (!original.trim()) return
    setEnhancing(true)
    setError(null)
    setResult(null)
    setScoreResult(null)

    try {
      const res = await fetch('/api/enhance', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt: original, instruction }),
      })
      if (!res.ok) throw new Error('Enhancement failed')
      const data: EnhanceResult = await res.json()
      setResult(data)

      // Auto-score the enhanced version
      setScoring(true)
      const scoreRes = await fetch('/api/score', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt: data.enhanced_prompt }),
      })
      if (scoreRes.ok) setScoreResult(await scoreRes.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enhancement failed')
    } finally {
      setEnhancing(false)
      setScoring(false)
    }
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result.enhanced_prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleUseEnhanced() {
    if (result) {
      setOriginal(result.enhanced_prompt)
      setResult(null)
      setScoreResult(null)
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <TopNav title="Prompt Enhancer" subtitle="Transform rough ideas into precision prompts" />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Input section */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center">
                <span className="text-sm">📝</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Original Prompt</p>
                <p className="text-xs text-slate-600">Paste your rough prompt here</p>
              </div>
            </div>

            <PromptEditor
              value={original}
              onChange={setOriginal}
              placeholder="Paste your prompt here. It can be rough, incomplete, or vague — the Enhancer will turn it into something precise and powerful…"
              minHeight={200}
            />

            <Input
              placeholder="Enhancement instruction (optional) — e.g. 'Make it more concise' or 'Add JSON output format'"
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              id="instruction"
            />

            <Button
              onClick={handleEnhance}
              loading={enhancing}
              disabled={!original.trim()}
              className="self-start"
            >
              <Sparkles className="w-4 h-4" />
              Enhance prompt
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Output section */}
          {result && (
            <div className="rounded-xl border border-accent/20 bg-accent/[0.04] p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Enhanced Prompt</p>
                    <p className="text-xs text-slate-500">{result.improvement_summary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleUseEnhanced}>
                    Use this
                  </Button>
                </div>
              </div>

              <PromptEditor
                value={result.enhanced_prompt}
                onChange={() => {}}
                readOnly
                minHeight={180}
              />

              {/* Changes */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">What changed</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.changes.map((change, i) => (
                    <Badge key={i} variant="accent" size="sm">✓ {change}</Badge>
                  ))}
                </div>
              </div>

              {/* Save to vault */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const params = new URLSearchParams({ text: result.enhanced_prompt })
                    window.location.href = `/builder?${params}`
                  }}
                >
                  <Save className="w-3.5 h-3.5" />
                  Save to Vault
                </Button>
                <p className="text-xs text-slate-600">Open in Builder to add metadata and save</p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {enhancing && (
            <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-8 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-accent/30 border-t-accent-400 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-300">Enhancing your prompt…</p>
                <p className="text-xs text-slate-600 mt-1">Applying AI optimizations</p>
              </div>
            </div>
          )}

          {/* Intro when empty */}
          {!original && !result && !enhancing && (
            <div className="rounded-xl border border-dashed border-white/[0.08] p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-2xl mx-auto mb-4">
                ✨
              </div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">How the Enhancer works</h3>
              <div className="grid grid-cols-3 gap-4 mt-5 text-left">
                {[
                  { step: '1', title: 'Paste your prompt', desc: 'Any quality level — rough or refined' },
                  { step: '2', title: 'Add an instruction', desc: 'Optional: "make it more specific"' },
                  { step: '3', title: 'Get the enhanced version', desc: 'With a diff of every improvement' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
                    <div className="w-6 h-6 rounded-full bg-accent/10 text-accent-400 text-xs font-bold flex items-center justify-center mb-2">{step}</div>
                    <p className="text-sm font-medium text-slate-300 mb-1">{title}</p>
                    <p className="text-xs text-slate-600">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Score panel */}
        <div className="w-72 xl:w-80 border-l border-white/[0.07] bg-white/[0.01] overflow-y-auto p-5 shrink-0">
          <PromptScorePanel result={scoreResult} loading={scoring} />
        </div>
      </div>
    </div>
  )
}
