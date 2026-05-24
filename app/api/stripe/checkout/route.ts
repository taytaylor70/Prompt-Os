import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { tier, yearly } = await req.json() as { tier: 'pro' | 'team'; yearly: boolean }

  if (!['pro', 'team'].includes(tier)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const priceKey = `${tier}_${yearly ? 'yearly' : 'monthly'}` as keyof typeof STRIPE_PRICE_IDS
  const priceId = STRIPE_PRICE_IDS[priceKey]
  if (!priceId) {
    return NextResponse.json({ error: `Price not configured for ${priceKey}` }, { status: 500 })
  }

  // Reuse stripe customer if we have one
  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? profile?.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer:    customerId,
    mode:        'subscription',
    line_items:  [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/settings?billing=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${origin}/pricing?billing=cancelled`,
    allow_promotion_codes: true,
    subscription_data: { metadata: { supabase_user_id: user.id, tier } },
  })

  return NextResponse.json({ url: session.url })
}
