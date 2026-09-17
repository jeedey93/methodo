import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email! },
    update: {},
  })

  const wb = await prisma.whiteboard.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  })

  return NextResponse.json(wb)
}

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { widgets, background } = body

  const wb = await prisma.whiteboard.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...(widgets !== undefined ? { widgets } : {}),
      ...(background !== undefined ? { background } : {}),
    },
    update: {
      ...(widgets !== undefined ? { widgets } : {}),
      ...(background !== undefined ? { background } : {}),
    },
  })

  return NextResponse.json(wb)
}
