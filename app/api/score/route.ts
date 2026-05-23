import { NextRequest, NextResponse } from 'next/server'
import { ai } from '@/lib/ai'
import type { TargetModel } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { prompt, model } = await req.json() as { prompt: string; model?: TargetModel }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const result = await ai.scorePrompt(prompt.trim(), model)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/score]', err)
    return NextResponse.json({ error: 'Scoring failed' }, { status: 500 })
  }
}
