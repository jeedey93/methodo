import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const plans = await prisma.weekPlan.findMany({
    where: { userId: user.id },
    orderBy: { weekStart: 'desc' },
    select: { id: true, title: true, weekStart: true, createdAt: true, updatedAt: true },
  })

  return NextResponse.json(plans)
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { weekStart, title } = body

  if (!weekStart) return NextResponse.json({ error: 'weekStart requis' }, { status: 400 })

  const startDate = new Date(weekStart)
  startDate.setUTCHours(0, 0, 0, 0)

  const plan = await prisma.weekPlan.upsert({
    where: { userId_weekStart: { userId: user.id, weekStart: startDate } },
    create: { userId: user.id, weekStart: startDate, title: title ?? 'Ma semaine', slots: [] },
    update: title ? { title } : {},
  })

  return NextResponse.json(plan, { status: 201 })
}
