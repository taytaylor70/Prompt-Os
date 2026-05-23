import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title:       { default: 'Prompt OS', template: '%s · Prompt OS' },
  description: 'The premium AI prompt operating system. Create, enhance, score, and organize your AI prompts.',
  keywords:    ['AI prompts', 'prompt engineering', 'GPT', 'Claude', 'prompt builder'],
  authors:     [{ name: 'Prompt OS' }],
  openGraph: {
    type:        'website',
    title:       'Prompt OS',
    description: 'The premium AI prompt operating system',
    siteName:    'Prompt OS',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[#07070f] antialiased">
        {children}
      </body>
    </html>
  )
}
