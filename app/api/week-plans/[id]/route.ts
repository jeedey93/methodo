import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const plan = await prisma.weekPlan.findUnique({ where: { id } })
  if (!plan || plan.userId !== user.id) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  return NextResponse.json(plan)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const plan = await prisma.weekPlan.findUnique({ where: { id } })
  if (!plan || plan.userId !== user.id) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  const body = await req.json()
  const updated = await prisma.weekPlan.update({
    where: { id },
    data: {
      ...(body.slots !== undefined ? { slots: body.slots } : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const plan = await prisma.weekPlan.findUnique({ where: { id } })
  if (!plan || plan.userId !== user.id) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  await prisma.weekPlan.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
