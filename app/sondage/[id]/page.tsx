'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Poll {
  id: string
  question: string
  options: string[]
  votes: number[]
}

export default function SondagePage() {
  const { id } = useParams<{ id: string }>()
  const [poll, setPoll] = useState<Poll | null>(null)
  const [voted, setVoted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/sondage/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setPoll(data); setLoading(false) })
  }, [id])

  const handleVote = async (index: number) => {
    const res = await fetch(`/api/sondage/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionIndex: index }),
    })
    if (res.ok) { setPoll(await res.json()); setVoted(true) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-stone-400">Chargement...</div>
  if (!poll) return <div className="min-h-screen flex items-center justify-center text-stone-500">Sondage introuvable.</div>

  const total = poll.votes.reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900">{poll.question}</h1>
          {voted && <p className="text-sm text-green-600 mt-2">✓ Votre réponse a été enregistrée</p>}
        </div>
        <div className="space-y-3">
          {poll.options.map((opt, i) => {
            const pct = total > 0 ? Math.round((poll.votes[i] / total) * 100) : 0
            return (
              <button
                key={i}
                onClick={() => !voted && handleVote(i)}
                disabled={voted}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                  voted
                    ? 'border-stone-200 bg-white cursor-default'
                    : 'border-stone-200 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-stone-900 text-lg">{opt}</span>
                  {voted && <span className="text-sm text-stone-500">{pct}%</span>}
                </div>
                {voted && (
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
        {voted && <p className="text-center text-xs text-stone-400">{total} réponse{total > 1 ? 's' : ''} au total</p>}
      </div>
    </div>
  )
}
