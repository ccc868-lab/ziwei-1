"use client"

import type { BaziChart } from "@/lib/bazi-engine"
import { ELEMENT_COLORS, ELEMENT_BG_COLORS, TEN_GOD_MEANINGS } from "@/lib/bazi-engine"

type BaziChartDisplayProps = {
  bazi: BaziChart
  gender: string
}

export function BaziChartDisplay({ bazi, gender }: BaziChartDisplayProps) {
  const pillars = [
    { label: '年柱', sublabel: '祖上/童年', pillar: bazi.yearPillar },
    { label: '月柱', sublabel: '父母/青年', pillar: bazi.monthPillar },
    { label: '日柱', sublabel: '自身/中年', pillar: bazi.dayPillar },
    { label: '时柱', sublabel: '子女/晚年', pillar: bazi.hourPillar },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-xl font-serif font-bold text-foreground mb-2">
          {'四柱八字命盘'}
        </h3>
        <p className="text-sm text-muted-foreground font-sans font-medium">
          {gender === 'male' ? '乾' : '坤'}{'造 · 日主'}
          <span style={{ color: ELEMENT_COLORS[bazi.dayMasterElement] }}>
            {bazi.dayMaster}{bazi.dayMasterElement}
          </span>
          {'（'}{bazi.dayMasterYinYang}{'）'}
          {' · 生肖属'}{bazi.zodiac}
          {' · '}{bazi.geJu.name}
        </p>
      </div>

      {/* Four Pillars with 十神 and 纳音 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-8">
        {pillars.map(({ label, sublabel, pillar }) => {
          const stemColor = ELEMENT_COLORS[pillar.stemElement]
          const branchColor = ELEMENT_COLORS[pillar.branchElement]
          const isDay = label === '日柱'

          return (
            <div
              key={label}
              className={`flex flex-col items-center border p-3 md:p-5 transition-all duration-300 ${
                isDay ? 'border-primary/40 bg-primary/5' : 'border-border'
              }`}
            >
              <span className="text-xs text-muted-foreground font-sans mb-0.5">{label}</span>
              <span className="text-[10px] text-muted-foreground/50 font-sans mb-1">{sublabel}</span>

              {/* 十神 */}
              <span className="text-[10px] font-sans mb-2 px-1.5 py-0.5 border border-border text-muted-foreground">
                {pillar.tenGod}
              </span>

              {/* Heavenly Stem */}
              <div
                className="w-full py-2.5 flex flex-col items-center mb-1"
                style={{ backgroundColor: ELEMENT_BG_COLORS[pillar.stemElement] }}
              >
                <span className="text-2xl md:text-3xl font-serif font-bold" style={{ color: stemColor }}>
                  {pillar.stem}
                </span>
                <span className="text-[10px] mt-0.5 font-sans font-medium" style={{ color: stemColor }}>
                  {pillar.stemElement}
                </span>
              </div>

              {/* Earthly Branch */}
              <div
                className="w-full py-2.5 flex flex-col items-center mb-1"
                style={{ backgroundColor: ELEMENT_BG_COLORS[pillar.branchElement] }}
              >
                <span className="text-2xl md:text-3xl font-serif font-bold" style={{ color: branchColor }}>
                  {pillar.branch}
                </span>
                <span className="text-[10px] mt-0.5 font-sans" style={{ color: branchColor }}>
                  {pillar.branchElement}
                </span>
              </div>

              {/* 藏干 */}
              <div className="flex flex-wrap gap-1 justify-center mt-1 mb-1">
                {pillar.hiddenStems.map((hs, i) => (
                  <span
                    key={`${hs.stem}-${i}`}
                    className="text-[9px] px-1 py-0.5 font-sans"
                    style={{ backgroundColor: ELEMENT_BG_COLORS[hs.element], color: ELEMENT_COLORS[hs.element] }}
                  >
                    {hs.stem}{hs.tenGod === '日主' ? '' : `(${hs.tenGod.charAt(0)}${hs.tenGod.charAt(1)})`}
                  </span>
                ))}
              </div>

              {/* 纳音 */}
              <span className="text-[9px] text-muted-foreground/50 font-sans mt-auto pt-1 text-center leading-tight">
                {pillar.nayin}
              </span>

              {isDay && (
                <span className="text-[10px] text-primary/60 mt-1 font-sans">{'日主'}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* 格局解读 */}
      <div className="border border-primary/20 bg-primary/5 p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-primary/60" />
          <h4 className="text-sm font-serif font-bold text-primary">{'格局：'}{bazi.geJu.name}{'（'}{bazi.geJu.level}{'）'}</h4>
        </div>
        <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-2 pl-3">
          {bazi.geJu.desc}
        </p>
        <p className="text-xs text-primary/40 font-serif italic pl-3">
          {bazi.geJu.classicQuote}
        </p>
      </div>

      {/* 日主强弱分析 */}
      <div className="border border-border p-5 mb-6">
        <h4 className="text-sm font-serif font-bold text-foreground mb-3">{'日主强弱分析'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-1 h-full bg-primary/30 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground/60 font-sans mb-1">
                {'日主'}{bazi.dayMaster}{'（'}{bazi.dayMasterElement}{'）'}
              </p>
              <p className="text-sm font-serif" style={{ color: ELEMENT_COLORS[bazi.dayMasterElement] }}>
                {bazi.dayMasterAnalysis.strength}
              </p>
              <p className="text-xs text-muted-foreground font-sans mt-1 leading-relaxed">
                {bazi.dayMasterAnalysis.desc}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-1 h-full flex-shrink-0" style={{ backgroundColor: ELEMENT_COLORS[bazi.favorableElement] }} />
            <div>
              <p className="text-xs text-muted-foreground/60 font-sans mb-1">{'喜用神'}</p>
              <p className="text-sm font-serif" style={{ color: ELEMENT_COLORS[bazi.favorableElement] }}>
                {bazi.favorableElement}
              </p>
              <p className="text-xs text-muted-foreground font-sans mt-1 leading-relaxed">
                {bazi.dayMasterAnalysis.advice}
              </p>
            </div>
          </div>
        </div>

        {/* Strength bar */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground font-sans w-12">{'极弱'}</span>
          <div className="flex-1 h-2 bg-secondary rounded-full relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min(bazi.dayMasterAnalysis.ratio * 250, 100)}%`,
                backgroundColor: ELEMENT_COLORS[bazi.dayMasterElement],
              }}
            />
            {/* Center marker */}
            <div className="absolute inset-y-0 left-1/2 w-px bg-foreground/20" />
          </div>
          <span className="text-[10px] text-muted-foreground font-sans w-12 text-right">{'极旺'}</span>
        </div>
      </div>

      {/* 神煞 */}
      <div className="border border-border p-5 mb-6">
        <h4 className="text-sm font-serif font-bold text-foreground mb-3">{'神煞吉凶'}</h4>
        <div className="flex flex-col gap-3">
          {bazi.shenSha.map((sha) => (
            <div key={sha.name} className="flex items-start gap-3 p-3 border border-border">
              <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center text-xs font-serif border ${
                sha.type === 'auspicious'
                  ? 'border-primary/40 text-primary bg-primary/5'
                  : sha.type === 'inauspicious'
                    ? 'border-destructive/40 text-destructive bg-destructive/5'
                    : 'border-border text-muted-foreground bg-secondary/30'
              }`}>
                {sha.name.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-serif font-semibold text-foreground">{sha.name}</span>
                  <span className={`text-[10px] px-1 py-0.5 font-sans ${
                    sha.type === 'auspicious'
                      ? 'bg-primary/10 text-primary'
                      : sha.type === 'inauspicious'
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-secondary text-muted-foreground'
                  }`}>
                    {sha.type === 'auspicious' ? '吉' : sha.type === 'inauspicious' ? '凶' : '中'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">{sha.desc}</p>
                <p className="text-[10px] text-primary/50 font-sans mt-1">
                  {'择城建议：'}{sha.cityAdvice}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 大运 */}
      <div className="border border-border p-5">
        <h4 className="text-sm font-serif font-bold text-foreground mb-3">{'大运流转'}</h4>
        <p className="text-xs text-muted-foreground font-sans mb-4">
          {'大运十年一转，主宰人生运势起伏。每步大运五行不同，影响择城方位。'}
        </p>
        <div className="grid grid-cols-3 md:grid-cols-8 gap-2">
          {bazi.daYun.map((dy, i) => {
            const stemColor = ELEMENT_COLORS[dy.stemElement]
            const branchColor = ELEMENT_COLORS[dy.branchElement]
            return (
              <div
                key={dy.age}
                className={`flex flex-col items-center p-2 border border-border transition-all duration-300 ${
                  i === 2 ? 'border-primary/30 bg-primary/5' : ''
                }`}
              >
                <span className="text-[9px] text-muted-foreground/50 font-sans mb-1">{dy.age}{'岁'}</span>
                <div className="flex flex-col items-center gap-0.5 mb-1">
                  <span className="text-sm font-serif" style={{ color: stemColor }}>{dy.stem}</span>
                  <span className="text-sm font-serif" style={{ color: branchColor }}>{dy.branch}</span>
                </div>
                <span className="text-[8px] text-muted-foreground/40 font-sans text-center leading-tight">
                  {dy.nayin}
                </span>
                <span className="text-[8px] font-sans mt-0.5 px-1 py-0.5 border border-border text-muted-foreground/60 text-center">
                  {dy.tenGod}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
