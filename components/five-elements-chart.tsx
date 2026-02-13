"use client"

import type { BaziChart } from "@/lib/bazi-engine"
import { ELEMENT_COLORS, FIVE_ELEMENTS } from "@/lib/bazi-engine"

type FiveElementsChartProps = {
  bazi: BaziChart
}

const ELEMENT_NAMES: Record<string, string> = {
  '金': 'Metal',
  '木': 'Wood',
  '水': 'Water',
  '火': 'Fire',
  '土': 'Earth',
}

const ELEMENT_DESC: Record<string, string> = {
  '金': '主义、刚毅、果断。金旺者性格坚韧，善于决断。',
  '木': '主仁、生长、向上。木旺者性格温和，富有同情心。',
  '水': '主智、灵活、变通。水旺者聪明机智，善于应变。',
  '火': '主礼、热情、光明。火旺者热情奔放，富有感染力。',
  '土': '主信、厚重、包容。土旺者诚实守信，心胸宽广。',
}

const GENERATE_RELATIONS = [
  { from: '金', to: '水', label: '金生水' },
  { from: '水', to: '木', label: '水生木' },
  { from: '木', to: '火', label: '木生火' },
  { from: '火', to: '土', label: '火生土' },
  { from: '土', to: '金', label: '土生金' },
]

const CONTROL_RELATIONS = [
  { from: '金', to: '木', label: '金克木' },
  { from: '木', to: '土', label: '木克土' },
  { from: '土', to: '水', label: '土克水' },
  { from: '水', to: '火', label: '水克火' },
  { from: '火', to: '金', label: '火克金' },
]

export function FiveElementsChart({ bazi }: FiveElementsChartProps) {
  const maxCount = Math.max(...Object.values(bazi.elementCounts))
  const total = Object.values(bazi.elementCounts).reduce((a, b) => a + b, 0)

  // Pentagon positions for five elements
  const positions = [
    { x: 50, y: 8 },   // 火 (top - south)
    { x: 92, y: 38 },  // 土 (right)
    { x: 76, y: 88 },  // 金 (bottom right - west)
    { x: 24, y: 88 },  // 水 (bottom left - north)
    { x: 8, y: 38 },   // 木 (left - east)
  ]
  const elementOrder = ['火', '土', '金', '水', '木']

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-xl font-serif font-bold text-foreground mb-2">
          {'五行分布'}
        </h3>
        <p className="text-sm text-muted-foreground font-sans font-medium">
          {'五行生克制化，阴阳平衡之道'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pentagon diagram */}
        <div className="flex items-center justify-center">
          <div className="relative w-72 h-72 md:w-80 md:h-80">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Pentagon outline */}
              <polygon
                points={positions.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="hsl(38 70% 55%)"
                strokeWidth="0.3"
                opacity="0.2"
              />
              {/* Generate lines (outer) */}
              {GENERATE_RELATIONS.map((rel) => {
                const fromIdx = elementOrder.indexOf(rel.from)
                const toIdx = elementOrder.indexOf(rel.to)
                if (fromIdx === -1 || toIdx === -1) return null
                return (
                  <line
                    key={rel.label}
                    x1={positions[fromIdx].x}
                    y1={positions[fromIdx].y}
                    x2={positions[toIdx].x}
                    y2={positions[toIdx].y}
                    stroke={ELEMENT_COLORS[rel.from]}
                    strokeWidth="0.4"
                    opacity="0.3"
                    strokeDasharray="2 2"
                  />
                )
              })}
              {/* Control lines (inner star) */}
              {CONTROL_RELATIONS.map((rel) => {
                const fromIdx = elementOrder.indexOf(rel.from)
                const toIdx = elementOrder.indexOf(rel.to)
                if (fromIdx === -1 || toIdx === -1) return null
                return (
                  <line
                    key={rel.label}
                    x1={positions[fromIdx].x}
                    y1={positions[fromIdx].y}
                    x2={positions[toIdx].x}
                    y2={positions[toIdx].y}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth="0.2"
                    opacity="0.15"
                  />
                )
              })}
              {/* Element nodes */}
              {elementOrder.map((el, i) => {
                const pos = positions[i]
                const count = bazi.elementCounts[el] || 0
                const radius = 4 + (count / maxCount) * 5
                const isFavorable = el === bazi.favorableElement

                return (
                  <g key={el}>
                    {/* Glow for favorable */}
                    {isFavorable && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={radius + 3}
                        fill={ELEMENT_COLORS[el]}
                        opacity="0.1"
                      >
                        <animate attributeName="r" values={`${radius + 2};${radius + 5};${radius + 2}`} dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius}
                      fill={ELEMENT_COLORS[el]}
                      opacity={isFavorable ? 0.8 : 0.5}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="hsl(var(--foreground))"
                      fontSize="4"
                      fontFamily="serif"
                    >
                      {el}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Bar chart and details */}
        <div className="flex flex-col gap-4">
          {FIVE_ELEMENTS.map(el => {
            const count = bazi.elementCounts[el] || 0
            const percentage = (count / total) * 100
            const isFavorable = el === bazi.favorableElement
            const isDominant = el === bazi.dominantElement
            const isWeak = el === bazi.weakElement

            return (
              <div key={el} className={`p-4 border transition-all duration-300 ${
                isFavorable ? 'border-primary/30 bg-primary/5' : 'border-border'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-serif font-bold" style={{ color: ELEMENT_COLORS[el] }}>{el}</span>
                    <span className="text-xs text-muted-foreground font-sans">{ELEMENT_NAMES[el]}</span>
                    {isFavorable && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary font-sans">{'喜用'}</span>
                    )}
                    {isDominant && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent font-sans">{'最旺'}</span>
                    )}
                    {isWeak && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground font-sans">{'偏弱'}</span>
                    )}
                  </div>
                  <span className="text-sm font-sans text-foreground">{count.toFixed(1)}</span>
                </div>
                {/* Bar */}
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: ELEMENT_COLORS[el],
                      opacity: isFavorable ? 1 : 0.6,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                  {ELEMENT_DESC[el]}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Generate and Control explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <div className="border border-border p-5">
          <h4 className="text-sm font-serif font-bold text-foreground mb-3">{'五行相生'}</h4>
          <div className="flex flex-col gap-2">
            {GENERATE_RELATIONS.map(rel => (
              <div key={rel.label} className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
                <span style={{ color: ELEMENT_COLORS[rel.from] }}>{rel.from}</span>
                <span>{'-->'}</span>
                <span style={{ color: ELEMENT_COLORS[rel.to] }}>{rel.to}</span>
                <span className="text-muted-foreground/50 ml-auto">{rel.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-border p-5">
          <h4 className="text-sm font-serif font-bold text-foreground mb-3">{'五行相克'}</h4>
          <div className="flex flex-col gap-2">
            {CONTROL_RELATIONS.map(rel => (
              <div key={rel.label} className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
                <span style={{ color: ELEMENT_COLORS[rel.from] }}>{rel.from}</span>
                <span>{'--|'}</span>
                <span style={{ color: ELEMENT_COLORS[rel.to] }}>{rel.to}</span>
                <span className="text-muted-foreground/50 ml-auto">{rel.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
