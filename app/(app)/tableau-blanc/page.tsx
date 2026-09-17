'use client'

import { useEffect, useState } from 'react'
import WhiteboardCanvas from './WhiteboardCanvas'

export default function TableauBlancPage() {
  const [data, setData] = useState<{ widgets: unknown[]; background: { type: string; value: string } } | null>(null)

  useEffect(() => {
    fetch('/api/whiteboard')
      .then(r => r.json())
      .then(wb => setData({
        widgets: wb.widgets ?? [],
        background: wb.background ?? { type: 'color', value: '#1e1b4b' },
      }))
      .catch(() => setData({ widgets: [], background: { type: 'color', value: '#1e1b4b' } }))
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)', background: '#1e1b4b' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    )
  }

  return (
    <div className="flex flex-col -mx-6 -my-8 md:-mx-10 md:-my-10" style={{ height: 'calc(100vh - 0px)' }}>
      <WhiteboardCanvas
        initialWidgets={data.widgets as never}
        initialBackground={data.background as never}
      />
    </div>
  )
}
