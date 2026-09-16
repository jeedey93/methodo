'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Sparkles, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ResourceCard, { ResourceCardData } from '@/components/features/resources/ResourceCard'
import { GRADE_LABELS } from '@/lib/constants'

const GRADES_ORDER = ['1', '2', '3', '4', '5', '6']

function groupByGrade(resources: ResourceCardData[]): [string, ResourceCardData[]][] {
  const map = new Map<string, ResourceCardData[]>()

  for (const r of resources) {
    const grades = r.grades.length > 0 ? r.grades : ['autre']
    for (const g of grades) {
      if (!map.has(g)) map.set(g, [])
      if (!map.get(g)!.find(x => x.id === r.id)) {
        map.get(g)!.push(r)
      }
    }
  }

  const sorted = GRADES_ORDER
    .filter(g => map.has(g))
    .map(g => [g, map.get(g)!] as [string, ResourceCardData[]])

  if (map.has('autre')) sorted.push(['autre', map.get('autre')!])
  return sorted
}

export default function CommunautePage() {
  const [tab, setTab] = useState<'collegues' | 'ia'>('collegues')
  const [resources, setResources] = useState<ResourceCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/shared-resources')
      .then(r => r.json())
      .then(data => { setResources(data); setLoading(false) })
  }, [])

  const collegues = resources.filter(r => !r.isAiGenerated)
  const ia = resources.filter(r => r.isAiGenerated)
  const current = tab === 'collegues' ? collegues : ia
  const groups = groupByGrade(current)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Ressources partagées</h1>
          <p className="mt-1 text-stone-500">
            {loading ? 'Chargement...' : `${resources.length} ressource${resources.length > 1 ? 's' : ''} disponible${resources.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/communaute/nouveau">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Partager
          </Button>
        </Link>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 rounded-xl bg-stone-100 p-1 w-fit">
        <button
          onClick={() => setTab('collegues')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'collegues' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          Collègues
          {!loading && collegues.length > 0 && (
            <span className="rounded-full bg-stone-200 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
              {collegues.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('ia')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'ia' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Générées par IA
          {!loading && ia.length > 0 && (
            <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-600">
              {ia.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl border border-stone-200 bg-stone-50 animate-pulse" />
          ))}
        </div>
      ) : current.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-16 text-center">
          {tab === 'collegues' ? (
            <>
              <div className="mx-auto mb-3 text-4xl">👥</div>
              <p className="text-sm font-medium text-stone-600">Aucune ressource partagée par des collègues.</p>
              <p className="mt-1 text-sm text-stone-400">Soyez le premier à partager votre matériel!</p>
              <Link href="/communaute/nouveau">
                <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700 gap-1.5">
                  <Plus className="h-4 w-4" />Partager une ressource
                </Button>
              </Link>
            </>
          ) : (
            <>
              <div className="mx-auto mb-3 text-4xl">✨</div>
              <p className="text-sm font-medium text-stone-600">Aucune ressource IA disponible.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(([grade, items]) => (
            <section key={grade}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-stone-700">
                  {grade === 'autre' ? 'Toutes années' : GRADE_LABELS[grade] ?? grade}
                </h2>
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-xs text-stone-400">{items.length} ressource{items.length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(r => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
