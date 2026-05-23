'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Prompt, VaultFilters, SortOption } from '@/types'

const DEFAULT_FILTERS: VaultFilters = {
  category:     'all',
  tags:         [],
  target_model: 'all',
  sort:         'newest',
  search:       '',
}

export function usePrompts(initialFilters: Partial<VaultFilters> = {}) {
  const supabase = createClient()
  const [prompts,  setPrompts]  = useState<Prompt[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [filters,  setFilters]  = useState<VaultFilters>({ ...DEFAULT_FILTERS, ...initialFilters })

  const fetchPrompts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('prompts')
        .select('*, tags:prompt_tags(tag:tags(*))')

      if (filters.category !== 'all')
        query = query.eq('category', filters.category)

      if (filters.target_model !== 'all')
        query = query.eq('target_model', filters.target_model)

      if (filters.search)
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,prompt_text.ilike.%${filters.search}%`)

      const sortMap: Record<SortOption, { column: string; ascending: boolean }> = {
        newest:        { column: 'created_at',  ascending: false },
        oldest:        { column: 'created_at',  ascending: true  },
        highest_score: { column: 'score',       ascending: false },
        lowest_score:  { column: 'score',       ascending: true  },
        title_asc:     { column: 'title',       ascending: true  },
      }
      const { column, ascending } = sortMap[filters.sort]
      query = query.order(column, { ascending })

      const { data, error: err } = await query
      if (err) throw err
      setPrompts((data ?? []) as unknown as Prompt[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts')
    } finally {
      setLoading(false)
    }
  }, [supabase, filters])

  useEffect(() => { fetchPrompts() }, [fetchPrompts])

  const updateFilter = useCallback(<K extends keyof VaultFilters>(key: K, value: VaultFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const deletePrompt = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('prompts').delete().eq('id', id)
    if (err) throw err
    setPrompts(prev => prev.filter(p => p.id !== id))
  }, [supabase])

  const toggleFavorite = useCallback(async (id: string, current: boolean) => {
    const { error: err } = await supabase.from('prompts').update({ is_favorite: !current }).eq('id', id)
    if (err) throw err
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, is_favorite: !current } : p))
  }, [supabase])

  return {
    prompts,
    loading,
    error,
    filters,
    updateFilter,
    refetch: fetchPrompts,
    deletePrompt,
    toggleFavorite,
  }
}
