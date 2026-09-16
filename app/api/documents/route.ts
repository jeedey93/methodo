import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const q = searchParams.get('q')
  const favorites = searchParams.get('favorites') === 'true'

  const where = {
    userId: user.id,
    ...(type ? { type: type as any } : {}),
    ...(favorites ? { isFavorite: true } : {}),
    ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
  }

  const documents = await prisma.document.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: { tags: { include: { tag: true } } },
  })

  return NextResponse.json({ documents })
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { type, title, content, metadata } = body

  if (!type || !title || !content) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email! },
    update: {},
  })

  const document = await prisma.document.create({
    data: { userId: user.id, type, title, content, metadata: metadata ?? {} },
  })

  return NextResponse.json({ document }, { status: 201 })
}
