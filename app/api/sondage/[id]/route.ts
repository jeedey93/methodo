import { NextRequest, NextResponse } from 'next/server'
import { getPoll, vote } from '@/lib/polls'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const poll = getPoll(id)
  if (!poll) return NextResponse.json({ error: 'Sondage introuvable' }, { status: 404 })
  return NextResponse.json(poll)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { optionIndex } = await req.json()
  const poll = vote(id, optionIndex)
  if (!poll) return NextResponse.json({ error: 'Vote invalide' }, { status: 400 })
  return NextResponse.json(poll)
}
