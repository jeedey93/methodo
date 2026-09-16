import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const existing = await prisma.resourceFavorite.findUnique({
    where: { userId_resourceId: { userId: user.id, resourceId: id } },
  })

  if (existing) {
    await prisma.resourceFavorite.delete({
      where: { userId_resourceId: { userId: user.id, resourceId: id } },
    })
    return NextResponse.json({ favorited: false })
  } else {
    await prisma.resourceFavorite.create({
      data: { userId: user.id, resourceId: id },
    })
    return NextResponse.json({ favorited: true })
  }
}
