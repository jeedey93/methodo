'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Save, Download, RotateCcw, BookOpen, Pencil } from 'lucide-react'
import Link from 'next/link'
import type { LessonPlanContent, WorksheetContent, AssessmentContent, ParentMessageContent } from '@/types/ai'

type DocumentContent = LessonPlanContent | WorksheetContent | AssessmentContent | ParentMessageContent

interface DocumentResultProps {
  documentId: string
  type: string
  title: string
  content: DocumentContent
  onReset: () => void
}

const TYPE_LABELS: Record<string, string> = {
  LESSON_PLAN: 'Planification',
  WORKSHEET: 'Matériel',
  ASSESSMENT: 'Évaluation',
  PARENT_MESSAGE: 'Communication',
}

const TYPE_COLORS: Record<string, string> = {
  LESSON_PLAN: 'bg-purple-100 text-purple-700',
  WORKSHEET: 'bg-blue-100 text-blue-700',
  ASSESSMENT: 'bg-orange-100 text-orange-700',
  PARENT_MESSAGE: 'bg-green-100 text-green-700',
}

function LessonPlanView({ content }: { content: LessonPlanContent }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-400">Objectifs</h3>
        <ul className="space-y-1.5">
          {content.objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-2 text-stone-700">
              <span className="mt-0.5 text-blue-500">•</span>
              {obj}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-400">Mise en situation</h3>
        <p className="text-stone-700 leading-relaxed">{content.introduction}</p>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-400">Déroulement</h3>
        <div className="space-y-4">
          {content.phases.map((phase, i) => (
            <div key={i} className="rounded-xl bg-stone-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold text-stone-900">{phase.name}</h4>
                <span className="text-xs text-stone-400">{phase.duration} min</span>
              </div>
              <p className="mb-2 text-sm text-stone-600">{phase.description}</p>
              {phase.activities.length > 0 && (
                <ul className="space-y-1">
                  {phase.activities.map((act, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-stone-600">
                      <span className="mt-0.5 text-stone-400">→</span>
                      {act}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {content.differentiation && content.differentiation.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-400">Différenciation</h3>
          <div className="space-y-3">
            {content.differentiation.map((diff, i) => (
              <div key={i} className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                <div className="mb-1 text-xs font-semibold text-amber-700">{diff.group}</div>
                <p className="text-sm text-amber-800">{diff.strategy}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-stone-400">Matériel nécessaire</h3>
        <div className="flex flex-wrap gap-2">
          {content.materials.map((m, i) => (
            <span key={i} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">{m}</span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-stone-400">Retour sur les apprentissages</h3>
        <p className="text-stone-700">{content.conclusion}</p>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-stone-400">Vérification des apprentissages</h3>
        <p className="text-stone-700">{content.assessmentCheck}</p>
      </div>
    </div>
  )
}

function WorksheetView({ content }: { content: WorksheetContent }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-blue-50 p-4">
        <p className="text-blue-800 font-medium">Instructions</p>
        <p className="mt-1 text-blue-700">{content.instructions}</p>
      </div>
      <div className="space-y-4">
        {content.questions.map(q => (
          <div key={q.number} className="space-y-2">
            <p className="font-medium text-stone-900">{q.number}. {q.question} {q.points && <span className="ml-2 text-xs text-stone-400">({q.points} pts)</span>}</p>
            {q.options && (
              <ul className="ml-4 space-y-1">
                {q.options.map((opt, i) => (
                  <li key={i} className="text-sm text-stone-700">{opt}</li>
                ))}
              </ul>
            )}
            {(q.space ?? 0) > 0 && (
              <div className="mt-2 space-y-2">
                {Array.from({ length: q.space ?? 0 }).map((_, i) => (
                  <div key={i} className="h-8 border-b border-dashed border-stone-300" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function AssessmentView({ content }: { content: AssessmentContent }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-orange-50 p-4 flex items-center justify-between">
        <p className="text-orange-800 font-medium">{content.instructions}</p>
        <span className="text-sm text-orange-600">{content.totalPoints} pts · {content.duration} min</span>
      </div>
      {content.sections.map((section, i) => (
        <div key={i} className="space-y-4">
          <h3 className="font-semibold text-stone-900 border-b border-stone-200 pb-2">{section.title}</h3>
          {section.instructions && <p className="text-sm italic text-stone-500">{section.instructions}</p>}
          {section.questions.map(q => (
            <div key={q.number} className="space-y-2">
              <p className="font-medium text-stone-900">{q.number}. {q.question} <span className="text-xs text-stone-400">({q.points} pts)</span></p>
              {q.options && (
                <ul className="ml-4 space-y-1">
                  {q.options.map((opt, j) => <li key={j} className="text-sm text-stone-700">{opt}</li>)}
                </ul>
              )}
              {(q.space ?? 0) > 0 && (
                <div className="mt-2 space-y-2">
                  {Array.from({ length: q.space ?? 0 }).map((_, j) => (
                    <div key={j} className="h-8 border-b border-dashed border-stone-300" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      {content.successCriteria.length > 0 && (
        <div className="rounded-xl bg-green-50 p-4">
          <p className="mb-2 font-medium text-green-800">Critères de réussite</p>
          <ul className="space-y-1">
            {content.successCriteria.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                <span>✓</span>{c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ParentMessageView({ content }: { content: ParentMessageContent }) {
  const [copied, setCopied] = useState(false)
  const fullMessage = `${content.body}\n\n${content.closing}`

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(fullMessage)
    setCopied(true)
    toast.success('Message copié dans le presse-papiers!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-1">Objet</p>
        <p className="font-medium text-stone-900">{content.subject}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-1">Message</p>
        <div className="rounded-xl bg-stone-50 p-5 text-stone-700 leading-relaxed whitespace-pre-wrap">
          {content.body}
        </div>
      </div>
      <p className="text-stone-600 italic">{content.closing}</p>
      <Button onClick={copyToClipboard} variant="outline" className="gap-2">
        {copied ? '✓ Copié!' : 'Copier le message'}
      </Button>
    </div>
  )
}

export default function DocumentResult({ documentId, type, title, content, onReset }: DocumentResultProps) {
  const handleExportPDF = async () => {
    toast.info('Export PDF en préparation...')
    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      })
      if (!res.ok) throw new Error('Erreur export')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Erreur lors de l\'export PDF. Réessayez dans quelques secondes.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Badge className={`mb-2 text-xs ${TYPE_COLORS[type]}`}>{TYPE_LABELS[type]}</Badge>
          <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Nouveau
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            PDF
          </Button>
          <Link href={`/bibliotheque/${documentId}`}>
            <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700">
              <BookOpen className="h-3.5 w-3.5" />
              Ouvrir dans la bibliothèque
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
        {type === 'LESSON_PLAN' && <LessonPlanView content={content as LessonPlanContent} />}
        {type === 'WORKSHEET' && <WorksheetView content={content as WorksheetContent} />}
        {type === 'ASSESSMENT' && <AssessmentView content={content as AssessmentContent} />}
        {type === 'PARENT_MESSAGE' && <ParentMessageView content={content as ParentMessageContent} />}
      </div>
    </div>
  )
}
