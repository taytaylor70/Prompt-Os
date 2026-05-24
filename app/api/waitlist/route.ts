import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const { email, name, source } = await req.json()
  const trimmed = typeof email === 'string' ? email.trim().toLowerCase() : ''
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 })
  }

  const referrer = req.headers.get('referer') ?? null
  const { error } = await admin()
    .from('waitlist')
    .upsert(
      { email: trimmed, name: name?.toString().slice(0, 100) ?? null, source: source ?? 'landing', referrer },
      { onConflict: 'email' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const { count } = await admin().from('waitlist').select('*', { count: 'exact', head: true })
  return NextResponse.json({ count: count ?? 0 })
}
