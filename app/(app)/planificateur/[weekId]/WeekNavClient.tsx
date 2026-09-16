'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addDays, format, startOfWeek } from 'date-fns'

interface Props {
  planId: string
  weekStart: string
}

async function findOrCreateWeek(weekStart: Date): Promise<string> {
  const res = await fetch('/api/week-plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekStart: weekStart.toISOString() }),
  })
  const plan = await res.json()
  return plan.id
}

export default function WeekNavClient({ planId, weekStart }: Props) {
  const router = useRouter()

  const navigateWeek = async (direction: -1 | 1) => {
    const current = new Date(weekStart)
    const targetDate = addDays(current, direction * 7)
    const monday = startOfWeek(targetDate, { weekStartsOn: 1 })
    monday.setUTCHours(0, 0, 0, 0)
    const id = await findOrCreateWeek(monday)
    router.push(`/planificateur/${id}`)
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer définitivement cette planification?')) return
    await fetch(`/api/week-plans/${planId}`, { method: 'DELETE' })
    toast.success('Planification supprimée')
    router.push('/planificateur')
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        className="text-red-500 hover:bg-red-50 hover:border-red-200"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
