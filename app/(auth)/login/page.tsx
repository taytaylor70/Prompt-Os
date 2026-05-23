'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const router  = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleOAuth(provider: 'google' | 'github') {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-7 shadow-glass">
      <div className="mb-7 text-center">
        <h1 className="text-xl font-bold text-slate-100">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-1">Sign in to your Prompt OS workspace</p>
      </div>

      {/* OAuth */}
      <div className="flex flex-col gap-2 mb-5">
        <button
          onClick={() => handleOAuth('google')}
          className="flex items-center justify-center gap-2.5 h-10 rounded-lg border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.07] text-sm text-slate-300 transition-colors"
        >
          <span className="text-base">G</span>
          Continue with Google
        </button>
        <button
          onClick={() => handleOAuth('github')}
          className="flex items-center justify-center gap-2.5 h-10 rounded-lg border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.07] text-sm text-slate-300 transition-colors"
        >
          <span className="text-base">⬡</span>
          Continue with GitHub
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <hr className="flex-1 border-white/[0.07]" />
        <span className="text-xs text-slate-600">or</span>
        <hr className="flex-1 border-white/[0.07]" />
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          icon={<Lock className="w-3.5 h-3.5" />}
          required
          autoComplete="current-password"
        />

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full mt-1">
          Sign in
        </Button>
      </form>

      <p className="text-center text-xs text-slate-600 mt-5">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-accent-400 hover:text-accent-300 font-medium">
          Sign up free
        </Link>
      </p>
    </div>
  )
}
