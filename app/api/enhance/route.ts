import { NextRequest, NextResponse } from 'next/server'
import { ai } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { prompt, instruction } = await req.json() as { prompt: string; instruction?: string }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const result = await ai.enhancePrompt(prompt.trim(), instruction?.trim())
    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/enhance]', err)
    return NextResponse.json({ error: 'Enhancement failed' }, { status: 500 })
  }
}
