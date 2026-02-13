"use client"

import { useState, useEffect } from "react"

const BAGUA_SYMBOLS = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷']

export function HeroSection({ onStart }: { onStart: () => void }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(22 70% 42%) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />
      
      {/* Rotating bagua ring */}
      <div className={`relative mb-12 transition-all duration-1000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        <div className="relative w-48 h-48 md:w-64 md:h-64">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 animate-spin-slow">
            {BAGUA_SYMBOLS.map((symbol, i) => {
              const angle = (i * 360) / 8
              const radian = (angle * Math.PI) / 180
              const radius = 42
              const x = 50 + radius * Math.cos(radian)
              const y = 50 + radius * Math.sin(radian)
              return (
                <span
                  key={i}
                  className="absolute text-xl md:text-2xl text-primary/60 font-serif"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {symbol}
                </span>
              )
            })}
          </div>
          
          {/* Inner circle */}
          <div className="absolute inset-8 md:inset-12 rounded-full border border-primary/20 animate-pulse-glow flex items-center justify-center">
            <div className="absolute inset-2 rounded-full border border-primary/10" />
            <span className="text-4xl md:text-5xl font-serif text-primary">命</span>
          </div>
          
          {/* Corner decorations */}
          <div className="absolute -inset-4 border border-primary/10 rounded-full" />
          <div className="absolute -inset-8 border border-primary/5 rounded-full" />
        </div>
      </div>

      {/* Title */}
      <div className={`text-center transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <p className="text-sm md:text-base tracking-[0.3em] text-primary/70 mb-4 font-sans font-medium">
          {'紫微斗数 · 生辰八字 · 五行方位 · 职业天命'}
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground leading-tight mb-6 text-balance">
          {'天命择城'}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed mb-2 font-sans">
          {'以国学智慧，解读您的命理密码'}
        </p>
        <p className="text-base md:text-lg text-muted-foreground/80 max-w-md mx-auto leading-relaxed font-sans font-medium">
          {'探寻天人合一的宜居之地与事业方向'}
        </p>
      </div>

      {/* CTA Button */}
      <div className={`mt-12 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <button
          onClick={onStart}
          className="group relative px-10 py-4 border border-primary/40 text-primary hover:bg-primary/10 transition-all duration-500 font-sans font-semibold tracking-wider text-sm"
          type="button"
        >
          <span className="relative z-10">{'开始测算'}</span>
          <div className="absolute inset-0 bg-primary/5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </button>
      </div>

      {/* Bottom decoration */}
      <div className={`absolute bottom-8 flex flex-col items-center gap-2 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-xs text-muted-foreground/40 tracking-widest font-sans">{'向下滚动'}</span>
        <div className="w-px h-8 bg-primary/20 animate-pulse" />
      </div>
    </section>
  )
}
