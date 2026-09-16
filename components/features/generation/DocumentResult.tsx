'use client'

interface LessonPhase {
  name: string
  duration: number
  description: string
  activities: string[]
}

interface LessonPlanContent {
  title?: string
  grade?: string
  subject?: string
  objectives?: string[]
  introduction?: string
  phases?: LessonPhase[]
  materials?: string[]
  differentiation?: { group: string; strategy: string }[]
  conclusion?: string
  assessmentCheck?: string
  totalDuration?: number
}

interface WorksheetQuestion {
  number: number
  type: string
  question: string
  options?: string[]
  points?: number
  space?: number
}

interface WorksheetContent {
  title?: string
  grade?: string
  subject?: string
  instructions?: string
  questions?: WorksheetQuestion[]
}

interface AssessmentSection {
  title: string
  instructions?: string
  questions: WorksheetQuestion[]
}

interface AssessmentContent {
  title?: string
  grade?: string
  subject?: string
  duration?: number
  totalPoints?: number
  instructions?: string
  sections?: AssessmentSection[]
  successCriteria?: string[]
}

interface ParentMessageContent {
  subject?: string
  body?: string
  closing?: string
}

interface DocumentResultProps {
  documentId: string
  type: string
  title: string
  content: unknown
  onReset?: () => void
}

function LessonPlanView({ content }: { content: LessonPlanContent }) {
  return (
    <div className="space-y-6 text-sm">
      {content.objectives && content.objectives.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold text-stone-700 uppercase tracking-wide text-xs">Objectifs</h3>
          <ul className="space-y-1">
            {content.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2 text-stone-700">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                {obj}
              </li>
            ))}
          </ul>
        </section>
      )}

      {content.phases && content.phases.length > 0 && (
        <section>
          <h3 className="mb-3 font-semibold text-stone-700 uppercase tracking-wide text-xs">Phases du cours</h3>
          <div className="space-y-3">
            {content.phases.map((phase, i) => (
              <div key={i} className="rounded-lg border border-stone-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-stone-900">{phase.name}</span>
                  {phase.duration && <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{phase.duration} min</span>}
                </div>
                {phase.description && <p className="text-stone-600 mb-2">{phase.description}</p>}
                {phase.activities && phase.activities.length > 0 && (
                  <ul className="space-y-1">
                    {phase.activities.map((act, j) => (
                      <li key={j} className="flex items-start gap-2 text-stone-600">
                        <span className="text-stone-400">›</span> {act}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {content.materials && content.materials.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold text-stone-700 uppercase tracking-wide text-xs">Matériel requis</h3>
          <div className="flex flex-wrap gap-2">
            {content.materials.map((m, i) => (
              <span key={i} className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">{m}</span>
            ))}
          </div>
        </section>
      )}

      {content.differentiation && content.differentiation.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold text-stone-700 uppercase tracking-wide text-xs">Différenciation</h3>
          <div className="space-y-2">
            {content.differentiation.map((d, i) => (
              <div key={i} className="flex gap-3 rounded-lg bg-purple-50 p-3">
                <span className="font-medium text-purple-800 shrink-0">{d.group}:</span>
                <span className="text-purple-700">{d.strategy}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {content.conclusion && (
        <section>
          <h3 className="mb-2 font-semibold text-stone-700 uppercase tracking-wide text-xs">Conclusion</h3>
          <p className="text-stone-700">{content.conclusion}</p>
        </section>
      )}

      {content.assessmentCheck && (
        <section>
          <h3 className="mb-2 font-semibold text-stone-700 uppercase tracking-wide text-xs">Vérification des apprentissages</h3>
          <p className="text-stone-700">{content.assessmentCheck}</p>
        </section>
      )}
    </div>
  )
}

function WorksheetView({ content }: { content: WorksheetContent }) {
  return (
    <div className="space-y-5 text-sm">
      {content.instructions && (
        <p className="rounded-lg bg-blue-50 p-3 text-blue-800 italic">{content.instructions}</p>
      )}
      {content.questions && content.questions.length > 0 && (
        <div className="space-y-4">
          {content.questions.map((q, i) => (
            <div key={i} className="rounded-lg border border-stone-200 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-medium text-stone-900">{q.number}. {q.question}</p>
                {q.points && <span className="text-xs text-stone-400 shrink-0 bg-stone-100 px-2 py-0.5 rounded-full">{q.points} pts</span>}
              </div>
              {q.options && (
                <ul className="space-y-1 ml-4">
                  {q.options.map((opt, j) => (
                    <li key={j} className="text-stone-600">{opt}</li>
                  ))}
                </ul>
              )}
              {q.space && q.space > 0 && (
                <div className="mt-3 space-y-2">
                  {Array.from({ length: q.space }).map((_, j) => (
                    <div key={j} className="border-b border-stone-200 h-6" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AssessmentView({ content }: { content: AssessmentContent }) {
  return (
    <div className="space-y-5 text-sm">
      <div className="flex gap-4 text-stone-500">
        {content.duration && <span>Durée: {content.duration} min</span>}
        {content.totalPoints && <span>Total: {content.totalPoints} pts</span>}
      </div>
      {content.instructions && (
        <p className="rounded-lg bg-amber-50 p-3 text-amber-800 italic">{content.instructions}</p>
      )}
      {content.sections && content.sections.map((section, si) => (
        <div key={si} className="space-y-3">
          <h3 className="font-semibold text-stone-800 border-b pb-2">{section.title}</h3>
          {section.instructions && <p className="text-stone-500 italic">{section.instructions}</p>}
          {section.questions.map((q, qi) => (
            <div key={qi} className="rounded-lg border border-stone-200 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-medium text-stone-900">{q.number}. {q.question}</p>
                {q.points && <span className="text-xs text-stone-400 shrink-0 bg-stone-100 px-2 py-0.5 rounded-full">{q.points} pts</span>}
              </div>
              {q.space && q.space > 0 && (
                <div className="mt-3 space-y-2">
                  {Array.from({ length: q.space }).map((_, j) => (
                    <div key={j} className="border-b border-stone-200 h-6" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      {content.successCriteria && content.successCriteria.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold text-stone-700 uppercase tracking-wide text-xs">Critères de réussite</h3>
          <ul className="space-y-1">
            {content.successCriteria.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-stone-700">
                <span className="text-green-500 font-bold">✓</span> {c}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function ParentMessageView({ content }: { content: ParentMessageContent }) {
  return (
    <div className="space-y-4 text-sm">
      {content.subject && (
        <div className="rounded-lg bg-stone-50 p-3">
          <span className="text-xs font-medium text-stone-500 uppercase">Objet: </span>
          <span className="text-stone-900">{content.subject}</span>
        </div>
      )}
      {content.body && (
        <div className="text-stone-700 whitespace-pre-wrap leading-relaxed">{content.body}</div>
      )}
      {content.closing && (
        <p className="text-stone-700 italic">{content.closing}</p>
      )}
    </div>
  )
}

export default function DocumentResult({ type, content }: DocumentResultProps) {
  const c = content as Record<string, unknown>

  switch (type) {
    case 'LESSON_PLAN':
      return <LessonPlanView content={c as LessonPlanContent} />
    case 'WORKSHEET':
      return <WorksheetView content={c as WorksheetContent} />
    case 'ASSESSMENT':
      return <AssessmentView content={c as AssessmentContent} />
    case 'PARENT_MESSAGE':
      return <ParentMessageView content={c as ParentMessageContent} />
    default:
      return (
        <div className="text-sm text-stone-500">
          <pre className="whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre>
        </div>
      )
  }
}
