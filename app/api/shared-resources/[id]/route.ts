import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const download = req.nextUrl.searchParams.get('download') === 'true'

  const resource = await prisma.sharedResource.findUnique({
    where: { id },
    include: {
      author: { include: { profile: { select: { firstName: true, lastName: true } } } },
      favorites: user ? { where: { userId: user.id } } : false,
      _count: { select: { favorites: true } },
    },
  })

  if (!resource || !resource.isPublished) {
    return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
  }

  if (download) {
    await prisma.sharedResource.update({ where: { id }, data: { downloads: { increment: 1 } } })
  }

  return NextResponse.json({
    ...resource,
    authorName: resource.author.profile
      ? `${resource.author.profile.firstName} ${resource.author.profile.lastName}`
      : resource.author.email,
    favoritesCount: resource._count.favorites,
    isFavorited: user ? resource.favorites.length > 0 : false,
    isOwn: user ? resource.authorId === user.id : false,
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const resource = await prisma.sharedResource.findUnique({ where: { id } })
  if (!resource || resource.authorId !== user.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, type, grades, subjects, tags, textContent, isPublished } = body

  const updated = await prisma.sharedResource.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(grades !== undefined ? { grades } : {}),
      ...(subjects !== undefined ? { subjects } : {}),
      ...(tags !== undefined ? { tags } : {}),
      ...(textContent !== undefined ? { textContent } : {}),
      ...(isPublished !== undefined ? { isPublished } : {}),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const resource = await prisma.sharedResource.findUnique({ where: { id } })
  if (!resource || resource.authorId !== user.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  await prisma.sharedResource.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
