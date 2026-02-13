// ============================================================
// 紫微斗数正规安星法引擎
// 综合三合派基础安星、飞星四化、钦天四化、河洛紫微
// 参考《紫微斗数全书》《果老星宗》《飞星紫微斗数》
// ============================================================

import { HEAVENLY_STEMS, EARTHLY_BRANCHES, type ZiweiStar, type SiHua } from './bazi-engine'

const PALACES = [
  '命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫',
  '迁移宫', '交友宫', '事业宫', '田宅宫', '福德宫', '父母宫',
] as const

// 宫位地支排列（从寅宫起，逆时针排列十二宫）
// 十二宫固定在十二地支上: 子丑寅卯辰巳午未申酉戌亥
// 标准排列: 命宫在某个地支位, 然后逆时针排其余宫位
const BRANCH_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// ============================================================
// Step 1: 定命宫地支
// 公式: 从寅宫起正月(1月)顺数至生月停, 再从该宫起子时逆数至生时
// ============================================================
function getLifePalaceBranchIndex(month: number, hourBranchIndex: number): number {
  // 从寅(index=2)起正月顺数: 正月=寅, 二月=卯, 三月=辰...
  const monthPosition = (2 + month - 1) % 12
  // 从该宫起子时(0)逆数到生时
  // 逆数: 子=0步, 丑=退1步, 寅=退2步...
  const lifePalaceIdx = ((monthPosition - hourBranchIndex) % 12 + 12) % 12
  return lifePalaceIdx
}

// ============================================================
// Step 2: 定身宫地支
// 从寅宫起正月顺数至生月, 再从该宫起子时顺数至生时
// ============================================================
function getBodyPalaceBranchIndex(month: number, hourBranchIndex: number): number {
  const monthPosition = (2 + month - 1) % 12
  const bodyPalaceIdx = (monthPosition + hourBranchIndex) % 12
  return bodyPalaceIdx
}

// ============================================================
// Step 3: 定命宫天干（根据年干和命宫地支推算）
// 年干起月法（五虎遁）: 甲己之年丙作首...
// ============================================================
function getLifePalaceStem(yearStemIndex: number, lifePalaceBranchIndex: number): number {
  // 五虎遁元: 年干对应寅月(正月)的天干起始
  const yinMonthStemStart = [2, 4, 6, 8, 0][yearStemIndex % 5] // 丙寅、戊寅、庚寅、壬寅、甲寅
  // 命宫地支相对于寅(index=2)的偏移
  const offset = ((lifePalaceBranchIndex - 2) % 12 + 12) % 12
  return (yinMonthStemStart + offset) % 10
}

// ============================================================
// Step 4: 定五行局
// 根据命宫天干地支的纳音五行确定五行局
// 水二局、木三局、金四局、土五局、火六局
// ============================================================
const NAYIN_ELEMENT_TABLE: Record<string, string> = {
  '甲子': '金', '乙丑': '金', '丙寅': '火', '丁卯': '火', '戊辰': '木', '己巳': '木',
  '庚午': '土', '辛未': '土', '壬申': '金', '癸酉': '金', '甲戌': '火', '乙亥': '火',
  '丙子': '水', '丁丑': '水', '戊寅': '土', '己卯': '土', '庚辰': '金', '辛巳': '金',
  '壬午': '木', '癸未': '木', '甲申': '水', '乙酉': '水', '丙戌': '土', '丁亥': '土',
  '戊子': '火', '己丑': '火', '庚寅': '木', '辛卯': '木', '壬辰': '水', '癸巳': '水',
  '甲午': '金', '乙未': '金', '丙申': '火', '丁酉': '火', '戊戌': '木', '己亥': '木',
  '庚子': '土', '辛丑': '土', '壬寅': '金', '癸卯': '金', '甲辰': '火', '乙巳': '火',
  '丙午': '水', '丁未': '水', '戊申': '土', '己酉': '土', '庚戌': '金', '辛亥': '金',
  '壬子': '木', '癸丑': '木', '甲寅': '水', '乙卯': '水', '丙辰': '土', '丁巳': '土',
  '戊午': '火', '己未': '火', '庚申': '木', '辛酉': '木', '壬戌': '水', '癸亥': '水',
}

const ELEMENT_TO_BUREAU: Record<string, number> = {
  '水': 2, '木': 3, '金': 4, '土': 5, '火': 6,
}

function getFiveElementBureau(lifePalaceStemIdx: number, lifePalaceBranchIdx: number): { bureau: number; element: string } {
  const stem = HEAVENLY_STEMS[lifePalaceStemIdx]
  const branch = BRANCH_NAMES[lifePalaceBranchIdx]
  const nayinElement = NAYIN_ELEMENT_TABLE[stem + branch] || '土'
  const bureau = ELEMENT_TO_BUREAU[nayinElement] || 5
  return { bureau, element: nayinElement }
}

// ============================================================
// Step 5: 定紫微星位置
// 用五行局数和出生日来计算
// 公式: 找到最小的N使得 局数×N >= 日数
// 然后根据奇偶调整
// ============================================================
function getZiweiPosition(bureau: number, day: number): number {
  // 商 = ceil(day / bureau)
  let quotient = Math.ceil(day / bureau)
  const remainder = day % bureau

  // 奇偶调整规则（传统安紫微法）
  // 如果余数为0，紫微直接在商数位
  // 如果余数为奇数，紫微在商数+余数位
  // 如果余数为偶数，紫微在商数-余数+bureau位
  let position: number
  if (remainder === 0) {
    position = quotient
  } else if (remainder % 2 === 1) {
    // 奇数余数：前进
    position = quotient + remainder
  } else {
    // 偶数余数：后退再前进
    position = quotient - remainder + bureau
  }

  // 从寅宫(index=2)开始数position步
  // position=1在寅(2), position=2在卯(3)...
  const branchIdx = (2 + position - 1) % 12
  return branchIdx
}

// ============================================================
// Step 6: 排紫微系六星和天府系八星
// ============================================================

// 紫微系六星排列: 紫微、天机、(空)、太阳、武曲、天同、(空空)、廉贞
// 从紫微位置逆时针排列
const ZIWEI_SERIES_OFFSETS: { name: string; offset: number }[] = [
  { name: '紫微', offset: 0 },
  { name: '天机', offset: -1 },
  // 空一格
  { name: '太阳', offset: -3 },
  { name: '武曲', offset: -4 },
  { name: '天同', offset: -5 },
  // 空两格
  { name: '廉贞', offset: -8 },
]

// 天府系八星排列: 天府与紫微关于寅-申轴对称
// 然后从天府位置顺时针排列
const TIANFU_SERIES_NAMES = ['天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军']

function getTianfuPosition(ziweiPosition: number): number {
  // 天府与紫微关于寅(2)-申(8)轴线对称
  // 对称公式: tianfu = (4 - ziwei + 12) % 12
  // 或者更准确地说: 天府 = (2 + 2) - (ziwei - 2) + 2 = (4 - ziwei + 4) % 12
  // 简单的镜像: tianfu_idx = (4 - ziweiPosition % 12 + 12) % 12
  // 实际规则: 紫微在寅(2)则天府在申(8), 紫微在卯(3)则天府在未(7), etc.
  // 公式: tianfu = (2 + 8 - ziwei + 2) % 12 => (12 - ziwei + 2) % 12 不对
  // 正确: 紫微+天府 = 4 (mod 12) 即 寅+申=2+8=10? 不对
  // 查表法更安全:
  const mirror: Record<number, number> = {
    0: 4, 1: 3, 2: 2, 3: 1, 4: 0, 5: 11, 6: 10, 7: 9, 8: 8, 9: 7, 10: 6, 11: 5,
  }
  // 紫微在子(0)→天府在辰(4), 紫微在丑(1)→天府在卯(3), 紫微在寅(2)→天府在寅(2)
  // 紫微在卯(3)→天府在丑(1), 紫微在辰(4)→天府在子(0), 紫微在巳(5)→天府在亥(11)
  // 紫微在午(6)→天府在戌(10), 紫微在未(7)→天府在酉(9), 紫微在申(8)→天府在申(8)
  // 紫微在酉(9)→天府在未(7), 紫微在戌(10)→天府在午(6), 紫微在亥(11)→天府在巳(5)
  return mirror[ziweiPosition] ?? 2
}

// 主星五行属性
const STAR_ELEMENTS: Record<string, string> = {
  '紫微': '土', '天机': '木', '太阳': '火', '武曲': '金', '天同': '水', '廉贞': '火',
  '天府': '土', '太阴': '水', '贪狼': '木', '巨门': '水', '天相': '水', '天梁': '土',
  '七杀': '金', '破军': '水',
  '文昌': '金', '文曲': '水', '左辅': '土', '右弼': '水',
  '天魁': '火', '天钺': '火', '擎羊': '金', '陀罗': '金', '火星': '火', '铃星': '火',
}

// 星曜庙旺利陷表（简化版，按地支位置）
// 0=陷, 1=不, 2=平, 3=利, 4=得, 5=旺, 6=庙
const BRIGHTNESS_TABLE: Record<string, number[]> = {
  // 子丑寅卯辰巳午未申酉戌亥
  '紫微': [5, 6, 3, 2, 4, 5, 6, 3, 2, 4, 5, 6],
  '天机': [4, 2, 6, 5, 3, 1, 4, 2, 6, 5, 3, 1],
  '太阳': [0, 1, 3, 6, 5, 6, 5, 4, 3, 2, 1, 0],
  '武曲': [5, 4, 3, 2, 6, 5, 4, 3, 2, 6, 5, 4],
  '天同': [6, 1, 2, 3, 0, 1, 2, 5, 6, 1, 2, 3],
  '廉贞': [3, 4, 2, 1, 3, 6, 5, 4, 2, 1, 3, 6],
  '天府': [5, 6, 4, 3, 2, 5, 6, 4, 3, 2, 5, 6],
  '太阴': [6, 5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5],
  '贪狼': [4, 5, 6, 3, 2, 1, 5, 6, 4, 3, 2, 1],
  '巨门': [5, 4, 6, 3, 2, 1, 5, 4, 6, 3, 2, 1],
  '天相': [5, 4, 3, 6, 2, 5, 4, 3, 6, 2, 5, 4],
  '天梁': [6, 3, 4, 5, 2, 6, 3, 4, 5, 2, 6, 3],
  '七杀': [5, 2, 6, 3, 4, 5, 2, 6, 3, 4, 5, 2],
  '破军': [2, 3, 4, 6, 5, 2, 3, 4, 6, 5, 2, 3],
}

const BRIGHTNESS_NAMES = ['陷', '不', '平', '利', '得', '旺', '庙']

function getStarBrightness(starName: string, branchIndex: number): string {
  const table = BRIGHTNESS_TABLE[starName]
  if (!table) return '平'
  const level = table[branchIndex] ?? 2
  return BRIGHTNESS_NAMES[level] || '平'
}

// 主星含义
const STAR_MEANINGS: Record<string, string> = {
  '紫微': '帝王之星，尊贵权威，领导力强，具统御气质',
  '天机': '智慧之星，聪明灵活，善于谋划，机变过人',
  '太阳': '光明之星，热情大方，乐于助人，博爱仁慈',
  '武曲': '财星将星，务实稳重，理财能力强，刚毅果断',
  '天同': '福星，温和善良，追求安逸，性情温厚',
  '廉贞': '桃花星，聪明好学，感情丰富，善于交际',
  '天府': '令星，稳重大方，善于储蓄，气度恢宏',
  '太阴': '月亮之星，温柔细腻，艺术天赋，内敛含蓄',
  '贪狼': '欲望之星，多才多艺，社交能力强，灵活善变',
  '巨门': '暗星，口才好，分析能力强，善于研究',
  '天相': '印星，公正无私，善于调和，文雅端庄',
  '天梁': '荫星，正直善良，乐善好施，长者风范',
  '七杀': '将星，勇敢果断，开创力强，气魄雄壮',
  '破军': '耗星，变革创新，不安现状，破旧立新',
}

// ============================================================
// 辅星安星法
// ============================================================

// 文昌: 以出生时辰起, 甲→巳, 逆时针
function getWenchangPosition(hourBranchIndex: number): number {
  // 文昌安星: 从巳起甲时逆行
  // 子时文昌在巳(5), 丑时在辰(4), 寅时在卯(3)...
  return ((5 - hourBranchIndex) % 12 + 12) % 12
}

// 文曲: 以出生时辰起, 甲→酉, 顺时针
function getWenquPosition(hourBranchIndex: number): number {
  // 文曲安星: 从酉起甲时顺行
  return (9 + hourBranchIndex) % 12
}

// 左辅: 以出生月份起
function getZuofuPosition(month: number): number {
  // 正月在辰(4), 逐月顺行
  return (4 + month - 1) % 12
}

// 右弼: 以出生月份起
function getYoubiPosition(month: number): number {
  // 正月在戌(10), 逐月逆行
  return ((10 - month + 1) % 12 + 12) % 12
}

// 天魁天钺: 以年干起
const TIANKUI_TABLE: Record<number, number> = {
  0: 1, 1: 0, 2: 11, 3: 9, 4: 1, 5: 0, 6: 1, 7: 2, 8: 3, 9: 3, // 甲~癸对应地支
}
const TIANYUE_TABLE: Record<number, number> = {
  0: 7, 1: 8, 2: 9, 3: 11, 4: 7, 5: 8, 6: 7, 7: 6, 8: 5, 9: 5,
}

// 擎羊陀罗: 以年干起
const QINGYANG_TABLE: Record<number, number> = {
  0: 4, 1: 5, 2: 7, 3: 8, 4: 7, 5: 8, 6: 10, 7: 11, 8: 1, 9: 2,
}
const TUOLUO_TABLE: Record<number, number> = {
  0: 2, 1: 3, 2: 5, 3: 6, 4: 5, 5: 6, 6: 8, 7: 9, 8: 11, 9: 0,
}

// 火星铃星简化: 以年支三合+时支起
function getFireStarPosition(yearBranchIndex: number, hourBranchIndex: number): number {
  // 寅午戌年: 丑起子时顺行
  // 申子辰年: 寅起子时顺行
  // 巳酉丑年: 卯起子时顺行
  // 亥卯未年: 酉起子时顺行
  const tripleGroup = yearBranchIndex % 4
  const basePositions = [1, 2, 3, 9] // 丑寅卯酉
  const base = basePositions[tripleGroup] ?? 1
  return (base + hourBranchIndex) % 12
}

function getBellStarPosition(yearBranchIndex: number, hourBranchIndex: number): number {
  // 铃星与火星类似但起点不同
  const tripleGroup = yearBranchIndex % 4
  const basePositions = [3, 10, 10, 3] // 卯戌戌卯
  const base = basePositions[tripleGroup] ?? 3
  return (base + hourBranchIndex) % 12
}

// ============================================================
// 四化飞星（年干四化 + 宫干飞星）
// ============================================================
const SIHUA_TABLE: Record<number, { lu: string; quan: string; ke: string; ji: string }> = {
  0: { lu: '廉贞', quan: '破军', ke: '武曲', ji: '太阳' },  // 甲
  1: { lu: '天机', quan: '天梁', ke: '紫微', ji: '太阴' },  // 乙
  2: { lu: '天同', quan: '天机', ke: '文昌', ji: '廉贞' },  // 丙
  3: { lu: '太阴', quan: '天同', ke: '天机', ji: '巨门' },  // 丁
  4: { lu: '贪狼', quan: '太阴', ke: '右弼', ji: '天机' },  // 戊
  5: { lu: '武曲', quan: '贪狼', ke: '天梁', ji: '文曲' },  // 己
  6: { lu: '太阳', quan: '武曲', ke: '太阴', ji: '天同' },  // 庚
  7: { lu: '巨门', quan: '太阳', ke: '文曲', ji: '文昌' },  // 辛
  8: { lu: '天梁', quan: '紫微', ke: '左辅', ji: '武曲' },  // 壬
  9: { lu: '破军', quan: '巨门', ke: '太阴', ji: '贪狼' },  // 癸
}

// ============================================================
// 主函数: 正规紫微斗数排盘
// ============================================================
export function calculateZiweiProper(
  year: number,
  month: number,  // 命理月份（1-12，已经过节气校正）
  day: number,
  hourBranch: string
) {
  const yearStemIndex = (year - 4) % 10
  const yearBranchIndex = (year - 4) % 12
  const hourBranchIndex = EARTHLY_BRANCHES.indexOf(hourBranch as typeof EARTHLY_BRANCHES[number])

  // Step 1: 定命宫地支
  const lifePalaceBranchIdx = getLifePalaceBranchIndex(month, hourBranchIndex)

  // Step 2: 定身宫地支
  const bodyPalaceBranchIdx = getBodyPalaceBranchIndex(month, hourBranchIndex)

  // Step 3: 定命宫天干
  const lifePalaceStemIdx = getLifePalaceStem(yearStemIndex, lifePalaceBranchIdx)

  // Step 4: 定五行局
  const { bureau, element: bureauElement } = getFiveElementBureau(lifePalaceStemIdx, lifePalaceBranchIdx)

  // Step 5: 定紫微星位置
  const ziweiPosition = getZiweiPosition(bureau, day)

  // Step 6: 排紫微系六星
  const mainStarPlacements: { name: string; branchIndex: number }[] = []
  for (const star of ZIWEI_SERIES_OFFSETS) {
    const branchIdx = ((ziweiPosition + star.offset) % 12 + 12) % 12
    mainStarPlacements.push({ name: star.name, branchIndex: branchIdx })
  }

  // Step 7: 排天府系八星
  const tianfuPosition = getTianfuPosition(ziweiPosition)
  for (let i = 0; i < TIANFU_SERIES_NAMES.length; i++) {
    const branchIdx = (tianfuPosition + i) % 12
    mainStarPlacements.push({ name: TIANFU_SERIES_NAMES[i], branchIndex: branchIdx })
  }

  // 建立十二宫 - 命宫在lifePalaceBranchIdx, 然后逆时针排列
  // 命宫→兄弟→夫妻→...
  const palaceMap: { palace: string; branchIndex: number; branchName: string; stemIndex: number }[] = []
  for (let i = 0; i < 12; i++) {
    const branchIdx = ((lifePalaceBranchIdx - i) % 12 + 12) % 12
    const stemIdx = getLifePalaceStem(yearStemIndex, branchIdx)
    palaceMap.push({
      palace: PALACES[i],
      branchIndex: branchIdx,
      branchName: BRANCH_NAMES[branchIdx],
      stemIndex: stemIdx,
    })
  }

  // 将主星分配到宫位
  type PalaceAssignment = {
    palace: string
    star: string
    element: string
    brightness: string
    category: string
    meaning: string
    branchName: string
  }

  const palaceAssignments: PalaceAssignment[] = palaceMap.map(pm => {
    // 找到落在此地支的主星
    const starsHere = mainStarPlacements.filter(s => s.branchIndex === pm.branchIndex)
    const mainStar = starsHere[0]
    const starName = mainStar?.name || ''
    return {
      palace: pm.palace,
      star: starName,
      element: STAR_ELEMENTS[starName] || '土',
      brightness: starName ? getStarBrightness(starName, pm.branchIndex) : '平',
      category: '主星',
      meaning: STAR_MEANINGS[starName] || '',
      branchName: pm.branchName,
    }
  })

  // 辅星安星
  const assistStarPlacements: { name: string; branchIndex: number }[] = [
    { name: '文昌', branchIndex: getWenchangPosition(hourBranchIndex) },
    { name: '文曲', branchIndex: getWenquPosition(hourBranchIndex) },
    { name: '左辅', branchIndex: getZuofuPosition(month) },
    { name: '右弼', branchIndex: getYoubiPosition(month) },
    { name: '天魁', branchIndex: TIANKUI_TABLE[yearStemIndex] ?? 1 },
    { name: '天钺', branchIndex: TIANYUE_TABLE[yearStemIndex] ?? 7 },
  ]

  // 煞星安星
  const shaStarPlacements: { name: string; branchIndex: number }[] = [
    { name: '擎羊', branchIndex: QINGYANG_TABLE[yearStemIndex] ?? 4 },
    { name: '陀罗', branchIndex: TUOLUO_TABLE[yearStemIndex] ?? 2 },
    { name: '火星', branchIndex: getFireStarPosition(yearBranchIndex, hourBranchIndex) },
    { name: '铃星', branchIndex: getBellStarPosition(yearBranchIndex, hourBranchIndex) },
  ]

  // 构建完整星曜列表
  const stars: ZiweiStar[] = []

  // 主星
  for (const pa of palaceAssignments) {
    if (pa.star) {
      stars.push({
        name: pa.star,
        palace: pa.palace,
        element: pa.element,
        meaning: pa.meaning,
        brightness: pa.brightness,
        category: '主星',
      })
    }
  }

  // 辅星
  for (const assist of assistStarPlacements) {
    const palace = palaceMap.find(pm => pm.branchIndex === assist.branchIndex)
    if (palace) {
      stars.push({
        name: assist.name,
        palace: palace.palace,
        element: STAR_ELEMENTS[assist.name] || '土',
        meaning: assist.name === '文昌' ? '文学之星，利考试科举' :
                 assist.name === '文曲' ? '才艺之星，利文艺创作' :
                 assist.name === '左辅' ? '助力之星，善于辅佐协助' :
                 assist.name === '右弼' ? '助力之星，柔和圆融' :
                 assist.name === '天魁' ? '阳贵人星，贵人扶持' :
                 '阴贵人星，贵人扶持',
        brightness: getStarBrightness(assist.name, assist.branchIndex),
        category: '辅星',
      })
    }
  }

  // 煞星
  for (const sha of shaStarPlacements) {
    const palace = palaceMap.find(pm => pm.branchIndex === sha.branchIndex)
    if (palace) {
      stars.push({
        name: sha.name,
        palace: palace.palace,
        element: STAR_ELEMENTS[sha.name] || '金',
        meaning: sha.name === '擎羊' ? '煞星，性急刚烈，主刑伤' :
                 sha.name === '陀罗' ? '煞星，拖延犹豫，主纠缠' :
                 sha.name === '火星' ? '煞星，急躁冲动，主突发' :
                 '煞星，阴性暗火，主暗伤',
        brightness: getStarBrightness(sha.name, sha.branchIndex),
        category: '煞星',
      })
    }
  }

  // 命宫主星
  const lifePalaceMainStar = stars.find(s => s.palace === '命宫' && s.category === '主星') || stars[0]

  // 年干四化
  const yearSihua = SIHUA_TABLE[yearStemIndex]
  const siHua: SiHua[] = []
  if (yearSihua) {
    const findStarPalace = (starName: string): string => {
      const found = stars.find(s => s.name === starName)
      return found?.palace || '命宫'
    }

    siHua.push(
      { star: yearSihua.lu, transform: '化禄', palace: findStarPalace(yearSihua.lu),
        meaning: `${yearSihua.lu}化禄：主财禄丰盈，${findStarPalace(yearSihua.lu)}得财气加持。` },
      { star: yearSihua.quan, transform: '化权', palace: findStarPalace(yearSihua.quan),
        meaning: `${yearSihua.quan}化权：主权势地位，${findStarPalace(yearSihua.quan)}得权柄加持。` },
      { star: yearSihua.ke, transform: '化科', palace: findStarPalace(yearSihua.ke),
        meaning: `${yearSihua.ke}化科：主声名文采，${findStarPalace(yearSihua.ke)}得科名加持。` },
      { star: yearSihua.ji, transform: '化忌', palace: findStarPalace(yearSihua.ji),
        meaning: `${yearSihua.ji}化忌：主挫折困扰，${findStarPalace(yearSihua.ji)}需注意化解。` },
    )
  }

  // 宫干飞星四化（飞星派核心）
  const gongGanSiHua: { fromPalace: string; transform: string; toPalace: string; star: string }[] = []
  for (const pm of palaceMap.slice(0, 6)) { // 只取命宫到疾厄宫(关键六宫)
    const palaceSihua = SIHUA_TABLE[pm.stemIndex]
    if (palaceSihua) {
      const jiStar = palaceSihua.ji
      const jiPalace = stars.find(s => s.name === jiStar)?.palace
      if (jiPalace) {
        gongGanSiHua.push({
          fromPalace: pm.palace,
          transform: '化忌',
          toPalace: jiPalace,
          star: jiStar,
        })
      }
    }
  }

  // 钦天四化参考：化忌追踪
  // 生年化忌入哪宫，冲对宫
  const yearJiPalace = siHua.find(s => s.transform === '化忌')?.palace || ''
  const yearJiPalaceIdx = PALACES.indexOf(yearJiPalace as typeof PALACES[number])
  const chongPalace = yearJiPalaceIdx >= 0 ? PALACES[(yearJiPalaceIdx + 6) % 12] : ''

  const qintianNote = yearJiPalace
    ? `钦天四化：生年化忌入${yearJiPalace}，冲${chongPalace}。${yearJiPalace === '迁移宫' ? '化忌入迁移，外出需格外谨慎。' : yearJiPalace === '命宫' ? '化忌入命，一生多操劳。' : yearJiPalace === '财帛宫' ? '化忌入财帛，理财需谨慎。' : `${yearJiPalace}受冲，此方面需注意。`}`
    : ''

  // 河洛紫微参考: 命宫河图数
  const lifePalaceHetuMap: Record<number, number> = {
    0: 1, 1: 5, 2: 3, 3: 3, 4: 5, 5: 2, 6: 2, 7: 5, 8: 4, 9: 4, 10: 5, 11: 1,
  }
  const lifePalaceHetu = lifePalaceHetuMap[lifePalaceBranchIdx] ?? 5

  // 迁移宫和事业宫
  const migrationPalace = palaceAssignments.find(p => p.palace === '迁移宫')
  const migrationStars = stars.filter(s => s.palace === '迁移宫')
  const careerPalace = palaceAssignments.find(p => p.palace === '事业宫')

  return {
    mainStar: lifePalaceMainStar,
    stars,
    palaceAssignments,
    lifePalace: BRANCH_NAMES[lifePalaceBranchIdx],
    bodyPalace: BRANCH_NAMES[bodyPalaceBranchIdx],
    siHua,
    gongGanSiHua,
    qintianNote,
    migrationPalace,
    migrationStars,
    careerPalace,
    fiveElementBureau: { bureau, element: bureauElement },
    lifePalaceStem: HEAVENLY_STEMS[lifePalaceStemIdx],
    lifePalaceBranch: BRANCH_NAMES[lifePalaceBranchIdx],
    ziweiPosition: BRANCH_NAMES[ziweiPosition],
    heluNote: `命宫河图数${lifePalaceHetu}，${lifePalaceHetu <= 2 ? '先天水火之数' : lifePalaceHetu <= 4 ? '先天木金之数' : '后天土数'}。`,
  }
}
