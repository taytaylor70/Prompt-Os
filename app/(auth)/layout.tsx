import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#07070f] flex flex-col items-center justify-center px-4 relative">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-accent/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-50" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10 relative">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-accent-sm">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-slate-100 text-lg tracking-tight">Prompt OS</span>
      </Link>

      <div className="relative w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
