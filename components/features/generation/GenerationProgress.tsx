'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

interface GenerationProgressProps {
  title: string
  steps: string[]
}

export default function GenerationProgress({ title, steps }: GenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (currentStep >= steps.length - 1) return
    const interval = setInterval(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
    }, 1400)
    return () => clearInterval(interval)
  }, [currentStep, steps.length])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="w-full max-w-md text-center">
        {/* Animated icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
          <Sparkles className="h-8 w-8 text-white animate-pulse" />
        </div>

        <h2 className="mb-2 text-xl font-semibold text-stone-900">{title}</h2>

        {/* Steps */}
        <div className="mt-6 space-y-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all duration-500 ${
                i < currentStep
                  ? 'text-stone-400 opacity-60'
                  : i === currentStep
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-stone-300'
              }`}
            >
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                i < currentStep ? 'bg-green-100 text-green-600' : i === currentStep ? 'bg-blue-200 text-blue-700' : 'bg-stone-100 text-stone-300'
              }`}>
                {i < currentStep ? '✓' : i + 1}
              </span>
              {step}
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-stone-400">Cela peut prendre quelques secondes...</p>
      </div>
    </div>
  )
}
