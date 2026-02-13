import React from "react"
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google'

import './globals.css'

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-noto-sans-sc',
  weight: ['400', '500', '600', '700'],
})

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  variable: '--font-noto-serif-sc',
  weight: ['500', '600', '700', '900'],
})

export const metadata: Metadata = {
  title: '天命择城 - 紫微斗数 / 生辰八字 / 城市推荐 / 职业分析',
  description: '融合紫微斗数、生辰八字、十神格局、纳音五行、大运流年等国学智慧，分析最适合的居住城市与职业方向。参考穷通宝鉴、三命通会、滴天髓、子平真诠等经典。',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${notoSansSC.variable} ${notoSerifSC.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
