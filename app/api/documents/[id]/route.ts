import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const document = await prisma.document.findFirst({
    where: { id, userId: user.id },
    include: { tags: { include: { tag: true } } },
  })

  if (!document) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })
  return NextResponse.json({ document })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { title, content, isFavorite } = body

  const existing = await prisma.document.findFirst({ where: { id, userId: user.id } })
  if (!existing) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })

  const document = await prisma.document.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(isFavorite !== undefined ? { isFavorite } : {}),
    },
  })

  return NextResponse.json({ document })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const existing = await prisma.document.findFirst({ where: { id, userId: user.id } })
  if (!existing) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })

  await prisma.document.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
