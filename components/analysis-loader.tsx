"use client"

import { useState, useEffect } from "react"

const LOADING_TEXTS = [
  '排列天干地支...',
  '推算四柱八字...',
  '安紫微诸星...',
  '定十二宫位...',
  '察五行盈虚...',
  '合八字喜忌...',
  '观星象方位...',
  '推演宜居之地...',
]

export function AnalysisLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [textIndex, setTextIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 80)
    return () => clearInterval(interval)
  }, [onComplete])

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % LOADING_TEXTS.length)
    }, 600)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Spinning bagua diagram */}
      <div className="relative w-40 h-40 mb-12">
        <div className="absolute inset-0 animate-spin-slow">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(22 70% 42%)" strokeWidth="0.5" opacity="0.3" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="hsl(22 70% 42%)" strokeWidth="0.5" opacity="0.2" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="hsl(22 70% 42%)" strokeWidth="0.5" opacity="0.15" />
            {/* Trigram lines */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <line
                key={angle}
                x1={100 + 50 * Math.cos((angle * Math.PI) / 180)}
                y1={100 + 50 * Math.sin((angle * Math.PI) / 180)}
                x2={100 + 85 * Math.cos((angle * Math.PI) / 180)}
                y2={100 + 85 * Math.sin((angle * Math.PI) / 180)}
                stroke="hsl(22 70% 42%)"
                strokeWidth="1"
                opacity="0.3"
              />
            ))}
          </svg>
        </div>
        
        {/* Center yin-yang */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-primary/30 flex items-center justify-center animate-pulse-glow">
            <span className="text-2xl font-serif text-primary">{'卦'}</span>
          </div>
        </div>
      </div>

      {/* Loading text */}
      <p className="text-lg font-serif font-semibold text-primary/80 mb-8 h-7 transition-opacity duration-300" key={textIndex}>
        {LOADING_TEXTS[textIndex]}
      </p>

      {/* Progress bar */}
      <div className="w-64 h-px bg-border relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-primary transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground font-sans">
        {progress}{'%'}
      </p>
    </section>
  )
}
