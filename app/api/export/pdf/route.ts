import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { documentId } = body

  const document = await prisma.document.findFirst({ where: { id: documentId, userId: user.id } })
  if (!document) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })

  const content = document.content as Record<string, unknown>
  const metadata = document.metadata as Record<string, string>

  const html = generatePrintableHTML(document.title, document.type, content, metadata)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${document.title}.html"`,
    },
  })
}

function generatePrintableHTML(title: string, type: string, content: Record<string, unknown>, metadata: Record<string, string>): string {
  const typeLabels: Record<string, string> = {
    LESSON_PLAN: 'Planification de cours',
    WORKSHEET: 'Fiche de travail',
    ASSESSMENT: 'Évaluation',
    PARENT_MESSAGE: 'Communication aux parents',
  }

  const gradeText = metadata.grade ? `${metadata.grade}e année` : ''
  const subjectText = metadata.subject ? metadata.subject.replace('_', ' ') : ''

  let body = ''

  if (type === 'LESSON_PLAN') {
    const c = content as any
    body = `
      <h2>Objectifs</h2>
      <ul>${(c.objectives ?? []).map((o: string) => `<li>${o}</li>`).join('')}</ul>
      <h2>Mise en situation</h2><p>${c.introduction ?? ''}</p>
      <h2>Déroulement</h2>
      ${(c.phases ?? []).map((p: any) => `
        <div class="phase">
          <h3>${p.name} (${p.duration} min)</h3>
          <p>${p.description}</p>
          <ul>${(p.activities ?? []).map((a: string) => `<li>${a}</li>`).join('')}</ul>
        </div>
      `).join('')}
      <h2>Matériel</h2>
      <ul>${(c.materials ?? []).map((m: string) => `<li>${m}</li>`).join('')}</ul>
      ${c.differentiation?.length ? `<h2>Différenciation</h2>${c.differentiation.map((d: any) => `<div class="diff"><strong>${d.group}:</strong> ${d.strategy}</div>`).join('')}` : ''}
      <h2>Conclusion</h2><p>${c.conclusion ?? ''}</p>
      <h2>Vérification des apprentissages</h2><p>${c.assessmentCheck ?? ''}</p>
    `
  } else if (type === 'WORKSHEET' || type === 'ASSESSMENT') {
    const c = content as any
    const questions = type === 'WORKSHEET' ? c.questions : (c.sections ?? []).flatMap((s: any) => s.questions)
    body = `
      <div class="instructions"><strong>Instructions:</strong> ${c.instructions ?? ''}</div>
      ${(questions ?? []).map((q: any) => `
        <div class="question">
          <p><strong>${q.number}.</strong> ${q.question}${q.points ? ` <span class="points">(${q.points} pts)</span>` : ''}</p>
          ${q.options ? `<ul class="options">${q.options.map((o: string) => `<li>${o}</li>`).join('')}</ul>` : ''}
          ${(q.space ?? 0) > 0 ? Array.from({ length: q.space }).map(() => '<div class="line"></div>').join('') : ''}
        </div>
      `).join('')}
    `
  } else if (type === 'PARENT_MESSAGE') {
    const c = content as any
    body = `<p><strong>Objet:</strong> ${c.subject ?? ''}</p><div class="message">${(c.body ?? '').replace(/\n/g, '<br>')}</div><p><em>${c.closing ?? ''}</em></p>`
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a1a; line-height: 1.6; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 24px; margin: 0 0 4px; color: #1a1a1a; }
    .header .meta { color: #737373; font-size: 14px; }
    .type-badge { display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 8px; }
    h2 { color: #2563eb; font-size: 16px; margin: 20px 0 8px; border-bottom: 1px solid #e7e5e4; padding-bottom: 4px; }
    h3 { font-size: 14px; margin: 12px 0 6px; }
    .phase { background: #f9f9f9; border-left: 3px solid #2563eb; padding: 12px; margin: 8px 0; }
    .diff { background: #fffbeb; border: 1px solid #fde68a; padding: 8px; margin: 6px 0; border-radius: 4px; }
    .instructions { background: #eff6ff; padding: 12px; border-radius: 8px; margin: 12px 0; }
    .question { margin: 16px 0; page-break-inside: avoid; }
    .options { list-style: none; padding-left: 20px; }
    .options li::before { content: "○ "; }
    .line { border-bottom: 1px solid #ccc; height: 28px; margin: 4px 0; }
    .points { color: #737373; font-size: 12px; }
    .message { white-space: pre-line; margin: 12px 0; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="type-badge">${typeLabels[type] ?? type}</div>
    <h1>${title}</h1>
    <div class="meta">${[gradeText, subjectText].filter(Boolean).join(' · ')}</div>
  </div>
  ${body}
</body>
</html>`
}
