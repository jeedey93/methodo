'use client'

import { useEffect, useState } from 'react'
import WhiteboardCanvas, { type PageData } from './WhiteboardCanvas'

export default function TableauBlancPage() {
  const [pages, setPages] = useState<PageData[] | null>(null)

  useEffect(() => {
    fetch('/api/whiteboard-pages')
      .then(r => r.json())
      .then((data: PageData[]) => setPages(data.map(p => ({
        ...p,
        widgets: (p.widgets as unknown as PageData['widgets']) ?? [],
        background: (p.background as unknown as PageData['background']) ?? { type: 'color', value: '#1e1b4b' },
      }))))
      .catch(() => setPages([]))
  }, [])

  if (pages === null) {
    return (
      <div className="flex flex-1 items-center justify-center" style={{ background: '#1e1b4b', height: '100%' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    )
  }

  return <WhiteboardCanvas initialPages={pages} />
}
