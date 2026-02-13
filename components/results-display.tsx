"use client"

import { useState } from "react"
import type { BaziChart, CityRecommendation, ZiweiStar, SiHua } from "@/lib/bazi-engine"
import { ELEMENT_COLORS, ELEMENT_BG_COLORS, FIVE_ELEMENTS } from "@/lib/bazi-engine"
import { BaziChartDisplay } from "@/components/bazi-chart-display"
import { CityCard } from "@/components/city-card"
import { FiveElementsChart } from "@/components/five-elements-chart"
import { ZiweiDisplay } from "@/components/ziwei-display"
import { CareerDisplay } from "@/components/career-display"

type ResultsDisplayProps = {
  bazi: BaziChart
  ziwei: {
    mainStar: ZiweiStar
    stars: ZiweiStar[]
    palaceAssignments: { palace: string; star: string; element: string; brightness: string; category: string; meaning: string; branchName?: string }[]
    lifePalace: string
    siHua: SiHua[]
    migrationPalace?: { palace: string; star: string; element: string; brightness: string; category: string; meaning: string; branchName?: string }
    migrationStars: ZiweiStar[]
    careerPalace?: { palace: string; star: string; element: string; brightness: string; category: string; meaning: string; branchName?: string }
    bodyPalace?: string
    fiveElementBureau?: { bureau: number; element: string }
    qintianNote?: string
    heluNote?: string
    ziweiPosition?: string
    gongGanSiHua?: { fromPalace: string; transform: string; toPalace: string; star: string }[]
  }
  cities: CityRecommendation[]
  gender: string
  birthInfo: { year: number; month: number; day: number }
  onRestart: () => void
}

type TabType = 'cities' | 'career' | 'bazi' | 'ziwei' | 'elements'

export function ResultsDisplay({ bazi, ziwei, cities, gender, birthInfo, onRestart }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabType>('cities')
  const [expandedCity, setExpandedCity] = useState<string | null>(cities[0]?.name || null)

  const tabs: { key: TabType; label: string; sublabel: string }[] = [
    { key: 'cities', label: '择城', sublabel: '城市推荐' },
    { key: 'career', label: '职业', sublabel: '事业方向' },
    { key: 'bazi', label: '八字', sublabel: '四柱命盘' },
    { key: 'ziwei', label: '紫微', sublabel: '星盘解析' },
    { key: 'elements', label: '五行', sublabel: '元素分布' },
  ]

  const topCities = cities.slice(0, 8)

  return (
    <section className="min-h-screen px-4 py-12 md:py-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.3em] text-primary/60 mb-3 font-sans font-semibold uppercase">
            {'深度国学命理分析报告'}
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 text-balance">
            {gender === 'male' ? '乾' : '坤'}{'造 '}
            {birthInfo.year}{'年'}{birthInfo.month}{'月'}{birthInfo.day}{'日生'}
          </h2>
          <p className="text-sm text-muted-foreground font-sans font-medium mb-1">
            {'生肖属'}{bazi.zodiac}{' · 日主'}
            <span style={{ color: ELEMENT_COLORS[bazi.dayMasterElement] }}>
              {bazi.dayMaster}{bazi.dayMasterElement}
            </span>
            {'（'}{bazi.dayMasterYinYang}{'）'}
            {' · '}{bazi.geJu.name}
          </p>
          <p className="text-xs text-muted-foreground/60 font-sans">
            {'年柱纳音'}{bazi.yearNayin}{' · 日主'}{bazi.dayMasterAnalysis.strength}
            {' · 喜用神'}
            <span style={{ color: ELEMENT_COLORS[bazi.favorableElement] }} className="font-serif">
              {bazi.favorableElement}
            </span>
            {ziwei.fiveElementBureau && (
              <>{' · '}{ziwei.fiveElementBureau.element}{ziwei.fiveElementBureau.bureau}{'局'}</>
            )}
            {ziwei.bodyPalace && (
              <>{' · 身宫在'}{ziwei.bodyPalace}</>
            )}
          </p>
          {bazi.trueSolarTimeNote && (
            <p className="text-[10px] text-primary/40 font-sans mt-1">
              {bazi.trueSolarTimeNote}
            </p>
          )}
          {bazi.jieqiInfo && (
            <p className="text-[10px] text-muted-foreground/40 font-sans">
              {bazi.jieqiInfo}
            </p>
          )}
        </div>

        {/* Classic Quote */}
        {bazi.classicDesc && (
          <div className="text-center mb-6 max-w-2xl mx-auto">
            <p className="text-xs text-primary/40 font-serif italic leading-relaxed">
              {bazi.classicDesc}
            </p>
          </div>
        )}

        {/* Quick Summary Bar */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {FIVE_ELEMENTS.map(el => (
            <div
              key={el}
              className="flex items-center gap-2 px-3 py-1.5 border border-border"
              style={{ borderColor: bazi.favorableElement === el ? ELEMENT_COLORS[el] : undefined }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: ELEMENT_COLORS[el] }}
              />
              <span className="text-sm font-serif font-semibold" style={{ color: ELEMENT_COLORS[el] }}>{el}</span>
              <span className="text-xs text-muted-foreground font-sans">
                {bazi.elementCounts[el]?.toFixed(1)}
              </span>
              {bazi.favorableElement === el && (
                <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary font-sans">
                  {'喜'}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* GeJu & ShenSha Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 max-w-3xl mx-auto">
          <div className="border border-border p-4 text-center">
            <span className="text-[10px] text-muted-foreground/60 font-sans block mb-1">{'格局'}</span>
            <span className="text-sm font-serif font-bold text-primary">{bazi.geJu.name}</span>
            <span className="text-[10px] text-muted-foreground/40 font-sans block mt-1">{bazi.geJu.level}</span>
          </div>
          <div className="border border-border p-4 text-center">
            <span className="text-[10px] text-muted-foreground/60 font-sans block mb-1">{'命宫主星'}</span>
            <span className="text-sm font-serif" style={{ color: ELEMENT_COLORS[ziwei.mainStar.element] }}>
              {ziwei.mainStar.name}
            </span>
            <span className="text-[10px] text-muted-foreground/40 font-sans block mt-1">
              {ziwei.mainStar.brightness ? `（${ziwei.mainStar.brightness}）` : ''}
            </span>
          </div>
          <div className="border border-border p-4 text-center">
            <span className="text-[10px] text-muted-foreground/60 font-sans block mb-1">{'神煞'}</span>
            <span className="text-sm font-serif text-foreground">
              {bazi.shenSha.slice(0, 2).map(s => s.name).join('、')}
            </span>
            <span className="text-[10px] text-muted-foreground/40 font-sans block mt-1">
              {bazi.shenSha[0]?.type === 'auspicious' ? '吉星入命' : bazi.shenSha[0]?.type === 'inauspicious' ? '须化解' : '平和'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-10 overflow-x-auto -mx-4 px-4">
          <div className="flex border border-border min-w-0">
            {tabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 md:px-6 py-3 flex flex-col items-center gap-0.5 transition-all duration-300 flex-shrink-0 ${
                  activeTab === tab.key
                    ? 'bg-primary/10 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <span className="text-sm md:text-base font-serif font-bold">{tab.label}</span>
                <span className="text-[10px] font-sans hidden md:block">{tab.sublabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in-up" key={activeTab}>
          {activeTab === 'cities' && (
            <div>
              <div className="text-center mb-8">
                <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                  {'天命所向，宜居之城'}
                </h3>
                <p className="text-sm text-muted-foreground font-sans font-medium">
                  {'综合八��喜用神、纳音五行、紫微迁移宫四化、神煞驿马、大运流年、河图洛书方位'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topCities.map((city, index) => (
                  <CityCard
                    key={city.name}
                    city={city}
                    rank={index + 1}
                    isExpanded={expandedCity === city.name}
                    onToggle={() => setExpandedCity(expandedCity === city.name ? null : city.name)}
                    favorableElement={bazi.favorableElement}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'career' && bazi.career && (
            <CareerDisplay career={bazi.career} bazi={bazi} />
          )}

          {activeTab === 'bazi' && (
            <BaziChartDisplay bazi={bazi} gender={gender} />
          )}

          {activeTab === 'ziwei' && (
            <ZiweiDisplay ziwei={ziwei} bazi={bazi} />
          )}

          {activeTab === 'elements' && (
            <FiveElementsChart bazi={bazi} />
          )}
        </div>

        {/* Restart button */}
        <div className="text-center mt-16">
          <button
            type="button"
            onClick={onRestart}
            className="px-8 py-3 text-sm border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300 font-sans"
          >
            {'重新测算'}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground/40 font-sans leading-relaxed max-w-lg mx-auto">
            {'本测算融合传统八字命理、紫微斗数、纳音五行、十神格局、神煞吉凶、大运流年、河图洛书及风水格局等国学理论，结合职业分析，仅供参考娱乐。城市与职业选择需综合考虑个人实际情况。'}
          </p>
        </div>
      </div>
    </section>
  )
}
