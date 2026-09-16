import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: {
        select: { firstName: true, lastName: true, school: true, grades: true, subjects: true, avatarUrl: true },
      },
    },
  })

  if (!user || !user.profile) {
    return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
  }

  const resourceCount = await prisma.sharedResource.count({
    where: { authorId: id, isPublished: true, isAiGenerated: false },
  })

  return NextResponse.json({
    id: user.id,
    firstName: user.profile.firstName,
    lastName: user.profile.lastName,
    school: user.profile.school,
    grades: user.profile.grades,
    subjects: user.profile.subjects,
    avatarUrl: user.profile.avatarUrl,
    resourceCount,
  })
}
