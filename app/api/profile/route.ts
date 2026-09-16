import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } })
  return NextResponse.json({ profile })
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { firstName, lastName, school, grades, subjects } = body

  if (!firstName || !lastName || !grades?.length || !subjects?.length) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { id: user.id },
      create: { id: user.id, email: user.email! },
      update: {},
    })

    await tx.teacherProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, firstName, lastName, school: school ?? null, grades, subjects },
      update: { firstName, lastName, school: school ?? null, grades, subjects },
    })
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
