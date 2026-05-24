import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

// Use service role so the webhook can update any user row regardless of RLS.
function adminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

function planFromPriceId(priceId: string): 'free' | 'pro' | 'team' {
  if ([process.env.STRIPE_PRO_MONTHLY_PRICE_ID, process.env.STRIPE_PRO_YEARLY_PRICE_ID].includes(priceId)) return 'pro'
  if ([process.env.STRIPE_TEAM_MONTHLY_PRICE_ID, process.env.STRIPE_TEAM_YEARLY_PRICE_ID].includes(priceId)) return 'team'
  return 'free'
}

async function syncSubscription(sub: Stripe.Subscription) {
  const customerId    = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  const supabase      = adminClient()
  const item          = sub.items.data[0]
  const priceId       = item?.price.id ?? ''
  const isActive      = ['active', 'trialing'].includes(sub.status)
  const plan          = isActive ? planFromPriceId(priceId) : 'free'
  // current_period_end moved to subscription item in newer API versions;
  // fall back to the subscription-level field for older payloads.
  const periodEnd     = (item as unknown as { current_period_end?: number })?.current_period_end
    ?? (sub as unknown as { current_period_end?: number }).current_period_end
  const plan_renews_at = periodEnd ? new Date(periodEnd * 1000).toISOString() : null

  const { error } = await supabase
    .from('users')
    .update({
      plan,
      stripe_subscription_id:    sub.id,
      plan_renews_at,
      plan_cancel_at_period_end: sub.cancel_at_period_end ?? false,
    })
    .eq('stripe_customer_id', customerId)

  if (error) console.error('Failed to sync subscription:', error.message)
}

export async function POST(req: NextRequest) {
  const sig    = req.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig || !secret) return NextResponse.json({ error: 'Missing signature/secret' }, { status: 400 })

  const body = await req.text()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'invalid'
    return NextResponse.json({ error: `Webhook signature verification failed: ${msg}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.subscription) {
          const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id
          const sub   = await stripe.subscriptions.retrieve(subId)
          await syncSubscription(sub)
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription(event.data.object as Stripe.Subscription)
        break
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
