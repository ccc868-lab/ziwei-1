"use client"

import { useState, useCallback } from "react"
import { HeroSection } from "@/components/hero-section"
import { BirthForm } from "@/components/birth-form"
import { AnalysisLoader } from "@/components/analysis-loader"
import { ResultsDisplay } from "@/components/results-display"
import { calculateBazi, calculateZiwei, recommendCities, analyzeCareer } from "@/lib/bazi-engine"
import type { BaziChart, CityRecommendation, ZiweiStar, SiHua } from "@/lib/bazi-engine"

type AppState = 'hero' | 'form' | 'loading' | 'results'

type AnalysisResult = {
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
}

export default function Page() {
  const [state, setState] = useState<AppState>('hero')
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleStart = useCallback(() => {
    setState('form')
  }, [])

  const handleFormSubmit = useCallback((data: {
    year: number
    month: number
    day: number
    hourBranch: string
    gender: string
    birthplace: { province: string; city: string; longitude: number; latitude: number }
  }) => {
    // Calculate everything with deep 国学 analysis + 出生地真太阳时校正
    const bazi = calculateBazi(
      data.year, data.month, data.day, data.hourBranch,
      data.gender, data.birthplace.longitude
    )

    // 使用节气校正后的月份和真太阳时校正后的时辰来排紫微盘
    const ziwei = calculateZiwei(
      data.year, data.month, data.day, data.hourBranch,
      undefined, undefined, undefined // let engine use its own defaults; it reads from solar-terms internally
    )

    // Re-run career analysis with ziwei career palace star for deeper insight
    const careerPalaceStar = ziwei.careerPalace
    if (careerPalaceStar) {
      bazi.career = analyzeCareer(bazi, {
        name: careerPalaceStar.star,
        element: careerPalaceStar.element,
        meaning: careerPalaceStar.meaning,
        brightness: careerPalaceStar.brightness,
      })
    }

    const cities = recommendCities(bazi, ziwei)

    setResult({
      bazi,
      ziwei,
      cities,
      gender: data.gender,
      birthInfo: { year: data.year, month: data.month, day: data.day },
    })

    setState('loading')
  }, [])

  const handleLoadingComplete = useCallback(() => {
    setState('results')
  }, [])

  const handleRestart = useCallback(() => {
    setResult(null)
    setState('hero')
  }, [])

  const handleFormBack = useCallback(() => {
    setState('hero')
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {state === 'hero' && (
        <HeroSection onStart={handleStart} />
      )}

      {state === 'form' && (
        <BirthForm onSubmit={handleFormSubmit} onBack={handleFormBack} />
      )}

      {state === 'loading' && (
        <AnalysisLoader onComplete={handleLoadingComplete} />
      )}

      {state === 'results' && result && (
        <ResultsDisplay
          bazi={result.bazi}
          ziwei={result.ziwei}
          cities={result.cities}
          gender={result.gender}
          birthInfo={result.birthInfo}
          onRestart={handleRestart}
        />
      )}
    </main>
  )
}
