'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Save, User, Bell, Cpu, Shield, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TopNav } from '@/components/top-nav'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { TargetModel, OutputType, Tone } from '@/types'
import { usePlan } from '@/hooks/use-plan'

const PLAN_META: Record<'free'|'pro'|'team', { label: string; tagline: string; badgeVariant: 'default'|'accent'|'success' }> = {
  free: { label: 'Free',     tagline: '25 prompt limit',        badgeVariant: 'default' },
  pro:  { label: 'Pro',      tagline: 'Unlimited prompts',      badgeVariant: 'accent'  },
  team: { label: 'Team',     tagline: 'Up to 10 team members',  badgeVariant: 'success' },
}

const MODEL_OPTIONS:  { value: TargetModel;  label: string }[] = [
  { value: 'gpt-4o',            label: 'GPT-4o' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'gemini-1.5-pro',    label: 'Gemini 1.5 Pro' },
  { value: 'any',               label: 'Any Model' },
]
const TONE_OPTIONS:   { value: Tone;          label: string }[] = ['professional','casual','technical','creative','formal','friendly','authoritative','concise'].map(v => ({ value: v as Tone, label: v.charAt(0).toUpperCase() + v.slice(1) }))
const OUTPUT_OPTIONS: { value: OutputType;    label: string }[] = ['text','json','code','markdown','list'].map(v => ({ value: v as OutputType, label: v.toUpperCase() }))

const SECTIONS = [
  { id: 'profile',     label: 'Profile',       icon: User },
  { id: 'defaults',    label: 'Defaults',       icon: Cpu },
  { id: 'billing',     label: 'Billing',        icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security',   label: 'Security',       icon: Shield },
] as const

type Section = typeof SECTIONS[number]['id']

export default function SettingsPage() {
  const [section, setSection] = useState<Section>('profile')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail]             = useState('')
  const [defaultModel, setDefaultModel] = useState<TargetModel>('gpt-4o')
  const [defaultTone,  setDefaultTone]  = useState<Tone>('professional')
  const [defaultOutput, setDefaultOutput] = useState<OutputType>('text')
  const [emailNotifs,  setEmailNotifs]  = useState(true)
  const [saving, setSaving]           = useState(false)
  const [saved,  setSaved]            = useState(false)

  const router   = useRouter()
  const supabase = createClient()
  const planInfo = usePlan()
  const planMeta = PLAN_META[planInfo.plan]
  const [portalLoading, setPortalLoading] = useState(false)

  async function openBillingPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error ?? 'Could not open portal')
      window.location.href = data.url
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not open portal')
      setPortalLoading(false)
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setEmail(data.user.email ?? '')
      setDisplayName(data.user.user_metadata?.full_name ?? '')
    })
  }, [supabase, router])

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600)) // simulate save
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex flex-col flex-1">
      <TopNav
        title="Settings"
        subtitle="Manage your account and preferences"
        action={
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </Button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Settings nav */}
        <aside className="w-52 shrink-0 border-r border-white/[0.07] p-4 flex flex-col gap-0.5">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={cn(
                'flex items-center gap-2.5 h-9 px-3 rounded-lg text-sm transition-all text-left w-full',
                section === id
                  ? 'bg-accent/10 text-accent-400 border border-accent/15 font-medium'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </aside>

        {/* Settings content */}
        <div className="flex-1 overflow-y-auto p-8 max-w-2xl">
          {saved && (
            <div className="mb-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
              ✓ Settings saved successfully
            </div>
          )}

          {section === 'profile' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-base font-semibold text-slate-100 mb-1">Profile</h2>
                <p className="text-sm text-slate-500">Manage your personal information</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center text-xl font-bold text-white">
                  {displayName.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">{displayName || 'User'}</p>
                  <p className="text-xs text-slate-500">{email}</p>
                  <Badge variant={planMeta.badgeVariant} size="sm" className="mt-1">{planMeta.label} Plan</Badge>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Input
                  label="Display Name"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  id="displayName"
                />
                <Input
                  label="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  id="email"
                />
              </div>

              <Button onClick={handleSave} loading={saving} className="self-start">
                <Save className="w-3.5 h-3.5" />
                Save changes
              </Button>
            </div>
          )}

          {section === 'defaults' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-base font-semibold text-slate-100 mb-1">Default Preferences</h2>
                <p className="text-sm text-slate-500">Pre-fill new prompts with your preferred settings</p>
              </div>

              <div className="flex flex-col gap-4">
                <Select
                  label="Default AI Model"
                  options={MODEL_OPTIONS}
                  value={defaultModel}
                  onChange={e => setDefaultModel(e.target.value as TargetModel)}
                />
                <Select
                  label="Default Tone"
                  options={TONE_OPTIONS}
                  value={defaultTone}
                  onChange={e => setDefaultTone(e.target.value as Tone)}
                />
                <Select
                  label="Default Output Type"
                  options={OUTPUT_OPTIONS}
                  value={defaultOutput}
                  onChange={e => setDefaultOutput(e.target.value as OutputType)}
                />
              </div>

              <Button onClick={handleSave} loading={saving} className="self-start">
                <Save className="w-3.5 h-3.5" />
                Save defaults
              </Button>
            </div>
          )}

          {section === 'billing' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-base font-semibold text-slate-100 mb-1">Billing</h2>
                <p className="text-sm text-slate-500">Manage your subscription and payment method</p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Current Plan</p>
                    <p className="text-xs text-slate-500 mt-0.5">{planMeta.label} · {planMeta.tagline}</p>
                    {planInfo.plan !== 'free' && planInfo.plan_renews_at && (
                      <p className="text-xs text-slate-500 mt-1">
                        {planInfo.plan_cancel_at_period_end
                          ? <>Cancels on <span className="text-amber-400">{formatDate(planInfo.plan_renews_at)}</span></>
                          : <>Renews on <span className="text-slate-300">{formatDate(planInfo.plan_renews_at)}</span></>
                        }
                      </p>
                    )}
                  </div>
                  <Badge variant={planMeta.badgeVariant}>{planMeta.label}</Badge>
                </div>
                {planInfo.plan === 'free' ? (
                  <Link href="/pricing">
                    <Button variant="outline" size="sm">Upgrade to Pro</Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" loading={portalLoading} onClick={openBillingPortal}>
                    Manage subscription
                  </Button>
                )}
              </div>

              {planInfo.plan === 'free' && (
                <div className="rounded-xl border border-dashed border-white/[0.07] p-5 text-center">
                  <p className="text-sm text-slate-500">No payment method on file</p>
                  <Link href="/pricing">
                    <Button variant="ghost" size="sm" className="mt-2">Add payment method</Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {section === 'notifications' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-base font-semibold text-slate-100 mb-1">Notifications</h2>
                <p className="text-sm text-slate-500">Control when and how you hear from us</p>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { label: 'Email digests',     desc: 'Weekly summary of your prompt activity' },
                  { label: 'Product updates',    desc: 'New features and improvements' },
                  { label: 'Score milestones',   desc: 'When a prompt reaches a high score' },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                    <div>
                      <p className="text-sm font-medium text-slate-300">{label}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setEmailNotifs(n => !n)}
                      className={cn(
                        'relative w-10 h-5 rounded-full transition-colors',
                        emailNotifs ? 'bg-accent-600' : 'bg-white/[0.10]'
                      )}
                    >
                      <span className={cn(
                        'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                        emailNotifs && 'translate-x-5'
                      )} />
                    </button>
                  </div>
                ))}
              </div>

              <Button onClick={handleSave} loading={saving} className="self-start">
                <Save className="w-3.5 h-3.5" />
                Save preferences
              </Button>
            </div>
          )}

          {section === 'security' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-base font-semibold text-slate-100 mb-1">Security</h2>
                <p className="text-sm text-slate-500">Manage your password and account security</p>
              </div>

              <div className="flex flex-col gap-4">
                <Input label="New Password" type="password" placeholder="Min. 8 characters" id="newPass" />
                <Input label="Confirm Password" type="password" placeholder="Repeat password" id="confirmPass" />
              </div>

              <Button variant="outline" className="self-start">Update password</Button>

              <div className="pt-4 border-t border-white/[0.07]">
                <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
                <p className="text-xs text-slate-600 mb-3">Permanently delete your account and all data.</p>
                <Button variant="danger" size="sm">Delete account</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
