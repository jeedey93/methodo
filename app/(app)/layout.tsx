import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/connexion')

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { firstName: true },
  })

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f6f3]">
      <Sidebar firstName={profile?.firstName} />
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-8 md:px-10 md:py-10 max-w-5xl">
          {children}
        </div>
      </main>
    </div>
  )
}
