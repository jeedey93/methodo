import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const students = await prisma.student.findMany({
    where: { userId: user.id },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json(students)
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { firstName, lastName } = await req.json()
  if (!firstName?.trim()) {
    return NextResponse.json({ error: 'Prénom requis' }, { status: 400 })
  }

  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, email: user.email! },
    update: {},
  })

  const count = await prisma.student.count({ where: { userId: user.id } })
  const student = await prisma.student.create({
    data: {
      userId: user.id,
      firstName: firstName.trim(),
      lastName: (lastName ?? '').trim(),
      order: count,
    },
  })
  return NextResponse.json(student, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await req.json()
  await prisma.student.deleteMany({ where: { id, userId: user.id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { ids } = await req.json()
  if (!Array.isArray(ids)) return NextResponse.json({ error: 'ids requis' }, { status: 400 })

  await Promise.all(
    ids.map((id: string, index: number) =>
      prisma.student.updateMany({ where: { id, userId: user.id }, data: { order: index } })
    )
  )
  return NextResponse.json({ ok: true })
}
