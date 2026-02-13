"use client"

import { useState, useMemo } from "react"
import { SHICHEN_MAP } from "@/lib/bazi-engine"
import { BIRTHPLACE_DATABASE, getCitiesByProvince, type BirthplaceInfo } from "@/lib/birthplace-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type BirthFormProps = {
  onSubmit: (data: {
    year: number; month: number; day: number; hourBranch: string; gender: string;
    birthplace: { province: string; city: string; longitude: number; latitude: number }
  }) => void
  onBack: () => void
}

const YEARS = Array.from({ length: 80 }, (_, i) => 2010 - i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月']
const CHINESE_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十', '三十一',
]

export function BirthForm({ onSubmit, onBack }: BirthFormProps) {
  const [step, setStep] = useState(0)
  const [gender, setGender] = useState("")
  const [province, setProvince] = useState("")
  const [city, setCity] = useState("")
  const [year, setYear] = useState<number | null>(null)
  const [month, setMonth] = useState<number | null>(null)
  const [day, setDay] = useState<number | null>(null)
  const [hourBranch, setHourBranch] = useState("")

  const days = year && month ? Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1) : []

  const cityList = useMemo(() => province ? getCitiesByProvince(province) : [], [province])
  const selectedBirthplace = useMemo<BirthplaceInfo | undefined>(
    () => cityList.find(c => c.name === city), [cityList, city]
  )

  const canProceed = () => {
    switch (step) {
      case 0: return !!gender
      case 1: return !!province && !!city && !!selectedBirthplace
      case 2: return year !== null
      case 3: return month !== null
      case 4: return day !== null
      case 5: return !!hourBranch
      default: return false
    }
  }

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1)
    } else if (year && month && day && hourBranch && gender && selectedBirthplace) {
      onSubmit({
        year, month, day, hourBranch, gender,
        birthplace: {
          province: selectedBirthplace.province,
          city: selectedBirthplace.name,
          longitude: selectedBirthplace.longitude,
          latitude: selectedBirthplace.latitude,
        },
      })
    }
  }

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1)
    } else {
      onBack()
    }
  }

  const stepLabels = ['性别', '出生地', '出生年', '出生月', '出生日', '出生时辰']
  const stepDescriptions = [
    '乾为阳，坤为阴。阴阳不同，命理各异。',
    '出生地经度决定真太阳时，影响时柱准确性。',
    '天干地支纪年，岁星周转，定您的年柱。',
    '月令为提纲，以节气分界，定命之根基。',
    '日柱为己身，天干为日主，是命理核心。',
    '时辰定格局，经真太阳时校正后定时柱。',
  ]

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-1.5 md:gap-3 mb-12 overflow-x-auto px-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
            <div className={`flex items-center gap-1 md:gap-2 transition-all duration-500 ${
              i === step ? 'opacity-100' : i < step ? 'opacity-60' : 'opacity-30'
            }`}>
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs border transition-all duration-500 ${
                i === step
                  ? 'border-primary bg-primary/10 text-primary'
                  : i < step
                    ? 'border-primary/40 bg-primary/5 text-primary/60'
                    : 'border-border text-muted-foreground'
              }`}>
                {i < step ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="text-[10px] md:text-xs">{i + 1}</span>
                )}
              </div>
              <span className="hidden lg:inline text-xs font-sans">{label}</span>
            </div>
            {i < stepLabels.length - 1 && (
              <div className={`w-3 md:w-8 lg:w-12 h-px transition-all duration-500 ${
                i < step ? 'bg-primary/40' : 'bg-border'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Form content */}
      <div className="w-full max-w-lg">
        <div className="text-center mb-10 animate-fade-in-up" key={step}>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-3">
            {stepLabels[step]}
          </h2>
          <p className="text-sm text-muted-foreground font-sans font-medium leading-relaxed">
            {stepDescriptions[step]}
          </p>
        </div>

        <div className="animate-fade-in-up" key={`form-${step}`}>
          {/* Step 0: Gender */}
          {step === 0 && (
            <div className="flex justify-center gap-6">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`w-36 h-44 flex flex-col items-center justify-center gap-3 border transition-all duration-500 ${
                  gender === 'male'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-4xl font-serif font-bold">{'乾'}</span>
                <span className="text-sm font-sans font-semibold">{'男'}</span>
                <span className="text-xs text-muted-foreground font-medium">{'阳刚之气'}</span>
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`w-36 h-44 flex flex-col items-center justify-center gap-3 border transition-all duration-500 ${
                  gender === 'female'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-4xl font-serif font-bold">{'坤'}</span>
                <span className="text-sm font-sans font-semibold">{'女'}</span>
                <span className="text-xs text-muted-foreground font-medium">{'阴柔之美'}</span>
              </button>
            </div>
          )}

          {/* Step 1: Birthplace */}
          {step === 1 && (
            <div className="max-w-sm mx-auto flex flex-col gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-sans font-medium mb-2 ml-1">{'省 / 直辖市 / 自治区'}</p>
                <Select value={province} onValueChange={(v) => { setProvince(v); setCity('') }}>
                  <SelectTrigger className="h-14 text-lg border-border bg-card text-foreground font-serif">
                    <SelectValue placeholder="请选择省/直辖市" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 bg-card border-border">
                    {BIRTHPLACE_DATABASE.map(g => (
                      <SelectItem key={g.province} value={g.province} className="text-foreground font-sans">
                        {g.province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {province && (
                <div>
                  <p className="text-xs text-muted-foreground font-sans font-medium mb-2 ml-1">{'市 / 县 / 区'}</p>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger className="h-14 text-lg border-border bg-card text-foreground font-serif">
                      <SelectValue placeholder="请选择市/县/区" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72 bg-card border-border">
                      {cityList.map(c => (
                        <SelectItem key={c.name} value={c.name} className="text-foreground font-sans">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedBirthplace && (
                <div className="text-center mt-2 py-3 border border-dashed border-primary/20 bg-primary/5">
                  <p className="text-sm text-foreground font-serif font-semibold mb-1">
                    {selectedBirthplace.province}{' '}{selectedBirthplace.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-sans">
                    {'东经 '}{selectedBirthplace.longitude.toFixed(2)}{'°'}
                    {' / '}
                    {'北纬 '}{selectedBirthplace.latitude.toFixed(2)}{'°'}
                  </p>
                  <p className="text-[10px] text-primary/50 font-sans mt-1">
                    {'此经度将用于真太阳时校正，确保时柱精准'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Year */}
          {step === 2 && (
            <div className="max-w-xs mx-auto">
              <Select value={year?.toString() || ""} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="h-14 text-lg border-border bg-card text-foreground font-serif">
                  <SelectValue placeholder="请选择出生年份" />
                </SelectTrigger>
                <SelectContent className="max-h-64 bg-card border-border">
                  {YEARS.map(y => (
                    <SelectItem key={y} value={y.toString()} className="text-foreground font-sans">
                      {y}{'年'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {year && (
                <p className="mt-4 text-center text-sm text-primary/60 font-sans">
                  {'农历'}{year}{'年'}
                </p>
              )}
            </div>
          )}

          {/* Step 3: Month */}
          {step === 3 && (
            <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
              {MONTHS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonth(m)}
                  className={`h-14 flex flex-col items-center justify-center border transition-all duration-300 ${
                    month === m
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="text-sm font-serif font-semibold">{LUNAR_MONTHS[m - 1]}</span>
                  <span className="text-[10px] text-muted-foreground">{m}{'月'}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Day */}
          {step === 4 && (
            <div className="grid grid-cols-5 md:grid-cols-7 gap-2 max-w-md mx-auto">
              {days.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDay(d)}
                  className={`h-12 flex flex-col items-center justify-center border transition-all duration-300 text-xs ${
                    day === d
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="font-serif">{CHINESE_DAYS[d - 1]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 5: Hour (Shichen) */}
          {step === 5 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-md mx-auto">
              {SHICHEN_MAP.map(sc => (
                <button
                  key={sc.branch}
                  type="button"
                  onClick={() => setHourBranch(sc.branch)}
                  className={`h-20 flex flex-col items-center justify-center gap-1 border transition-all duration-300 ${
                    hourBranch === sc.branch
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="text-base font-serif font-semibold">{sc.label}</span>
                  <span className="text-[10px] text-muted-foreground">{sc.hours}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-12 max-w-md mx-auto">
          <button
            type="button"
            onClick={handlePrev}
            className="px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:border-primary/30 transition-all duration-300 font-sans"
          >
            {'返回'}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-8 py-3 text-sm font-semibold border transition-all duration-300 font-sans ${
              canProceed()
                ? 'border-primary text-primary hover:bg-primary/10'
                : 'border-border text-muted-foreground/40 cursor-not-allowed'
            }`}
          >
            {step === 5 ? '开始解命' : '下一步'}
          </button>
        </div>
      </div>
    </section>
  )
}
