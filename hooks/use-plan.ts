'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Plan = 'free' | 'pro' | 'team'

export interface PlanInfo {
  plan:                       Plan
  plan_renews_at:             string | null
  plan_cancel_at_period_end:  boolean
  stripe_customer_id:         string | null
  loading:                    boolean
}

const DEFAULT: PlanInfo = {
  plan:                      'free',
  plan_renews_at:            null,
  plan_cancel_at_period_end: false,
  stripe_customer_id:        null,
  loading:                   true,
}

export function usePlan(): PlanInfo {
  const [info, setInfo] = useState<PlanInfo>(DEFAULT)

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (!cancelled) setInfo({ ...DEFAULT, loading: false }); return }

      const { data } = await supabase
        .from('users')
        .select('plan, plan_renews_at, plan_cancel_at_period_end, stripe_customer_id')
        .eq('id', user.id)
        .single()

      if (cancelled || !data) return
      setInfo({
        plan:                      (data.plan as Plan) ?? 'free',
        plan_renews_at:            data.plan_renews_at,
        plan_cancel_at_period_end: data.plan_cancel_at_period_end ?? false,
        stripe_customer_id:        data.stripe_customer_id,
        loading:                   false,
      })
    }
    load()
    return () => { cancelled = true }
  }, [])

  return info
}
