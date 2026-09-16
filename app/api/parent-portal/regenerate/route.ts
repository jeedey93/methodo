import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function POST() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const portal = await prisma.parentPortal.update({
    where: { userId: user.id },
    data: { token: crypto.randomUUID() },
  })

  return NextResponse.json(portal)
}
