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

  let pages = await prisma.whiteboardPage.findMany({
    where: { userId: user.id },
    orderBy: { order: 'asc' },
  })

  if (pages.length === 0) {
    const page = await prisma.whiteboardPage.create({
      data: { userId: user.id, name: 'Page 1', order: 0 },
    })
    pages = [page]
  }

  return NextResponse.json(pages)
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { name } = body

  const last = await prisma.whiteboardPage.findFirst({
    where: { userId: user.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const page = await prisma.whiteboardPage.create({
    data: {
      userId: user.id,
      name: name ?? `Page ${(last?.order ?? 0) + 2}`,
      order: (last?.order ?? -1) + 1,
    },
  })

  return NextResponse.json(page, { status: 201 })
}
