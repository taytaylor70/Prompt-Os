'use client'

import { useState, useCallback, useRef } from 'react'
import type { ScoreResult, TargetModel } from '@/types'

export function useScore() {
  const [result,  setResult]  = useState<ScoreResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const score = useCallback(async (promptText: string, targetModel?: TargetModel) => {
    if (!promptText.trim() || promptText.trim().length < 10) return
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/score', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ prompt: promptText, model: targetModel }),
        })
        if (!res.ok) throw new Error('Score request failed')
        const data: ScoreResult = await res.json()
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to score prompt')
      } finally {
        setLoading(false)
      }
    }, 800)
  }, [])

  const clear = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, loading, error, score, clear }
}
