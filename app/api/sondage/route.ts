import { NextRequest, NextResponse } from 'next/server'
import { createPoll } from '@/lib/polls'

export async function POST(req: NextRequest) {
  const { question, options } = await req.json()
  if (!question || !Array.isArray(options) || options.length < 2) {
    return NextResponse.json({ error: 'Question et options requises' }, { status: 400 })
  }
  const poll = createPoll(question, options)
  return NextResponse.json(poll, { status: 201 })
}
