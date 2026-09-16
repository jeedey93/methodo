import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { checkAndConsumeCredit } from '@/lib/credits/checker'
import { getAIProvider } from '@/lib/ai'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const schema = z.object({
  type: z.string().min(1),
  grade: z.string().min(1),
  subject: z.string().min(1),
  topic: z.string().min(1),
  questionCount: z.number().int().min(1).max(30),
  difficulty: z.string().min(1),
  duration: z.number().optional(),
  questionTypes: z.array(z.string()),
})

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })

  const usage = await checkAndConsumeCredit(user.id)
  if (!usage.allowed) {
    return NextResponse.json({ error: 'Vous avez atteint votre limite de générations ce mois-ci.' }, { status: 402 })
  }

  const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } })

  const ai = getAIProvider()
  const result = await ai.generateAssessment({
    ...parsed.data,
    teacherContext: profile ? {
      firstName: profile.firstName,
      grades: profile.grades,
      subjects: profile.subjects,
      language: profile.language,
    } : undefined,
  })

  const document = await prisma.document.create({
    data: {
      userId: user.id,
      type: 'ASSESSMENT',
      title: result.data.title,
      content: result.data as object,
      metadata: { grade: parsed.data.grade, subject: parsed.data.subject, topic: parsed.data.topic },
    },
  })

  return NextResponse.json({ ...result, documentId: document.id })
}
