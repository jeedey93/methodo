import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { searchParams } = req.nextUrl
  const type = searchParams.get('type')
  const grade = searchParams.get('grade')
  const subject = searchParams.get('subject')
  const q = searchParams.get('q')
  const mine = searchParams.get('mine') === 'true'
  const favorites = searchParams.get('favorites') === 'true'

  const where: Record<string, unknown> = { isPublished: true }

  if (type) where.type = type
  if (grade) where.grades = { has: grade }
  if (subject) where.subjects = { has: subject }
  if (mine && user) where.authorId = user.id
  if (favorites && user) {
    where.favorites = { some: { userId: user.id } }
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  const resources = await prisma.sharedResource.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      author: {
        include: { profile: { select: { firstName: true, lastName: true } } },
      },
      favorites: user ? { where: { userId: user.id } } : false,
      _count: { select: { favorites: true } },
    },
  })

  const result = resources.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    type: r.type,
    grades: r.grades,
    subjects: r.subjects,
    tags: r.tags,
    fileUrl: r.fileUrl,
    fileType: r.fileType,
    textContent: r.textContent,
    downloads: r.downloads,
    createdAt: r.createdAt,
    authorName: r.author.profile
      ? `${r.author.profile.firstName} ${r.author.profile.lastName}`
      : r.author.email,
    favoritesCount: r._count.favorites,
    isFavorited: user ? r.favorites.length > 0 : false,
    isOwn: user ? r.authorId === user.id : false,
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { title, description, type, grades, subjects, tags, fileUrl, fileName, fileType, fileSize, textContent } = body

  if (!title || !type) {
    return NextResponse.json({ error: 'Titre et type requis' }, { status: 400 })
  }

  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email! },
    update: {},
  })

  const resource = await prisma.sharedResource.create({
    data: {
      authorId: user.id,
      title,
      description: description ?? '',
      type,
      grades: grades ?? [],
      subjects: subjects ?? [],
      tags: tags ?? [],
      fileUrl: fileUrl ?? null,
      fileName: fileName ?? null,
      fileType: fileType ?? null,
      fileSize: fileSize ?? null,
      textContent: textContent ?? null,
    },
  })

  return NextResponse.json(resource, { status: 201 })
}
