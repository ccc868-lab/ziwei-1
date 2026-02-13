"use client"

import type { BaziChart, ZiweiStar } from "@/lib/bazi-engine"
import { ELEMENT_COLORS, ELEMENT_BG_COLORS } from "@/lib/bazi-engine"

type ZiweiDisplayProps = {
  ziwei: {
    mainStar: ZiweiStar
    stars: ZiweiStar[]
    palaceAssignments: { palace: string; star: string; element: string; brightness: string; category: string; meaning: string; branchName?: string }[]
    lifePalace: string
    bodyPalace?: string
    fiveElementBureau?: { bureau: number; element: string }
    qintianNote?: string
    heluNote?: string
    ziweiPosition?: string
    gongGanSiHua?: { fromPalace: string; transform: string; toPalace: string; star: string }[]
  }
  bazi: BaziChart
}

const PALACE_DESC: Record<string, string> = {
  '命宫': '命主本质，性格根基',
  '兄弟宫': '兄弟姐妹，朋辈关系',
  '夫妻宫': '婚姻感情，配偶缘分',
  '子女宫': '后代子嗣，师生关系',
  '财帛宫': '财富收入，理财能力',
  '疾厄宫': '健康状况，灾厄祸福',
  '迁移宫': '出行旅行，外出发展',
  '交友宫': '人际关系，贵人运势',
  '事业宫': '工作事业，社会地位',
  '田宅宫': '不动产业，家庭环境',
  '福德宫': '精神生活，兴趣爱好',
  '父母宫': '父母长辈，学业考试',
}

export function ZiweiDisplay({ ziwei, bazi }: ZiweiDisplayProps) {
  const { mainStar, stars, palaceAssignments } = ziwei

  // Layout: 4x4 grid representing the 12 palaces
  // Top row: 巳(4) 午(5) 未(6) 申(7)
  // Left col: 辰(3) ... ... 酉(8)
  // Left col: 卯(2) ... ... 戌(9)
  // Bottom row: 寅(1) 丑(0) 子(11) 亥(10)
  const gridLayout = [
    [3, 4, 5, 6],
    [2, -1, -1, 7],
    [1, -1, -1, 8],
    [0, 11, 10, 9],
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-xl font-serif font-bold text-foreground mb-2">
          {'紫微星盘'}
        </h3>
        <p className="text-sm text-muted-foreground font-sans font-medium">
          {'命宫主星'}
          <span style={{ color: ELEMENT_COLORS[mainStar.element] }} className="font-serif">
            {' '}{mainStar.name}
          </span>
          {' · '}{mainStar.meaning}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {ziwei.fiveElementBureau && (
            <span className="text-xs text-primary/60 font-sans">
              {ziwei.fiveElementBureau.element}{ziwei.fiveElementBureau.bureau}{'局'}
            </span>
          )}
          {ziwei.bodyPalace && (
            <span className="text-xs text-muted-foreground/60 font-sans">
              {'身宫在'}{ziwei.bodyPalace}
            </span>
          )}
          {ziwei.ziweiPosition && (
            <span className="text-xs text-muted-foreground/60 font-sans">
              {'紫微在'}{ziwei.ziweiPosition}
            </span>
          )}
        </div>
      </div>

      {/* Star Chart Grid */}
      <div className="grid grid-cols-4 gap-px bg-border mb-10">
        {gridLayout.flat().map((palaceIndex, gridIdx) => {
          if (palaceIndex === -1) {
            // Center cells
            if (gridIdx === 5) {
              return (
                <div key={gridIdx} className="bg-card col-span-1 row-span-1 p-4 flex flex-col items-center justify-center" />
              )
            }
            if (gridIdx === 6) {
              return (
                <div key={gridIdx} className="bg-card p-4 flex flex-col items-center justify-center">
                  <span className="text-3xl font-serif font-bold text-primary mb-1">{'紫微'}</span>
                  <span className="text-xs text-muted-foreground font-sans">{'斗数命盘'}</span>
                </div>
              )
            }
            if (gridIdx === 9) {
              return (
                <div key={gridIdx} className="bg-card p-4 flex flex-col items-center justify-center">
                  <span className="text-sm font-serif text-primary/60 mb-1">
                    {'日主 '}{bazi.dayMaster}
                  </span>
                  <span className="text-xs text-muted-foreground font-sans">
                    {'喜 '}{bazi.favorableElement}
                  </span>
                </div>
              )
            }
            return (
              <div key={gridIdx} className="bg-card p-4" />
            )
          }

          const palace = palaceAssignments[palaceIndex]
          if (!palace) return <div key={gridIdx} className="bg-card p-3" />

          const starDetail = stars.find(s => s.palace === palace.palace)
          const elementColor = ELEMENT_COLORS[palace.element]
          const isLifePalace = palace.palace === '命宫'
          const isMigration = palace.palace === '迁移宫'

          return (
            <div
              key={gridIdx}
              className={`bg-card p-3 flex flex-col transition-all duration-300 min-h-[100px] ${
                isLifePalace
                  ? 'ring-1 ring-primary/30 bg-primary/5'
                  : isMigration
                    ? 'ring-1 ring-accent/30'
                    : ''
              }`}
            >
              {/* Palace name */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground/60 font-sans">{palace.palace}</span>
                {isLifePalace && (
                  <span className="text-[9px] px-1 py-0.5 bg-primary/10 text-primary font-sans">{'命宫'}</span>
                )}
                {isMigration && (
                  <span className="text-[9px] px-1 py-0.5 bg-accent/10 text-accent font-sans">{'迁移'}</span>
                )}
              </div>

              {/* Star */}
              <div className="flex-1 flex flex-col items-center justify-center gap-1">
                <span className="text-sm font-serif font-semibold" style={{ color: elementColor }}>
                  {palace.star}
                </span>
                <div className="flex items-center gap-1">
                  <span
                    className="text-[9px] px-1.5 py-0.5 font-sans"
                    style={{ backgroundColor: ELEMENT_BG_COLORS[palace.element], color: elementColor }}
                  >
                    {palace.element}
                  </span>
                  {palace.brightness && (
                    <span className="text-[9px] text-muted-foreground/50 font-sans">
                      {palace.brightness}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-[9px] text-muted-foreground/50 font-sans text-center mt-1 leading-tight">
                {PALACE_DESC[palace.palace] || ''}
              </p>
            </div>
          )
        })}
      </div>

      {/* Key Stars Analysis */}
      <div className="border border-border p-6">
        <h4 className="text-sm font-serif font-bold text-foreground mb-4">{'关键星曜解析'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stars.slice(0, 6).map(star => (
            <div key={`${star.palace}-${star.name}`} className="flex items-start gap-3 p-3 border border-border">
              <div
                className="w-10 h-10 flex items-center justify-center flex-shrink-0 font-serif text-sm"
                style={{ backgroundColor: ELEMENT_BG_COLORS[star.element], color: ELEMENT_COLORS[star.element] }}
              >
                {star.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-serif font-semibold text-foreground">{star.name}</span>
                  <span className="text-[10px] text-muted-foreground font-sans">{'在'}{star.palace}</span>
                  <span
                    className="text-[10px] px-1 font-sans"
                    style={{ color: ELEMENT_COLORS[star.element] }}
                  >
                    {star.element}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                  {star.meaning}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-school analysis notes */}
      {(ziwei.qintianNote || ziwei.heluNote || (ziwei.gongGanSiHua && ziwei.gongGanSiHua.length > 0)) && (
        <div className="border border-border p-6 mb-6">
          <h4 className="text-sm font-serif font-bold text-foreground mb-4">{'各流派综合分析'}</h4>
          <div className="flex flex-col gap-4">
            {ziwei.gongGanSiHua && ziwei.gongGanSiHua.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-3 bg-primary" />
                  <span className="text-xs font-sans font-semibold text-primary">{'飞星四化（宫干飞化）'}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-3">
                  {ziwei.gongGanSiHua.slice(0, 6).map((gs, i) => (
                    <p key={i} className="text-xs text-muted-foreground font-sans leading-relaxed">
                      {gs.fromPalace}{'干飞'}
                      <span className="text-foreground font-medium">{gs.transform}</span>
                      {'入'}{gs.toPalace}{'（'}{gs.star}{'）'}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {ziwei.qintianNote && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-3 bg-accent" />
                  <span className="text-xs font-sans font-semibold text-accent">{'钦天四化派'}</span>
                </div>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed pl-3">
                  {ziwei.qintianNote}
                </p>
              </div>
            )}
            {ziwei.heluNote && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-3" style={{ backgroundColor: ELEMENT_COLORS['水'] }} />
                  <span className="text-xs font-sans font-semibold" style={{ color: ELEMENT_COLORS['水'] }}>{'河洛紫微派'}</span>
                </div>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed pl-3">
                  {ziwei.heluNote}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Migration palace special note */}
      {stars.find(s => s.palace === '迁移宫') && (
        <div className="mt-6 border border-accent/30 bg-accent/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-accent" />
            <span className="text-sm font-serif font-bold text-accent">{'迁移宫择城建议'}</span>
          </div>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed pl-3">
            {'迁移宫主星为'}
            <span style={{ color: ELEMENT_COLORS[stars.find(s => s.palace === '迁移宫')!.element] }} className="font-serif">
              {stars.find(s => s.palace === '迁移宫')!.name}
            </span>
            {'，属'}
            <span style={{ color: ELEMENT_COLORS[stars.find(s => s.palace === '迁移宫')!.element] }}>
              {stars.find(s => s.palace === '迁移宫')!.element}
            </span>
            {'行。迁移宫掌管出行、外出发展运势。选择城市时，'}
            {'宜选五行与迁移宫主星相生或相同的城市，可助外出发展顺利，贵人运旺。'}
          </p>
        </div>
      )}
    </div>
  )
}
