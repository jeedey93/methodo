import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const portal = await prisma.parentPortal.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          profile: { select: { firstName: true, lastName: true } },
        },
      },
    },
  })

  if (!portal || !portal.isActive) {
    return NextResponse.json({ error: 'Portail introuvable ou inactif' }, { status: 404 })
  }

  // Semaine courante (lundi)
  const now = new Date()
  const day = now.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() + diff)
  monday.setUTCHours(0, 0, 0, 0)

  const weekPlan = await prisma.weekPlan.findFirst({
    where: {
      userId: portal.userId,
      weekStart: { gte: monday, lt: new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000) },
    },
    select: { title: true, slots: true, weekStart: true },
  })

  const teacherName = portal.user.profile
    ? `${portal.user.profile.firstName} ${portal.user.profile.lastName}`
    : portal.user.email

  return NextResponse.json({
    className: portal.className,
    teacherName,
    messages: portal.messages,
    weekPlan: weekPlan ?? null,
  })
}
