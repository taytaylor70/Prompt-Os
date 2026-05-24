import Link from 'next/link'
import { ArrowRight, Zap, Shield, BarChart3, Layers, Star, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WaitlistForm } from '@/components/waitlist-form'

const FEATURES = [
  {
    icon:  '⚡',
    title: 'Prompt Builder',
    desc:  'Craft precision prompts with structured metadata, model targeting, and tone controls.',
  },
  {
    icon:  '✨',
    title: 'AI Enhancer',
    desc:  'Transform rough ideas into production-ready prompts with one click.',
  },
  {
    icon:  '📊',
    title: 'Score Engine',
    desc:  'Get a real-time quality score across 8 dimensions with actionable recommendations.',
  },
  {
    icon:  '🗄️',
    title: 'Prompt Vault',
    desc:  'Organize, search, and version every prompt you\'ve ever written.',
  },
  {
    icon:  '🔄',
    title: 'Version History',
    desc:  'Every edit saved automatically. Roll back to any previous version instantly.',
  },
  {
    icon:  '🏷️',
    title: 'Tags & Categories',
    desc:  'Powerful filtering and taxonomy to find any prompt in seconds.',
  },
]

const SCORE_DIMS = [
  'Clarity', 'Specificity', 'Context', 'Output Control',
  'Reusability', 'Model Fit', 'Safety', 'Commercial Value',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07070f] text-slate-200 overflow-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-6 md:px-12 border-b border-white/[0.05] bg-[#07070f]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-accent-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-100 tracking-tight">Prompt OS</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-slate-500">
          <Link href="#features" className="hover:text-slate-200 transition-colors">Features</Link>
          <Link href="#score"    className="hover:text-slate-200 transition-colors">Score Engine</Link>
          <Link href="/pricing"  className="hover:text-slate-200 transition-colors">Pricing</Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <a href="#waitlist">
            <Button size="sm">Join waitlist</Button>
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-6 text-center">
        {/* Glow orb */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 h-8 px-3 rounded-full border border-accent/25 bg-accent/5 text-accent-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
            Launching soon · Reserve your spot
            <ChevronRight className="w-3 h-3" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            <span className="text-slate-100">The AI prompt</span>
            <br />
            <span className="gradient-text">operating system</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Create, enhance, score, and organize your AI prompts in one premium workspace.
            Built for engineers, creators, and AI-native teams who demand precision.
          </p>

          <WaitlistForm source="hero" className="mb-4" />

          <div className="flex items-center justify-center gap-3 mt-4">
            <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              View demo →
            </Link>
            <span className="text-slate-700">·</span>
            <Link href="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Early access? Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Score callout */}
      <section id="score" className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-accent-400" />
                  <span className="text-xs font-semibold text-accent-400 uppercase tracking-wider">Score Engine</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-100 mb-3">
                  Know exactly how good your prompt is
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  Our 8-dimension scoring system evaluates every prompt and gives you a
                  0–100 grade with specific recommendations to improve.
                </p>
                <Link href="/signup">
                  <Button variant="outline" size="sm">Try it now</Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 md:w-64 shrink-0">
                {SCORE_DIMS.map((dim, i) => (
                  <div key={dim} className="flex items-center gap-2 h-8 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: `hsl(${260 - i * 15}, 70%, 65%)` }}
                    />
                    <span className="text-xs text-slate-400 truncate">{dim}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-4">
              Everything you need to master AI prompts
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A complete toolkit for building, refining, and scaling your prompt library.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 hover:border-white/[0.13] hover:bg-white/[0.04] transition-all duration-200 group">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-xl mb-4 group-hover:border-accent/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-200 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="waitlist" className="px-6 pb-24 scroll-mt-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="rounded-2xl border border-accent/20 bg-accent/[0.05] p-12 relative overflow-hidden glow-accent">
            <div className="absolute inset-0 bg-accent-glow pointer-events-none" />
            <Shield className="w-10 h-10 text-accent-400 mx-auto mb-4 relative" />
            <h2 className="text-3xl font-bold text-slate-100 mb-3 relative">
              Be first to build smarter
            </h2>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto relative">
              Get an invite the moment we open the doors. No spam, no waiting room games.
            </p>
            <div className="relative">
              <WaitlistForm source="cta-bottom" variant="cta" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.07] px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-accent-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-slate-500">Prompt OS</span>
          </div>
          <p className="text-xs text-slate-700">© {new Date().getFullYear()} Prompt OS. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-slate-600">
            <Link href="/pricing" className="hover:text-slate-400 transition-colors">Pricing</Link>
            <Link href="/login"   className="hover:text-slate-400 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
