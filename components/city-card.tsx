"use client"

import type { CityRecommendation } from "@/lib/bazi-engine"
import { ELEMENT_COLORS, ELEMENT_BG_COLORS } from "@/lib/bazi-engine"

type CityCardProps = {
  city: CityRecommendation
  rank: number
  isExpanded: boolean
  onToggle: () => void
  favorableElement: string
}

const DIRECTION_BAGUA: Record<string, { gua: string; symbol: string }> = {
  '北': { gua: '坎', symbol: '☵' },
  '南': { gua: '离', symbol: '☲' },
  '东': { gua: '震', symbol: '☳' },
  '西': { gua: '兑', symbol: '☱' },
  '中': { gua: '坤', symbol: '☷' },
}

export function CityCard({ city, rank, isExpanded, onToggle, favorableElement }: CityCardProps) {
  const isTopPick = rank <= 3
  const elementColor = ELEMENT_COLORS[city.element]
  const elementBg = ELEMENT_BG_COLORS[city.element]
  const bagua = DIRECTION_BAGUA[city.direction]

  const analysisItems = [
    { label: '八字解析', color: 'hsl(var(--primary))', content: city.baziMatch },
    { label: '紫微解析', color: elementColor, content: city.ziweiMatch },
    { label: '职业产业', color: '#6B5B3A', content: city.careerMatch },
    { label: '纳音五行', color: ELEMENT_COLORS['土'], content: city.nayinMatch },
    { label: '风水格局', color: ELEMENT_COLORS['木'], content: city.fengshui },
    { label: '河图洛书', color: ELEMENT_COLORS['水'], content: city.hetuAnalysis },
    { label: '神煞建议', color: ELEMENT_COLORS['火'], content: city.shenShaAdvice },
    { label: '大运指引', color: ELEMENT_COLORS['金'], content: city.daYunAdvice },
  ].filter(item => item.content)

  return (
    <div
      className={`border transition-all duration-500 cursor-pointer group ${
        isTopPick
          ? 'border-primary/30 hover:border-primary/50'
          : 'border-border hover:border-primary/20'
      }`}
      onClick={onToggle}
    >
      {/* Card header */}
      <div className="p-5 flex items-start gap-4">
        {/* Rank with Bagua */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className={`w-10 h-10 flex items-center justify-center font-serif text-lg ${
            isTopPick ? 'text-primary' : 'text-muted-foreground'
          }`}>
            {rank <= 3 ? (
              <span className="relative">
                {rank}
                {rank === 1 && <span className="absolute -top-1 -right-3 text-[10px] text-primary/60">{'甲'}</span>}
                {rank === 2 && <span className="absolute -top-1 -right-3 text-[10px] text-primary/60">{'乙'}</span>}
                {rank === 3 && <span className="absolute -top-1 -right-3 text-[10px] text-primary/60">{'丙'}</span>}
              </span>
            ) : (
              <span className="text-sm">{rank}</span>
            )}
          </div>
          {bagua && (
            <span className="text-xs text-muted-foreground/40 font-serif">{bagua.symbol}</span>
          )}
        </div>

        {/* City info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-lg font-serif font-bold text-foreground">{city.name}</h4>
            <span className="text-xs text-muted-foreground font-sans">{city.province}</span>
          </div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-sans"
              style={{ backgroundColor: elementBg, color: elementColor }}
            >
              {city.element}{'行'}
            </span>
            <span className="text-xs text-muted-foreground font-sans">
              {city.direction}{'方'}
              {bagua ? ` ${bagua.gua}位` : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {city.features.map(f => (
              <span key={f} className="text-[10px] px-2 py-0.5 border border-border text-muted-foreground font-sans">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Score */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className="relative w-14 h-14">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="2"
              />
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke={elementColor}
                strokeWidth="2"
                strokeDasharray={`${city.score * 0.974} 97.4`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-serif font-bold" style={{ color: elementColor }}>
                {city.score}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 font-sans">{'契合度'}</span>
        </div>
      </div>

      {/* Expanded detail with all analysis dimensions */}
      <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[800px]' : 'max-h-0'}`}>
        <div className="px-5 pb-5 border-t border-border pt-4">
          {/* Analysis sections */}
          {analysisItems.map((item) => (
            <div key={item.label} className="mb-3 last:mb-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1 h-3.5" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-sans" style={{ color: item.color }}>
                  {item.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed pl-3">
                {item.content}
              </p>
            </div>
          ))}

          {/* Classic quote */}
          {city.classicQuote && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-[11px] text-primary/40 font-serif italic leading-relaxed">
                {city.classicQuote}
              </p>
            </div>
          )}

          {/* Overall match indicator */}
          {city.element === favorableElement && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2" style={{ backgroundColor: elementBg }}>
              <span className="text-xs font-serif" style={{ color: elementColor }}>
                {'此城五行与喜用神完美契合，综合国学分析为上佳之选'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
