import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { widgets, background, name } = body

  const page = await prisma.whiteboardPage.findFirst({ where: { id, userId: user.id } })
  if (!page) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  const updated = await prisma.whiteboardPage.update({
    where: { id },
    data: {
      ...(widgets !== undefined ? { widgets } : {}),
      ...(background !== undefined ? { background } : {}),
      ...(name !== undefined ? { name } : {}),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params

  const page = await prisma.whiteboardPage.findFirst({ where: { id, userId: user.id } })
  if (!page) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  const count = await prisma.whiteboardPage.count({ where: { userId: user.id } })
  if (count <= 1) return NextResponse.json({ error: 'Impossible de supprimer la dernière page' }, { status: 400 })

  await prisma.whiteboardPage.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
