'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SignupPage() {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    // Auto-confirm is on: session is returned immediately → go straight to app
    if (data.session) {
      router.push('/dashboard')
      return
    }

    // Email confirmation required
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-8 shadow-glass text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl mx-auto mb-5">
          ✉️
        </div>
        <h2 className="text-lg font-bold text-slate-100 mb-2">Check your email</h2>
        <p className="text-sm text-slate-400 leading-relaxed mb-5">
          We&apos;ve sent a confirmation link to <strong className="text-slate-200">{email}</strong>.
          Click the link to activate your account.
        </p>
        <Link href="/login">
          <Button variant="outline" size="sm" className="w-full">Back to login</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-7 shadow-glass">
      <div className="mb-7 text-center">
        <h1 className="text-xl font-bold text-slate-100">Create your workspace</h1>
        <p className="text-sm text-slate-500 mt-1">Start free — no credit card needed</p>
      </div>

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <Input
          label="Name"
          type="text"
          placeholder="Tony Stark"
          value={name}
          onChange={e => setName(e.target.value)}
          icon={<User className="w-3.5 h-3.5" />}
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          icon={<Mail className="w-3.5 h-3.5" />}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          icon={<Lock className="w-3.5 h-3.5" />}
          required
          autoComplete="new-password"
        />

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full mt-1">
          Create free account
        </Button>
      </form>

      <p className="text-center text-xs text-slate-600 mt-5">
        Already have an account?{' '}
        <Link href="/login" className="text-accent-400 hover:text-accent-300 font-medium">
          Sign in
        </Link>
      </p>

      <p className="text-center text-[11px] text-slate-700 mt-3">
        By signing up you agree to our Terms of Service & Privacy Policy.
      </p>
    </div>
  )
}
