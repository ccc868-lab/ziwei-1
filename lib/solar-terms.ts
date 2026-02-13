// ============================================================
// 二十四节气数据与真太阳时计算
// 参考《协纪辨方书》节气历法
// ============================================================

import { EARTHLY_BRANCHES } from './bazi-engine'

// 24节气名称（12节 + 12气，命理只用「节」来分月份）
// 节：立春、惊蛰、清明、立夏、芒种、小暑、立秋、白露、寒露、立冬、大雪、小寒
// 气：雨水、春分、谷雨、小满、夏至、大暑、处暑、秋分、霜降、小雪、冬至、大寒
const JIEQI_NAMES = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
] as const

// 命理月份以「节」为分界（每月的起始节气）
// 正月从立春开始，二月从惊蛰开始...
// index 0 = 立春(寅月/正月), 1 = 惊蛰(卯月/二月), ... 11 = 小寒(丑月/腊月)
const JIE_FOR_MONTH = [
  { jie: '立春', monthBranchIndex: 2 },   // 寅月 正月
  { jie: '惊蛰', monthBranchIndex: 3 },   // 卯月 二月
  { jie: '清明', monthBranchIndex: 4 },    // 辰月 三月
  { jie: '立夏', monthBranchIndex: 5 },    // 巳月 四月
  { jie: '芒种', monthBranchIndex: 6 },    // 午月 五月
  { jie: '小暑', monthBranchIndex: 7 },    // 未月 六月
  { jie: '立秋', monthBranchIndex: 8 },    // 申月 七月
  { jie: '白露', monthBranchIndex: 9 },    // 酉月 八月
  { jie: '寒露', monthBranchIndex: 10 },   // 戌月 九月
  { jie: '立冬', monthBranchIndex: 11 },   // 亥月 十月
  { jie: '大雪', monthBranchIndex: 0 },    // 子月 冬月
  { jie: '小寒', monthBranchIndex: 1 },    // 丑月 腊月
]

// 节气近似公历日期表（覆盖1930-2010年）
// 为简化数据量，存储的是每个节气的公历"日"（月份固定）
// 如立春一般在2月3-5日，惊蛰在3月5-7日，以此类推
// 格式：[月, 近似日] - 用通用近似值（精确到1-2天误差）
const JIE_APPROX_DATES: { name: string; month: number; day: number }[] = [
  { name: '小寒', month: 1, day: 6 },
  { name: '立春', month: 2, day: 4 },
  { name: '惊蛰', month: 3, day: 6 },
  { name: '清明', month: 4, day: 5 },
  { name: '立夏', month: 5, day: 6 },
  { name: '芒种', month: 6, day: 6 },
  { name: '小暑', month: 7, day: 7 },
  { name: '立秋', month: 8, day: 7 },
  { name: '白露', month: 9, day: 8 },
  { name: '寒露', month: 10, day: 8 },
  { name: '立冬', month: 11, day: 7 },
  { name: '大雪', month: 12, day: 7 },
]

// 年份微调：部分年份节气日期偏移（主要修正立春等关键节气）
// key = year, value = { jie_name: day_offset }
const YEAR_OFFSETS: Record<number, Record<string, number>> = {
  // 闰年和特殊年份微调
  1960: { '立春': -1 }, 1964: { '立春': -1 }, 1968: { '立春': -1 },
  1972: { '立春': -1 }, 1976: { '立春': -1 }, 1980: { '立春': -1 },
  1984: { '立春': -1 }, 1988: { '立春': -1 }, 1992: { '立春': -1 },
  1996: { '立春': -1 }, 2000: { '立春': -1 }, 2004: { '立春': -1 },
  2008: { '立春': -1 },
}

/**
 * 获取某年某个节气的公历日期
 */
function getJieDate(year: number, jieName: string): { month: number; day: number } {
  const base = JIE_APPROX_DATES.find(j => j.name === jieName)
  if (!base) return { month: 1, day: 1 }

  const offset = YEAR_OFFSETS[year]?.[jieName] || 0
  return { month: base.month, day: base.day + offset }
}

/**
 * 根据公历年月日，确定命理月份（以节气为分界）
 * 返回 { lunarMonth: 1-12, monthBranchIndex: 0-11 }
 * lunarMonth: 1=正月(寅), 2=二月(卯), ... 12=腊月(丑)
 */
export function getMonthByJieQi(year: number, month: number, day: number): {
  lunarMonth: number
  monthBranchIndex: number
  jie: string
  nextJie: string
  daysToNextJie: number
  daysToPrevJie: number
} {
  // 按从后往前的顺序检查每个节
  // 从大雪(12月) 倒推到小寒(1月), 再检查上一年大雪
  const jieList = JIE_FOR_MONTH.map((j, i) => {
    const jieDate = getJieDate(year, j.jie)
    // 小寒在1月，大雪在12月：需要处理年末跨年
    return {
      ...j,
      index: i,
      dateMonth: jieDate.month,
      dateDay: jieDate.day,
      dateObj: new Date(year, jieDate.month - 1, jieDate.day),
    }
  })

  // 也加入上一年大雪（子月开始）和本年小寒
  const targetDate = new Date(year, month - 1, day)

  // 找到当前日期属于哪个节之后
  // 从12月(大雪)开始往前找
  const allJies = [...jieList].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())

  let currentJieIdx = -1
  for (let i = 0; i < allJies.length; i++) {
    if (targetDate.getTime() >= allJies[i].dateObj.getTime()) {
      currentJieIdx = i
      break
    }
  }

  // 如果在所有节之前（如1月1日-小寒之前），用上一年大雪
  if (currentJieIdx === -1) {
    // 属于上一年的丑月（腊月）或子月（冬月）
    const prevDaxue = getJieDate(year - 1, '大雪')
    const prevXiaohan = getJieDate(year, '小寒')
    const prevTarget = new Date(year, month - 1, day)
    const daysToNext = Math.floor((new Date(year, prevXiaohan.month - 1, prevXiaohan.day).getTime() - prevTarget.getTime()) / 86400000)
    const daysToPrev = Math.floor((prevTarget.getTime() - new Date(year - 1, prevDaxue.month - 1, prevDaxue.day).getTime()) / 86400000)

    return {
      lunarMonth: 12, // 腊月(丑月)
      monthBranchIndex: 1, // 丑
      jie: '大雪',
      nextJie: '小寒',
      daysToNextJie: Math.max(daysToNext, 1),
      daysToPrevJie: Math.max(daysToPrev, 1),
    }
  }

  const currentJie = allJies[currentJieIdx]
  const nextJie = currentJieIdx > 0 ? allJies[currentJieIdx - 1] : null

  const daysToNextJie = nextJie
    ? Math.floor((nextJie.dateObj.getTime() - targetDate.getTime()) / 86400000)
    : 30

  const daysToPrevJie = Math.floor((targetDate.getTime() - currentJie.dateObj.getTime()) / 86400000)

  return {
    lunarMonth: currentJie.index + 1,
    monthBranchIndex: currentJie.monthBranchIndex,
    jie: currentJie.jie,
    nextJie: nextJie?.jie || '立春',
    daysToNextJie: Math.max(daysToNextJie, 1),
    daysToPrevJie: Math.max(daysToPrevJie, 0),
  }
}

/**
 * 真太阳时校正
 * 根据出生地经度计算真太阳时
 * 公式：真太阳时 = 北京时间 + (出生地经度 - 120) x 4 分钟
 * 
 * @param hourBranch - 原始时辰地支（北京时间）
 * @param longitude - 出生地经度
 * @returns 校正后的时辰地支和偏移分钟数
 */
export function adjustForTrueSolarTime(
  hourBranch: string,
  longitude: number
): { adjustedBranch: string; offsetMinutes: number; note: string } {
  const offsetMinutes = Math.round((longitude - 120) * 4)

  // 每个时辰2小时(120分钟)
  // 子时 23:00-01:00 中点 00:00
  // 丑时 01:00-03:00 中点 02:00
  // ...
  const branchIndex = EARTHLY_BRANCHES.indexOf(hourBranch as typeof EARTHLY_BRANCHES[number])
  if (branchIndex === -1) return { adjustedBranch: hourBranch, offsetMinutes: 0, note: '未知时辰' }

  // 时辰中点时间(分钟从0:00算起)
  // 子时中点=0, 丑时中点=120, 寅时中点=240, ...
  const branchMidpoints = [0, 120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320]
  const midpoint = branchMidpoints[branchIndex]

  // 加上偏移
  let adjustedMidpoint = midpoint + offsetMinutes

  // 标准化到0-1440范围
  adjustedMidpoint = ((adjustedMidpoint % 1440) + 1440) % 1440

  // 找到对应的时辰
  // 子时: 23:00(1380)-01:00(60) 即 1380-1440 和 0-60
  // 丑时: 01:00(60)-03:00(180)
  // ...
  let newBranchIndex: number
  if (adjustedMidpoint >= 1380 || adjustedMidpoint < 60) {
    newBranchIndex = 0 // 子时
  } else {
    newBranchIndex = Math.floor((adjustedMidpoint - 60) / 120) + 1
    if (newBranchIndex >= 12) newBranchIndex = 0
  }

  const adjustedBranch = EARTHLY_BRANCHES[newBranchIndex]
  const changed = adjustedBranch !== hourBranch

  let note = ''
  if (Math.abs(offsetMinutes) < 5) {
    note = '出生地接近东经120度（北京时间基准），时辰无需校正。'
  } else if (changed) {
    note = `出生地经度${longitude.toFixed(1)}度，真太阳时${offsetMinutes > 0 ? '快' : '慢'}${Math.abs(offsetMinutes)}分钟，时辰由${hourBranch}时校正为${adjustedBranch}时。`
  } else {
    note = `出生地经度${longitude.toFixed(1)}度，真太阳时偏差${Math.abs(offsetMinutes)}分钟，未跨时辰边界，维持${hourBranch}时。`
  }

  return { adjustedBranch, offsetMinutes, note }
}

/**
 * 计算大运起运岁数
 * 阳男阴女：从出生日顺数到下一个节气天数 / 3
 * 阴男阳女：从出生日逆数到上一个节气天数 / 3
 * 余1天按4个月，余2天按8个月
 */
export function calculateDaYunStartAge(
  isForward: boolean,
  daysToNextJie: number,
  daysToPrevJie: number
): { startAge: number; startMonths: number; desc: string } {
  const days = isForward ? daysToNextJie : daysToPrevJie
  const years = Math.floor(days / 3)
  const remainder = days % 3
  const months = remainder * 4 // 余1天=4个月, 余2天=8个月

  const startAge = Math.max(years, 1)
  const desc = isForward
    ? `顺数至下一节气${daysToNextJie}天，÷3=${years}岁余${remainder}天（${months}个月），${startAge}岁${months > 0 ? months + '个月' : ''}起运。`
    : `逆数至上一节气${daysToPrevJie}天，÷3=${years}岁余${remainder}天（${months}个月），${startAge}岁${months > 0 ? months + '个月' : ''}起运。`

  return { startAge, startMonths: months, desc }
}

export { JIEQI_NAMES, JIE_FOR_MONTH }
