import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { redirect, notFound } from 'next/navigation'
import DocumentDetailClient from './DocumentDetailClient'

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const document = await prisma.document.findFirst({
    where: { id, userId: user.id },
    include: { tags: { include: { tag: true } } },
  })

  if (!document) notFound()

  return <DocumentDetailClient document={document} />
}
