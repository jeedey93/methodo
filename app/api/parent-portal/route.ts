import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

async function generateUniqueSlug(base: string): Promise<string> {
  const slug = toSlug(base) || 'enseignant'
  const existing = await prisma.parentPortal.findUnique({ where: { slug } })
  if (!existing) return slug
  for (let i = 2; i <= 99; i++) {
    const candidate = `${slug}-${i}`
    const exists = await prisma.parentPortal.findUnique({ where: { slug: candidate } })
    if (!exists) return candidate
  }
  return `${slug}-${Date.now()}`
}

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email! },
    update: {},
  })

  let portal = await prisma.parentPortal.findUnique({ where: { userId: user.id } })

  if (!portal) {
    const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } })
    const baseName = profile ? `${profile.firstName}-${profile.lastName}` : user.email!.split('@')[0]
    const slug = await generateUniqueSlug(baseName)
    portal = await prisma.parentPortal.create({ data: { userId: user.id, slug } })
  }

  return NextResponse.json(portal)
}

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { className, messages, isActive, slug, agenda } = body

  if (slug !== undefined) {
    const normalized = toSlug(slug)
    if (!normalized) return NextResponse.json({ error: 'Slug invalide' }, { status: 400 })
    const existing = await prisma.parentPortal.findUnique({ where: { slug: normalized } })
    if (existing && existing.userId !== user.id) {
      return NextResponse.json({ error: 'Ce lien est déjà utilisé' }, { status: 409 })
    }
    const portal = await prisma.parentPortal.update({
      where: { userId: user.id },
      data: { slug: normalized },
    })
    return NextResponse.json(portal)
  }

  const portal = await prisma.parentPortal.update({
    where: { userId: user.id },
    data: {
      ...(className !== undefined ? { className } : {}),
      ...(messages !== undefined ? { messages } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(agenda !== undefined ? { agenda } : {}),
    },
  })

  return NextResponse.json(portal)
}
