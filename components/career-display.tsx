"use client"

import { useState } from "react"
import type { CareerAnalysis, BaziChart } from "@/lib/bazi-engine"
import { ELEMENT_COLORS, ELEMENT_BG_COLORS } from "@/lib/bazi-engine"

type CareerDisplayProps = {
  career: CareerAnalysis
  bazi: BaziChart
}

export function CareerDisplay({ career, bazi }: CareerDisplayProps) {
  const [showDetail, setShowDetail] = useState<string | null>('tenGod')

  const detailSections = [
    { key: 'tenGod', label: '十神论职', sublabel: '命理核心' },
    { key: 'element', label: '五行论业', sublabel: '行业属性' },
    { key: 'ziwei', label: '紫微论事', sublabel: '事业宫解' },
    { key: 'geju', label: '格局论道', sublabel: '格局建议' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-serif font-bold text-foreground mb-2">
          {'事业天命，职业方向'}
        </h3>
        <p className="text-sm text-muted-foreground font-sans font-medium">
          {'综合十神格局、五行喜忌、紫微事业宫，解析最适合的职业方向'}
        </p>
      </div>

      {/* Primary Direction Card */}
      <div className="border border-primary/30 p-6 mb-6 max-w-3xl mx-auto" style={{ backgroundColor: ELEMENT_BG_COLORS[bazi.favorableElement] }}>
        <div className="text-center">
          <span className="text-[10px] text-muted-foreground/60 font-sans block mb-2">{'命理首推职业方向'}</span>
          <h4 className="text-2xl font-serif font-bold mb-2" style={{ color: ELEMENT_COLORS[bazi.favorableElement] }}>
            {career.primaryDirection}
          </h4>
          <p className="text-sm text-muted-foreground font-sans font-medium mb-4">
            {'辅助方向：'}{career.secondaryDirection}
          </p>

          {/* Strengths */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {career.strengths.map(s => (
              <span
                key={s}
                className="text-xs px-3 py-1.5 border font-sans font-medium"
                style={{
                  borderColor: ELEMENT_COLORS[bazi.favorableElement] + '40',
                  color: ELEMENT_COLORS[bazi.favorableElement],
                  backgroundColor: ELEMENT_BG_COLORS[bazi.favorableElement],
                }}
              >
                {s}
              </span>
            ))}
          </div>

          {/* Classic Quote */}
          <p className="text-xs text-primary/50 font-serif italic leading-relaxed max-w-md mx-auto">
            {career.classicQuote}
          </p>
        </div>
      </div>

      {/* Suitable Industries & Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-3xl mx-auto">
        {/* Suitable Industries */}
        <div className="border border-border p-5">
          <h5 className="text-sm font-serif font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ELEMENT_COLORS[bazi.favorableElement] }} />
            {'适合行业'}
            <span className="text-[10px] text-muted-foreground font-sans font-normal">
              {'（'}{bazi.favorableElement}{'行为主）'}
            </span>
          </h5>
          <div className="flex flex-wrap gap-2">
            {career.industries.map(ind => (
              <span
                key={ind}
                className="text-xs px-2.5 py-1 bg-secondary text-secondary-foreground font-sans font-medium"
              >
                {ind}
              </span>
            ))}
          </div>
        </div>

        {/* Suitable Roles */}
        <div className="border border-border p-5">
          <h5 className="text-sm font-serif font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {'适合岗位'}
          </h5>
          <div className="flex flex-wrap gap-2">
            {career.roles.map(role => (
              <span
                key={role}
                className="text-xs px-2.5 py-1 bg-primary/10 text-primary font-sans font-medium"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Avoid Industries */}
      <div className="border border-destructive/20 p-5 mb-8 max-w-3xl mx-auto">
        <h5 className="text-sm font-serif font-bold text-foreground mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
          {'不宜行业'}
          <span className="text-[10px] text-muted-foreground font-sans font-normal">
            {'（忌神'}{bazi.unfavorableElement}{'行）'}
          </span>
        </h5>
        <div className="flex flex-wrap gap-2">
          {career.avoidIndustries.map(ind => (
            <span
              key={ind}
              className="text-xs px-2.5 py-1 bg-destructive/10 text-destructive/70 font-sans font-medium"
            >
              {ind}
            </span>
          ))}
        </div>
      </div>

      {/* Detail Analysis Sections */}
      <div className="max-w-3xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex border border-border mb-6">
          {detailSections.map(sec => (
            <button
              key={sec.key}
              type="button"
              onClick={() => setShowDetail(showDetail === sec.key ? null : sec.key)}
              className={`flex-1 px-4 py-3 flex flex-col items-center gap-0.5 transition-all duration-300 ${
                showDetail === sec.key
                  ? 'bg-primary/10 text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <span className="text-sm font-serif font-bold">{sec.label}</span>
              <span className="text-[10px] font-sans">{sec.sublabel}</span>
            </button>
          ))}
        </div>

        {/* Detail Content */}
        {showDetail === 'tenGod' && (
          <div className="border border-border p-6 animate-fade-in-up">
            <h5 className="text-sm font-serif font-bold text-foreground mb-4">
              {'十神定职业方向'}
            </h5>
            <p className="text-sm text-foreground/80 font-sans font-medium leading-relaxed mb-4">
              {career.tenGodAnalysis}
            </p>
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground/60 font-sans leading-relaxed">
                {'十神是八字命理的核心概念，以日主为中心，审视四柱其余天干地支与日主的生克关系。十神旺衰决定了一个人的性格特质与职业倾向。《三命通会》《滴天髓》对此有详尽论述。'}
              </p>
            </div>
          </div>
        )}

        {showDetail === 'element' && (
          <div className="border border-border p-6 animate-fade-in-up">
            <h5 className="text-sm font-serif font-bold text-foreground mb-4">
              {'五行定行业属性'}
            </h5>
            <p className="text-sm text-foreground/80 font-sans font-medium leading-relaxed mb-4">
              {career.elementAnalysis}
            </p>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {(['金', '木', '水', '火', '土'] as const).map(el => (
                <div
                  key={el}
                  className="text-center py-3 border transition-all"
                  style={{
                    borderColor: el === bazi.favorableElement ? ELEMENT_COLORS[el] : 'transparent',
                    backgroundColor: ELEMENT_BG_COLORS[el],
                  }}
                >
                  <span className="text-lg font-serif font-bold block" style={{ color: ELEMENT_COLORS[el] }}>
                    {el}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-sans block mt-1">
                    {bazi.elementCounts[el]?.toFixed(1)}
                  </span>
                  {el === bazi.favorableElement && (
                    <span className="text-[9px] text-primary font-sans font-medium block mt-0.5">
                      {'喜用'}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground/60 font-sans leading-relaxed">
                {'五行与行业的对应关系源自《协纪辨方书》与《穷通宝鉴》。喜用神所属五行对应的行业，最能助益命主的事业发展。'}
              </p>
            </div>
          </div>
        )}

        {showDetail === 'ziwei' && (
          <div className="border border-border p-6 animate-fade-in-up">
            <h5 className="text-sm font-serif font-bold text-foreground mb-4">
              {'紫微事业宫解析'}
            </h5>
            <p className="text-sm text-foreground/80 font-sans font-medium leading-relaxed mb-4">
              {career.ziweiCareerAnalysis || '紫微斗数事业宫主星影响职业方向与事业格局。结合命宫主星与四化飞星，可更精确判断适合的职业领域。'}
            </p>
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground/60 font-sans leading-relaxed">
                {'紫微斗数以十四主星坐守事业宫来判断职业方向。《果老星宗》《紫微斗数全书》对各星坐事业宫有详尽论述。事业宫主星的庙旺得利陷，直接影响事业的顺遂程度。'}
              </p>
            </div>
          </div>
        )}

        {showDetail === 'geju' && (
          <div className="border border-border p-6 animate-fade-in-up">
            <h5 className="text-sm font-serif font-bold text-foreground mb-4">
              {'格局论事业发展'}
            </h5>
            <p className="text-sm text-foreground/80 font-sans font-medium leading-relaxed mb-4">
              {career.geJuAdvice}
            </p>
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-xs text-muted-foreground/60 font-sans leading-relaxed">
                {'格局是八字命理的总纲，决定了一个人的整体人生走向。《子平真诠》专论格局取用，以月令透干为首要判断依据。格局的高低决定了事业的天花板。'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Advice */}
      <div className="border border-primary/20 p-6 mt-8 max-w-3xl mx-auto" style={{ backgroundColor: ELEMENT_BG_COLORS[bazi.favorableElement] }}>
        <h5 className="text-sm font-serif font-bold text-foreground mb-3">
          {'综合职业建议'}
        </h5>
        <p className="text-sm text-foreground/80 font-sans font-medium leading-relaxed">
          {career.advice}
        </p>
      </div>
    </div>
  )
}
