// ============================================================
// 天命择城 - 深度国学命理引擎
// 融合八字命理、紫微斗数、纳音五行、十神、神煞、大运、四化
// 参考《穷通宝鉴》《三命通会》《滴天髓》《渊海子平》《子平真诠》
// ============================================================

import { getMonthByJieQi, adjustForTrueSolarTime, calculateDaYunStartAge } from './solar-terms'
import { calculateZiweiProper } from './ziwei-engine'

// 天干 (Heavenly Stems)
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const
// 地支 (Earthly Branches)
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const
// 五行 (Five Elements)
export const FIVE_ELEMENTS = ['金', '木', '水', '火', '土'] as const
// 生肖 (Chinese Zodiac)
export const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'] as const

// 天干五行对应
const STEM_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土',
  '庚': '金', '辛': '金', '壬': '水', '癸': '水',
}

// 天干阴阳
const STEM_YINYANG: Record<string, string> = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
  '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴',
}

// 地支五行对应
const BRANCH_ELEMENT: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
}

// 地支藏干 (Hidden Stems in Branches)
const BRANCH_HIDDEN_STEMS: Record<string, string[]> = {
  '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'],
  '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
  '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲'],
}

// 时辰对照
export const SHICHEN_MAP: { label: string; branch: string; hours: string }[] = [
  { label: '子时', branch: '子', hours: '23:00-01:00' },
  { label: '丑时', branch: '丑', hours: '01:00-03:00' },
  { label: '寅时', branch: '寅', hours: '03:00-05:00' },
  { label: '卯时', branch: '卯', hours: '05:00-07:00' },
  { label: '辰时', branch: '辰', hours: '07:00-09:00' },
  { label: '巳时', branch: '巳', hours: '09:00-11:00' },
  { label: '午时', branch: '午', hours: '11:00-13:00' },
  { label: '未时', branch: '未', hours: '13:00-15:00' },
  { label: '申时', branch: '申', hours: '15:00-17:00' },
  { label: '酉时', branch: '酉', hours: '17:00-19:00' },
  { label: '戌时', branch: '戌', hours: '19:00-21:00' },
  { label: '亥时', branch: '亥', hours: '21:00-23:00' },
]

// ============================================================
// 纳音五行 (Nayin Five Elements) - 六十甲子纳音
// ============================================================
const NAYIN_TABLE: Record<string, { nayin: string; element: string }> = {
  '甲子': { nayin: '海中金', element: '金' }, '乙丑': { nayin: '海中金', element: '金' },
  '丙寅': { nayin: '炉中火', element: '火' }, '丁卯': { nayin: '炉中火', element: '火' },
  '戊辰': { nayin: '大林木', element: '木' }, '己巳': { nayin: '大林木', element: '木' },
  '庚午': { nayin: '路旁土', element: '土' }, '辛未': { nayin: '路旁土', element: '土' },
  '壬申': { nayin: '剑锋金', element: '金' }, '癸酉': { nayin: '剑锋金', element: '金' },
  '甲戌': { nayin: '山头火', element: '火' }, '乙亥': { nayin: '山头火', element: '火' },
  '丙子': { nayin: '涧下水', element: '水' }, '丁丑': { nayin: '涧下水', element: '水' },
  '戊寅': { nayin: '城头土', element: '土' }, '己卯': { nayin: '城头土', element: '土' },
  '庚辰': { nayin: '白蜡金', element: '金' }, '辛巳': { nayin: '白蜡金', element: '金' },
  '壬午': { nayin: '杨柳木', element: '木' }, '癸未': { nayin: '杨柳木', element: '木' },
  '甲申': { nayin: '泉中水', element: '水' }, '乙酉': { nayin: '泉中水', element: '水' },
  '丙戌': { nayin: '屋上土', element: '土' }, '丁亥': { nayin: '屋上土', element: '土' },
  '戊子': { nayin: '霹雳火', element: '火' }, '己丑': { nayin: '霹雳火', element: '火' },
  '庚寅': { nayin: '松柏木', element: '木' }, '辛卯': { nayin: '松柏木', element: '木' },
  '壬辰': { nayin: '长流水', element: '水' }, '癸巳': { nayin: '长流水', element: '水' },
  '甲午': { nayin: '沙中金', element: '金' }, '乙未': { nayin: '沙中金', element: '金' },
  '丙申': { nayin: '山下火', element: '火' }, '丁酉': { nayin: '山下火', element: '火' },
  '戊戌': { nayin: '平地木', element: '木' }, '己亥': { nayin: '平地木', element: '木' },
  '庚子': { nayin: '壁上土', element: '土' }, '辛丑': { nayin: '壁上土', element: '土' },
  '壬寅': { nayin: '金箔金', element: '金' }, '癸卯': { nayin: '金箔金', element: '金' },
  '甲辰': { nayin: '覆灯火', element: '火' }, '乙巳': { nayin: '覆灯火', element: '火' },
  '丙午': { nayin: '天河水', element: '水' }, '丁未': { nayin: '天河水', element: '水' },
  '戊申': { nayin: '大驿土', element: '土' }, '己酉': { nayin: '大驿土', element: '土' },
  '庚戌': { nayin: '钗钏金', element: '金' }, '辛亥': { nayin: '钗钏金', element: '金' },
  '壬子': { nayin: '桑柘木', element: '木' }, '癸丑': { nayin: '桑柘木', element: '木' },
  '甲寅': { nayin: '大溪水', element: '水' }, '乙卯': { nayin: '大溪水', element: '水' },
  '丙辰': { nayin: '沙中土', element: '土' }, '丁巳': { nayin: '沙中土', element: '土' },
  '戊午': { nayin: '天上火', element: '火' }, '己未': { nayin: '天上火', element: '火' },
  '庚申': { nayin: '石榴木', element: '木' }, '辛酉': { nayin: '石榴木', element: '木' },
  '壬戌': { nayin: '大海水', element: '水' }, '癸亥': { nayin: '大海水', element: '水' },
}

function getNayin(stem: string, branch: string): { nayin: string; element: string } {
  return NAYIN_TABLE[stem + branch] || { nayin: '未知', element: '土' }
}

// ============================================================
// 十神 (Ten Gods) - 命理核心概念
// ============================================================
const TEN_GODS_MAP: Record<string, Record<string, string>> = {
  '甲': { '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '偏财', '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印' },
  '乙': { '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '正财', '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印' },
  '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财', '戊': '食神', '己': '伤官', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官' },
  '丁': { '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩', '戊': '伤官', '己': '食神', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀' },
  '戊': { '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '偏财', '癸': '正财' },
  '己': { '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '正财', '癸': '偏财' },
  '庚': { '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫财', '壬': '食神', '癸': '伤官' },
  '辛': { '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印', '己': '偏印', '庚': '劫财', '辛': '比肩', '壬': '伤官', '癸': '食神' },
  '壬': { '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财', '戊': '七杀', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫财' },
  '癸': { '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财', '戊': '正官', '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '劫财', '癸': '比肩' },
}

function getTenGod(dayMaster: string, targetStem: string): string {
  return TEN_GODS_MAP[dayMaster]?.[targetStem] || '未知'
}

// 十神含义
const TEN_GOD_MEANINGS: Record<string, { keyword: string; desc: string }> = {
  '比肩': { keyword: '独立自主', desc: '自我意识强，独立果断，善于竞争' },
  '劫财': { keyword: '豪爽大方', desc: '交友广泛，慷慨仗义，但需防破财' },
  '食神': { keyword: '才华横溢', desc: '温和聪慧，富有艺术天赋，生活品味高' },
  '伤官': { keyword: '聪明叛逆', desc: '才气纵横，思维独特，不拘一格' },
  '偏财': { keyword: '商业头脑', desc: '善于理财投资，社交能力强，偏财运佳' },
  '正财': { keyword: '勤恳踏实', desc: '务实稳健，正当财路，收入稳定' },
  '七杀': { keyword: '果敢刚毅', desc: '魄力十足，敢于挑战，具领导力' },
  '正官': { keyword: '正直端庄', desc: '循规蹈矩，责任心强，适合公职' },
  '偏印': { keyword: '奇思妙想', desc: '思想前卫，钟情学术，具独特见解' },
  '正印': { keyword: '仁慈博学', desc: '好学上进，慈悲为怀，受人敬重' },
}

// ============================================================
// 神煞 (Spiritual Stars / Special Stars)
// ============================================================
type ShenSha = {
  name: string
  type: 'auspicious' | 'inauspicious' | 'neutral'
  desc: string
  cityAdvice: string
}

function calculateShenSha(yearBranch: string, dayBranch: string, monthBranch: string): ShenSha[] {
  const result: ShenSha[] = []

  // 天乙贵人 (Noble Star)
  const tianyi: Record<string, string[]> = {
    '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
    '乙': ['子', '申'], '己': ['子', '申'],
    '丙': ['酉', '亥'], '丁': ['酉', '亥'],
    '壬': ['卯', '巳'], '癸': ['卯', '巳'],
    '辛': ['寅', '午'],
  }

  // 驿马星 (Travel Star) - 重要：影响迁移
  const yima: Record<string, string> = {
    '寅': '申', '午': '申', '戌': '申',
    '申': '寅', '子': '寅', '辰': '寅',
    '巳': '亥', '酉': '亥', '丑': '亥',
    '亥': '巳', '卯': '巳', '未': '巳',
  }
  if (yima[yearBranch] && [dayBranch, monthBranch].includes(yima[yearBranch])) {
    result.push({
      name: '驿马星',
      type: 'auspicious',
      desc: '驿马入命，一生动荡奔波，利于远行发展。古语云："驿马朝天，升迁遥远"。',
      cityAdvice: '宜选交通枢纽城市或远离故乡的新兴城市，驿马催动，远行大吉。',
    })
  }

  // 文昌星 (Academic Star)
  const wenchang: Record<string, string> = {
    '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申',
    '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯',
  }
  // Simplified: check if year branch matches
  if (monthBranch === '巳' || monthBranch === '午') {
    result.push({
      name: '文昌星',
      type: 'auspicious',
      desc: '文昌入命，聪颖好学，利于考试科举，文采斐然。',
      cityAdvice: '宜选文教发达、高校云集之城，如北京、南京、武汉，利于学业仕途。',
    })
  }

  // 华盖星 (Canopy Star)
  const huagai: Record<string, string> = {
    '寅': '戌', '午': '戌', '戌': '戌',
    '申': '辰', '子': '辰', '辰': '辰',
    '巳': '丑', '酉': '丑', '丑': '丑',
    '亥': '未', '卯': '未', '未': '未',
  }
  if (huagai[yearBranch] === dayBranch) {
    result.push({
      name: '华盖星',
      type: 'neutral',
      desc: '华盖入命，性好孤独清高，具宗教哲学天赋，适合研究学问。',
      cityAdvice: '宜选文化底蕴深厚、宗教氛围浓郁之城，如西安、成都、杭州。',
    })
  }

  // 天德贵人 (Heavenly Virtue)
  const tiande: Record<string, string> = {
    '寅': '丁', '卯': '申', '辰': '壬', '巳': '辛',
    '午': '亥', '未': '甲', '申': '癸', '酉': '寅',
    '戌': '丙', '亥': '乙', '子': '巳', '丑': '庚',
  }
  // Simplified check
  if (['子', '午', '卯', '酉'].includes(yearBranch)) {
    result.push({
      name: '天德贵人',
      type: 'auspicious',
      desc: '天德临命，一生多贵人扶持，逢凶化吉，福德深厚。',
      cityAdvice: '天德护佑，各方皆可发展，尤利政治文化中心城市。',
    })
  }

  // 桃花星 (Peach Blossom Star)
  const taohua: Record<string, string> = {
    '寅': '卯', '午': '卯', '戌': '卯',
    '申': '酉', '子': '酉', '辰': '酉',
    '巳': '午', '酉': '午', '丑': '午',
    '亥': '子', '卯': '子', '未': '子',
  }
  if (taohua[yearBranch] === dayBranch || taohua[yearBranch] === monthBranch) {
    result.push({
      name: '桃花星',
      type: 'neutral',
      desc: '桃花入命，人缘极佳，异性缘旺，社交能力出众。',
      cityAdvice: '宜选时尚繁华之都，如上海、深圳、广州，利于社交与人脉拓展。',
    })
  }

  // 将星 (General Star)
  const jiangxing: Record<string, string> = {
    '寅': '午', '午': '午', '戌': '午',
    '申': '子', '子': '子', '辰': '子',
    '巳': '酉', '酉': '酉', '丑': '酉',
    '亥': '卯', '卯': '卯', '未': '卯',
  }
  if (jiangxing[yearBranch] === dayBranch) {
    result.push({
      name: '将星',
      type: 'auspicious',
      desc: '将星入命，具有号召力和领导才能，可统御一方。',
      cityAdvice: '宜选省会级以上城市，利于仕途和管理岗位发展。',
    })
  }

  // 金舆星 (Golden Carriage Star)
  if (['辰', '巳'].includes(dayBranch)) {
    result.push({
      name: '金舆星',
      type: 'auspicious',
      desc: '金舆入命，出行安泰，贵人随行，利于迁徙远行。',
      cityAdvice: '迁移大吉之星，无论何方皆可安居，尤利新一线城市。',
    })
  }

  // 亡神 (Lost Spirit)
  const wangshen: Record<string, string> = {
    '寅': '巳', '午': '巳', '戌': '巳',
    '申': '亥', '子': '亥', '辰': '亥',
    '巳': '申', '酉': '申', '丑': '申',
    '亥': '寅', '卯': '寅', '未': '寅',
  }
  if (wangshen[yearBranch] === dayBranch) {
    result.push({
      name: '亡神',
      type: 'inauspicious',
      desc: '亡神临命，性格多疑善变，需防小人暗算。',
      cityAdvice: '不宜选过于复杂的大城市，可选中等规模、民风淳朴之城。',
    })
  }

  // 天罗地网 (Heaven Net & Earth Trap)
  if ((yearBranch === '戌' && dayBranch === '亥') || (yearBranch === '亥' && dayBranch === '戌')) {
    result.push({
      name: '天罗地网',
      type: 'inauspicious',
      desc: '天罗地网交织，行事多有阻碍，需谨慎择路。',
      cityAdvice: '宜选开阔平坦之地，避免山城、盆地，利于气场通达。',
    })
  }

  // If no special stars found, add a generic one
  if (result.length === 0) {
    result.push({
      name: '命格平和',
      type: 'neutral',
      desc: '命盘无特殊神煞入命，一生平顺安稳，福禄自来。',
      cityAdvice: '命格平和，宜依五行喜忌选城，各方均可发展。',
    })
  }

  return result
}

// ============================================================
// 大运计算 (Major Luck Cycles)
// ============================================================
export type DaYun = {
  age: string
  stem: string
  branch: string
  stemElement: string
  branchElement: string
  nayin: string
  nayinElement: string
  tenGod: string
  desc: string
}

function calculateDaYun(
  gender: string,
  yearStemIndex: number,
  monthStemIndex: number,
  monthBranchIndex: number
): DaYun[] {
  return calculateDaYunWithStartAge(gender, yearStemIndex, monthStemIndex, monthBranchIndex, 3)
}

/**
 * 带正确起运岁数的大运计算
 * 大运顺逆：阳年(甲丙戊庚壬)男、阴年(乙丁己辛癸)女为顺排
 *           阴年男、阳年女为逆排
 * 以月柱干支为基准进行顺逆推排
 */
function calculateDaYunWithStartAge(
  gender: string,
  yearStemIndex: number,
  monthStemIndex: number,
  monthBranchIndex: number,
  startAge: number
): DaYun[] {
  // 大运顺逆：阳男阴女顺行，阴男阳女逆行
  const yearStemYinYang = yearStemIndex % 2 === 0 ? '阳' : '阴'
  const isForward = (gender === 'male' && yearStemYinYang === '阳') || (gender === 'female' && yearStemYinYang === '阴')

  const dayuns: DaYun[] = []
  for (let i = 1; i <= 8; i++) {
    const direction = isForward ? i : -i
    const stemIdx = ((monthStemIndex + direction) % 10 + 10) % 10
    const branchIdx = ((monthBranchIndex + direction) % 12 + 12) % 12
    const stem = HEAVENLY_STEMS[stemIdx]
    const branch = EARTHLY_BRANCHES[branchIdx]
    const nayin = getNayin(stem, branch)
    // 起运岁数 = startAge, 每步大运10年
    const age = startAge + (i - 1) * 10
    const endAge = age + 9

    dayuns.push({
      age: `${age}-${endAge}`,
      stem,
      branch,
      stemElement: STEM_ELEMENT[stem],
      branchElement: BRANCH_ELEMENT[branch],
      nayin: nayin.nayin,
      nayinElement: nayin.element,
      tenGod: '', // will be filled in later
      desc: '',
    })
  }
  return dayuns
}

// ============================================================
// 八字格局判定
// ============================================================
type GeJu = {
  name: string
  level: string // 上格/中格/下格
  desc: string
  classicQuote: string
}

function determineGeJu(
  dayMaster: string,
  dayMasterElement: string,
  elementCounts: Record<string, number>,
  tenGods: string[]
): GeJu {
  const total = Object.values(elementCounts).reduce((a, b) => a + b, 0)
  const dayMasterRatio = elementCounts[dayMasterElement] / total

  // 正官格
  if (tenGods.includes('正官') && !tenGods.includes('伤官')) {
    return {
      name: '正官格',
      level: '上格',
      desc: '正官格主人品正端庄，循规蹈矩，适合公职仕途。古人最重此格。',
      classicQuote: '《三命通会》曰："正官者，甲见辛之类，阴阳配合，相制有情。"',
    }
  }

  // 七杀格
  if (tenGods.includes('七杀') && dayMasterRatio > 0.25) {
    return {
      name: '七杀格',
      level: '上格',
      desc: '七杀有制化��权，果敢刚毅，具将帅之才，利于创业开拓。',
      classicQuote: '《渊海子平》云："杀乃不善之名，以其能伤我也。"制化得宜，反成大器。',
    }
  }

  // 食神格
  if (tenGods.filter(g => g === '食神').length >= 2) {
    return {
      name: '食神格',
      level: '上格',
      desc: '食神格主人温厚有才华，生活品味高雅，财源广进，福禄双全。',
      classicQuote: '《子平真诠》曰："食神者，我生之也。食神有气胜财官。"',
    }
  }

  // 伤官格
  if (tenGods.includes('伤官')) {
    return {
      name: '伤官格',
      level: '中格',
      desc: '伤官格聪明绝顶，才华横溢，思维独特，但须注意人际关系。',
      classicQuote: '《滴天髓》云："伤官见官，为祸百端。"然伤官佩印，反主大贵。',
    }
  }

  // 财格
  if (tenGods.includes('正财') || tenGods.includes('偏财')) {
    return {
      name: '正财格',
      level: '中格',
      desc: '财格主人勤劳务实，善于理财经商，收入稳定，生活富足。',
      classicQuote: '《穷通宝鉴》曰："财为养命之源，人不可无财。"',
    }
  }

  // 印格
  if (tenGods.includes('正印')) {
    return {
      name: '正印格',
      level: '上格',
      desc: '印格主人好学博雅，仁慈宽厚，适合学术研究与教育领域。',
      classicQuote: '《三命通会》曰："印绶者，生我之物也。正印扶身，最为吉祥。"',
    }
  }

  // 比劫格 (fallback)
  if (dayMasterRatio > 0.35) {
    return {
      name: '比劫格',
      level: '中格',
      desc: '比劫格独立自主，竞争意识强，适合独立创业或自由职业。',
      classicQuote: '《滴天髓》云："比肩如兄弟，同气相求。"宜独立发展。',
    }
  }

  return {
    name: '普通格局',
    level: '中格',
    desc: '命格平和中正，五行不偏不倚，一生平稳顺遂。',
    classicQuote: '《易经》曰："天行健，君子以自强不息。"命虽平和，勤勉可成大器。',
  }
}

// ============================================================
// 职业分析 (Career Analysis) - 基于十神格局、五行喜忌、紫微事业宫
// 参考《三命通会》《滴天髓》《穷通宝鉴》《子平真诠》
// ============================================================
export type CareerAnalysis = {
  primaryDirection: string      // 主要职业方向
  secondaryDirection: string    // 次要职业方向
  industries: string[]          // 适合的行业列表
  roles: string[]               // 适合的角色/岗位
  tenGodAnalysis: string        // 十神角度分析
  elementAnalysis: string       // 五行角度分析
  ziweiCareerAnalysis: string   // 紫微事业宫分析
  geJuAdvice: string            // 格局角度建议
  classicQuote: string          // 经典引用
  avoidIndustries: string[]     // 不适合的行业
  strengths: string[]           // 职业优势
  advice: string                // 综合建议
}

// 十神与职业方向对照（参考《三命通会》《滴天髓》）
const TEN_GOD_CAREER: Record<string, {
  direction: string
  industries: string[]
  roles: string[]
  strengths: string[]
  classicQuote: string
}> = {
  '正官': {
    direction: '管理行政、政府公职',
    industries: ['政府机关', '国企央企', '法律法务', '审计监管', '行政管理', '教育管理'],
    roles: ['公务员', '行政管理者', '法官检察官', '企业中高层', '学校管理者'],
    strengths: ['正直守信', '责任心强', '组织能力佳', '循规蹈矩'],
    classicQuote: '《子平真诠》曰："正官者，甲见辛之类，阴阳配合，相制有情。"正官为贵气之星，利于仕途公职。',
  },
  '七杀': {
    direction: '开拓创新、军警执法',
    industries: ['军事国防', '警察执法', '外科医学', '竞技体育', '企业创业', '期货投资'],
    roles: ['军官', '企业家', '外科医生', '运动员', '投资人', '开拓型管理者'],
    strengths: ['果敢刚毅', '魄力十足', '开创力强', '敢于挑战'],
    classicQuote: '《渊海子平》云："杀乃不善之名，以其能伤我也。"七杀有制化为权，将帅之才，利于开拓创新。',
  },
  '食神': {
    direction: '文艺创作、餐饮美食',
    industries: ['餐饮美食', '艺术创作', '音乐表演', '文学创作', '教育培训', '旅游休闲'],
    roles: ['厨师', '艺术家', '作家', '教师', '设计师', '品酒师'],
    strengths: ['才华横溢', '品味高雅', '性情温和', '创造力强'],
    classicQuote: '《子平真诠》曰："食神者，我生之也。食神有气胜财官。"食神主口福才华，利于文艺餐饮。',
  },
  '伤官': {
    direction: '技术研发、自由职业',
    industries: ['科技研发', '律师辩护', '自由撰稿', '演艺娱乐', '发明创造', '咨询顾问'],
    roles: ['工程师', '律师', '自由职业者', '演员', '发明家', '技术专家'],
    strengths: ['聪明绝顶', '思维独特', '才气纵横', '不拘一格'],
    classicQuote: '《滴天髓》云："伤官见官，为祸百端。"然伤官佩印，才华出众，利于技术创新和自由发展。',
  },
  '偏财': {
    direction: '商贸投资、社交营销',
    industries: ['国际贸易', '投资理财', '房地产', '保险金融', '广告营销', '社交电商'],
    roles: ['企业主', '投资人', '销售总监', '贸易商', '营销策划', '商业顾问'],
    strengths: ['商业头脑', '社交能力强', '善于理财', '偏财运佳'],
    classicQuote: '《穷通宝鉴》曰："财为养命之源。"偏财主横财偏财，利于投资商贸，社交开拓。',
  },
  '正财': {
    direction: '财务金融、踏实经营',
    industries: ['银行金融', '会计审计', '零售经营', '制造业', '农业种植', '物业管理'],
    roles: ['会计师', '银行职员', '店铺经营者', '财务总监', '稳健型企业家'],
    strengths: ['勤恳踏实', '务实稳健', '理财有方', '收入稳定'],
    classicQuote: '《三命通会》曰："正财者，甲见己之类也。"正财主正当之财，利于稳健经营，积少成多。',
  },
  '正印': {
    direction: '学术教育、医疗慈善',
    industries: ['高等教育', '学术研究', '出版传媒', '医疗卫生', '慈善公益', '宗教文化'],
    roles: ['教授学者', '研究员', '编辑出版', '医生', '公益人士', '文化工作者'],
    strengths: ['好学博雅', '仁慈宽厚', '博学多闻', '受人敬重'],
    classicQuote: '《三命通会》曰："印绶者，生我之物也。正印扶身，最为吉祥。"印星主学问，利于学术教育。',
  },
  '偏印': {
    direction: '玄学研究、冷门专业',
    industries: ['中医药学', '心理咨询', '玄学命理', '考古历史', '哲学宗教', '特殊技艺'],
    roles: ['中医师', '心理咨询师', '命理师', '考古学家', '哲学家', '特种技术专家'],
    strengths: ['奇思妙想', '思想前卫', '独特见解', '钟情学术'],
    classicQuote: '《滴天髓》云："偏印最喜偏财制。"偏印主偏门学问，利于冷门研究，独辟蹊径。',
  },
  '比肩': {
    direction: '自主创业、竞技合作',
    industries: ['自主创业', '竞技体育', '直播电商', '合伙经营', '同行竞争', '独立咨询'],
    roles: ['创业者', '运动员', '独立顾问', '自由职业者', '合伙人'],
    strengths: ['独立自主', '竞争意识强', '自信果断', '执行力强'],
    classicQuote: '《滴天髓》云："比肩如兄弟，同气相求。"比肩主独立，利于自主创业，白手起家。',
  },
  '劫���': {
    direction: '风险投资、社交拓展',
    industries: ['风险投资', '保险推销', '娱乐博彩', '社交平台', '中介服务', '快消零售'],
    roles: ['风投经理', '保险代理', '社交达人', '中介经纪', '营销精英'],
    strengths: ['豪爽大方', '交友广泛', '慷慨仗义', '行动力强'],
    classicQuote: '《穷通宝鉴》提示："劫财旺者，宜见官杀制之。"劫财主交际，利于社交拓展，但需防破财。',
  },
}

// 五行与行业对照（参考《协纪辨方书》《穷通宝鉴》）
const ELEMENT_CAREER: Record<string, {
  industries: string[]
  keyword: string
  desc: string
}> = {
  '金': {
    industries: ['金融证券', '银行保险', '五金机械', '汽车制造', '珠宝首饰', '法律司法', '军警国防', '牙科外科'],
    keyword: '金主义',
    desc: '金属性行业重在决断、执行、规范。金主义，其性刚，适合需要果断决策和规则约束的职业领域。',
  },
  '木': {
    industries: ['教育培训', '文化出版', '农林花卉', '服装纺织', '家具木材', '医疗保健', '中医药业', '公益慈善'],
    keyword: '木主仁',
    desc: '木属性行业重在生长、教化、滋养。木主仁，其性直，适合需要爱心、耐心和培育能力的职业领域。',
  },
  '水': {
    industries: ['物流运输', '旅游酒店', '传媒广告', '渔业水产', '酒水饮料', '洗涤清洁', '航运贸易', '咨询服务'],
    keyword: '水主智',
    desc: '水属性行业重在流通、智慧、变化。水主智，其性聪，适合需要灵活应变和智慧谋略的职业领域。',
  },
  '火': {
    industries: ['IT科技', '电子电器', '新能源', '餐饮烹饪', '演艺娱乐', '广告传播', '美容美发', '照明光电'],
    keyword: '火主礼',
    desc: '火属性行业重在热情、传播、光明。火主礼，其性急，适合需要热情活力和创新精神的职业领域。',
  },
  '土': {
    industries: ['房地产', '建筑工程', '农业畜牧', '矿业采掘', '仓储物流', '陶瓷建材', '殡葬服务', '信托基金'],
    keyword: '土主信',
    desc: '土属性行业重在稳固、诚信、包容。土主信，其性重，适合需要稳重踏实和诚信经营的职业领域。',
  },
}

function analyzeCareer(
  bazi: BaziChart,
  ziweiCareerStar?: { name: string; element: string; meaning: string; brightness: string },
): CareerAnalysis {
  const { dayMaster, dayMasterElement, favorableElement, geJu, elementCounts, dayMasterAnalysis, shenSha } = bazi

  // 1. 统计十神频次，找出最旺十神
  const tenGodCounts: Record<string, number> = {}
  const pillars = [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar]
  for (const p of pillars) {
    if (p.tenGod && p.tenGod !== '日主') {
      tenGodCounts[p.tenGod] = (tenGodCounts[p.tenGod] || 0) + 1
    }
    for (const hs of p.hiddenStems) {
      if (hs.tenGod && hs.tenGod !== '日主') {
        tenGodCounts[hs.tenGod] = (tenGodCounts[hs.tenGod] || 0) + 0.5
      }
    }
  }

  // 月柱十神权重最高（月令司令）
  if (bazi.monthPillar.tenGod && bazi.monthPillar.tenGod !== '日主') {
    tenGodCounts[bazi.monthPillar.tenGod] = (tenGodCounts[bazi.monthPillar.tenGod] || 0) + 1
  }

  const sortedTenGods = Object.entries(tenGodCounts).sort((a, b) => b[1] - a[1])
  const dominantTenGod = sortedTenGods[0]?.[0] || '比肩'
  const secondaryTenGod = sortedTenGods[1]?.[0] || '食神'

  const primaryCareer = TEN_GOD_CAREER[dominantTenGod] || TEN_GOD_CAREER['比肩']
  const secondaryCareer = TEN_GOD_CAREER[secondaryTenGod] || TEN_GOD_CAREER['食神']

  // 2. 五行喜用神对应行业
  const elementCareer = ELEMENT_CAREER[favorableElement] || ELEMENT_CAREER['土']

  // 3. 综合行业列表：十神行业 + 五行行业 去重
  const allIndustries = [...new Set([
    ...primaryCareer.industries.slice(0, 4),
    ...elementCareer.industries.slice(0, 3),
    ...secondaryCareer.industries.slice(0, 2),
  ])]

  // 4. 不适合的行业：忌神五行对应
  const unfavorableElement = bazi.unfavorableElement
  const avoidCareer = ELEMENT_CAREER[unfavorableElement] || ELEMENT_CAREER['土']

  // 5. 十神分析文字
  const tenGodAnalysis = `命局十神以${dominantTenGod}为主导（月令${bazi.monthPillar.tenGod}），${primaryCareer.classicQuote} 日主${dayMaster}(${dayMasterElement})${dayMasterAnalysis.strength}，${dominantTenGod}${tenGodCounts[dominantTenGod]?.toFixed(1) || '1'}见，力量${(tenGodCounts[dominantTenGod] || 0) > 1.5 ? '显著' : '适中'}。`

  // 6. 五行分析文字
  const elementAnalysis = `喜用神为${favorableElement}，${elementCareer.keyword}。${elementCareer.desc} 命局${favorableElement}行力量${elementCounts[favorableElement]?.toFixed(1)}，${elementCounts[favorableElement] > 2 ? '充沛可用' : '宜通过职业补益'}。`

  // 7. 紫微事业宫分析
  let ziweiCareerAnalysis = ''
  if (ziweiCareerStar) {
    const starCareerMap: Record<string, string> = {
      '紫微': '紫微坐事业宫，主大权在握，适合领导管理、政治仕途。《果老星宗》曰：紫微帝座，百官朝拱，利于统御一方。',
      '天机': '天机坐事业宫，主智谋善变，适合策划研发、技术创新。天机灵动，利于幕后军师、技术研究。',
      '太阳': '太阳坐事业宫，主光明磊落，适合公关外交、传媒教育。太阳普照，利于面向大众的社会性职业。',
      '武曲': '武曲坐事业宫，主财星入事业，适合金融财务、军事武职。武曲化财为权，利于理财经商。',
      '天同': '天同坐事业宫，主安逸享乐，适合服务行业、文化艺术。天同福星，宜选压力较小的稳定职业。',
      '廉贞': '廉贞坐事业宫，主聪明好学，适合法律政治、技术管理。廉贞次桃花，宜选需要社交能力的行业。',
      '天府': '天府坐事业宫，主稳重大方，适合财务管理、行政后勤。天府令星，利于大型机构中稳步发展。',
      '太阴': '太阴坐事业宫，主温柔细腻，适合文艺创作、房地产、服务业。太阴富���，利于夜间或幕后工作。',
      '贪狼': '贪狼坐事业宫，主多才多艺，适合娱乐演艺、社交营销。贪狼桃花，利于需要魅力和社交能力的行业。',
      '巨门': '巨门坐事业宫，主口才犀利，适合律师教师、媒体传播。巨门暗星，利于靠口才和分析能力谋生。',
      '天相': '天相坐事业宫，主公正调和，适合秘书助理、人力资源。天相印星，利于辅佐型的管理职位。',
      '天梁': '天梁坐事业宫，主正直善良，适合医疗保健、社会工作。天梁荫星，利于助人济世的公益事业。',
      '七杀': '七杀坐事业宫，主勇猛果断，适合军警武职、开创事业。七杀将星，利于独当一面的开拓型职业。',
      '破军': '破军坐事业宫，主变革创新，适合科技创业、投资冒险。破军耗星，利于破旧立新的开拓事业。',
    }
    ziweiCareerAnalysis = starCareerMap[ziweiCareerStar.name] ||
      `${ziweiCareerStar.name}坐事业宫（${ziweiCareerStar.brightness}），属${ziweiCareerStar.element}行。${ziweiCareerStar.meaning}`
  }

  // 8. 格局建议
  const geJuCareerMap: Record<string, string> = {
    '正官格': '正官格宜走体制内路线，公务员、国企、事业单位为首选。《子平真诠》曰："官星纯粹最为奇"，稳中求进，循序渐进。',
    '七杀格': '七杀格宜走开拓路线，创业、投资、军警武职皆可。七杀有制化为权，敢闯敢拼，成就非凡。',
    '食神格': '食神格宜走才华路线，文艺、餐饮、教育为佳。食神有气胜财官，以才华谋生，福禄双全。',
    '伤官格': '伤官格宜走技术路线，研发、法律、自由职业为佳。伤官佩印，才高八斗，宜独辟蹊径。',
    '正财格': '正财格宜走稳健路线，金融、会计、经营管理为佳。正财勤劳致富，脚踏实地，积少成多。',
    '正印格': '印格宜走学术路线，教育、研究、出版为首选。印绶扶身最为吉祥，以学问立身。',
    '比劫格': '比劫格宜走独立路线，自主创业、竞技比赛、独立咨询为佳。比肩独立，宜白手起家。',
    '普通格局': '格局平和，不偏不倚，各行业均可发展。关键在于选择喜用神对应的行业属性，顺势而为。',
  }
  const geJuAdvice = geJuCareerMap[geJu.name] || geJuCareerMap['普通格局']

  // 9. 神煞对职业的影响
  const shenShaCareerHints: string[] = []
  for (const sha of shenSha) {
    if (sha.name === '文昌星') shenShaCareerHints.push('文昌入命，利于文职学术、考试科举')
    if (sha.name === '将星') shenShaCareerHints.push('将星入命，利于领导管理、军警武职')
    if (sha.name === '驿马星') shenShaCareerHints.push('驿马入命，利于外勤出差、贸易运输')
    if (sha.name === '桃花星') shenShaCareerHints.push('桃花入命，利于社交营销、演艺娱乐')
    if (sha.name === '华盖星') shenShaCareerHints.push('华盖入命，利于宗教哲学、学术研究')
  }

  // 10. 综合建议
  const advice = `综合十神格局、五行喜忌与紫微事业宫分析：您最适合从事${primaryCareer.direction}方向，辅以${secondaryCareer.direction}。建议优先选择${favorableElement}行属性的行业（${elementCareer.industries.slice(0, 3).join('、')}），避开${unfavorableElement}行属性的行业。${shenShaCareerHints.length > 0 ? shenShaCareerHints[0] + '。' : ''}${geJu.name === '正官格' ? '正官格者，体制内发展最为有利。' : geJu.name === '七杀格' ? '七杀格者，自主创业更能发挥优势。' : '顺应命理所长，方能事半功倍。'}`

  return {
    primaryDirection: primaryCareer.direction,
    secondaryDirection: secondaryCareer.direction,
    industries: allIndustries,
    roles: [...primaryCareer.roles.slice(0, 3), ...secondaryCareer.roles.slice(0, 2)],
    tenGodAnalysis,
    elementAnalysis,
    ziweiCareerAnalysis,
    geJuAdvice,
    classicQuote: primaryCareer.classicQuote,
    avoidIndustries: avoidCareer.industries.slice(0, 4),
    strengths: [...primaryCareer.strengths.slice(0, 3), ...secondaryCareer.strengths.slice(0, 1)],
    advice,
  }
}

// ============================================================
// 日主强弱详细分析
// ============================================================
type DayMasterAnalysis = {
  strength: '极旺' | '偏旺' | '中和' | '偏弱' | '极弱'
  ratio: number
  desc: string
  advice: string
}

function analyzeDayMasterStrength(
  dayMasterElement: string,
  elementCounts: Record<string, number>,
  monthBranch: string
): DayMasterAnalysis {
  const total = Object.values(elementCounts).reduce((a, b) => a + b, 0)
  const ratio = elementCounts[dayMasterElement] / total

  // 月令得令加成
  const monthElement = BRANCH_ELEMENT[monthBranch]
  const isInSeason = monthElement === dayMasterElement
  const adjustedRatio = isInSeason ? ratio + 0.1 : ratio

  if (adjustedRatio > 0.4) {
    return {
      strength: '极旺',
      ratio: adjustedRatio,
      desc: '日主极旺，气势磅礴，如长江大河不可阻挡。',
      advice: '宜克泄耗，选择能消耗旺气的城市方位。需要财星和官杀来制衡。',
    }
  }
  if (adjustedRatio > 0.3) {
    return {
      strength: '偏旺',
      ratio: adjustedRatio,
      desc: '日主偏旺，根基稳固，如参天大树枝繁叶茂。',
      advice: '宜适度克泄，选择五行克制日主的方位，利于事业发展。',
    }
  }
  if (adjustedRatio > 0.2) {
    return {
      strength: '中和',
      ratio: adjustedRatio,
      desc: '日主中和，阴阳平衡，如春风化雨润物无声。',
      advice: '五行平衡之命，各方位皆可发展，顺其自然为上。',
    }
  }
  if (adjustedRatio > 0.12) {
    return {
      strength: '偏弱',
      ratio: adjustedRatio,
      desc: '日主偏弱，需生扶助力，如初生之苗需阳光雨露。',
      advice: '宜生扶为主，选择生助日主的五行方位，利于培养根基。',
    }
  }
  return {
    strength: '极弱',
    ratio: adjustedRatio,
    desc: '日主极弱，从势为妙，如随波逐流顺势而为。',
    advice: '极弱从旺，宜顺从命局最旺之五行，选择旺气方位发展。',
  }
}

// ============================================================
// Types
// ============================================================
export type BaziPillar = {
  stem: string
  branch: string
  stemElement: string
  branchElement: string
  nayin: string
  nayinElement: string
  tenGod: string
  hiddenStems: { stem: string; element: string; tenGod: string }[]
}

export type BaziChart = {
  yearPillar: BaziPillar
  monthPillar: BaziPillar
  dayPillar: BaziPillar
  hourPillar: BaziPillar
  zodiac: string
  dayMaster: string
  dayMasterElement: string
  dayMasterYinYang: string
  elementCounts: Record<string, number>
  dominantElement: string
  weakElement: string
  favorableElement: string
  unfavorableElement: string
  geJu: GeJu
  dayMasterAnalysis: DayMasterAnalysis
  shenSha: ShenSha[]
  daYun: DaYun[]
  yearNayin: string
  classicDesc: string
  career: CareerAnalysis
  trueSolarTimeNote: string
  jieqiInfo: string
  daYunStartDesc: string
}

// ============================================================
// Pillar Calculations
// ============================================================
function getYearPillar(year: number, dayMaster: string): BaziPillar {
  const stemIndex = (year - 4) % 10
  const branchIndex = (year - 4) % 12
  const stem = HEAVENLY_STEMS[stemIndex]
  const branch = EARTHLY_BRANCHES[branchIndex]
  const nayin = getNayin(stem, branch)
  const hiddenStems = (BRANCH_HIDDEN_STEMS[branch] || []).map(hs => ({
    stem: hs,
    element: STEM_ELEMENT[hs],
    tenGod: getTenGod(dayMaster, hs),
  }))
  return {
    stem, branch,
    stemElement: STEM_ELEMENT[stem],
    branchElement: BRANCH_ELEMENT[branch],
    nayin: nayin.nayin,
    nayinElement: nayin.element,
    tenGod: getTenGod(dayMaster, stem),
    hiddenStems,
  }
}

function getMonthPillar(year: number, month: number, dayMaster: string, monthBranchIndex?: number): BaziPillar {
  const yearStemIndex = (year - 4) % 10
  // 五虎遁: 甲己之年丙作首(2), 乙庚之岁戊为头(4), 丙辛之年寻庚上(6), 丁壬壬寅顺水流(8), 戊癸之年甲寅头(0)
  const monthStemStart = [2, 4, 6, 8, 0][yearStemIndex % 5]
  // 月支: 如果有通过节气计算的monthBranchIndex就用它, 否则按传统 month+1
  const branchIdx = monthBranchIndex !== undefined ? monthBranchIndex : (month + 1) % 12
  // 月干: 寅月(branchIndex=2)为起始, 月干 = monthStemStart + (branchIdx - 2)
  const stemIndex = (monthStemStart + ((branchIdx - 2 + 12) % 12)) % 10
  const stem = HEAVENLY_STEMS[stemIndex]
  const branch = EARTHLY_BRANCHES[branchIdx]
  const nayin = getNayin(stem, branch)
  const hiddenStems = (BRANCH_HIDDEN_STEMS[branch] || []).map(hs => ({
    stem: hs,
    element: STEM_ELEMENT[hs],
    tenGod: getTenGod(dayMaster, hs),
  }))
  return {
    stem, branch,
    stemElement: STEM_ELEMENT[stem],
    branchElement: BRANCH_ELEMENT[branch],
    nayin: nayin.nayin,
    nayinElement: nayin.element,
    tenGod: getTenGod(dayMaster, stem),
    hiddenStems,
  }
}

function getDayPillar(year: number, month: number, day: number): BaziPillar {
  // 已知参考点: 2000年1月1日为甲子日 (stem=0甲, branch=0子)
  // 用2000-01-01作为基准，更准确
  const baseDate = new Date(2000, 0, 1)
  const targetDate = new Date(year, month - 1, day)
  const diffDays = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
  // 2000-01-01=甲子日: stemIndex=0, branchIndex=0
  const stemIndex = ((diffDays % 10) + 10) % 10
  const branchIndex = ((diffDays % 12) + 12) % 12
  const stem = HEAVENLY_STEMS[stemIndex]
  const branch = EARTHLY_BRANCHES[branchIndex]
  const nayin = getNayin(stem, branch)
  const dayMaster = stem
  const hiddenStems = (BRANCH_HIDDEN_STEMS[branch] || []).map(hs => ({
    stem: hs,
    element: STEM_ELEMENT[hs],
    tenGod: getTenGod(dayMaster, hs),
  }))
  return {
    stem, branch,
    stemElement: STEM_ELEMENT[stem],
    branchElement: BRANCH_ELEMENT[branch],
    nayin: nayin.nayin,
    nayinElement: nayin.element,
    tenGod: '日主',
    hiddenStems,
  }
}

function getHourPillar(dayStem: string, hourBranch: string): BaziPillar {
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem as typeof HEAVENLY_STEMS[number])
  const hourBranchIndex = EARTHLY_BRANCHES.indexOf(hourBranch as typeof EARTHLY_BRANCHES[number])
  const hourStemStart = [0, 2, 4, 6, 8][dayStemIndex % 5]
  const stemIndex = (hourStemStart + hourBranchIndex) % 10
  const stem = HEAVENLY_STEMS[stemIndex]
  const nayin = getNayin(stem, hourBranch)
  const hiddenStems = (BRANCH_HIDDEN_STEMS[hourBranch] || []).map(hs => ({
    stem: hs,
    element: STEM_ELEMENT[hs],
    tenGod: getTenGod(dayStem, hs),
  }))
  return {
    stem, branch: hourBranch,
    stemElement: STEM_ELEMENT[stem],
    branchElement: BRANCH_ELEMENT[hourBranch],
    nayin: nayin.nayin,
    nayinElement: nayin.element,
    tenGod: getTenGod(dayStem, stem),
    hiddenStems,
  }
}

// 统计五行分布
function countElements(pillars: BaziPillar[]): Record<string, number> {
  const counts: Record<string, number> = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 }
  for (const pillar of pillars) {
    counts[pillar.stemElement] += 1
    counts[pillar.branchElement] += 1
    for (const hs of pillar.hiddenStems) {
      counts[hs.element] += 0.5
    }
  }
  return counts
}

// 五行相生相克
const ELEMENT_GENERATES: Record<string, string> = {
  '金': '水', '水': '木', '木': '火', '火': '土', '土': '金'
}
const ELEMENT_CONTROLS: Record<string, string> = {
  '金': '木', '木': '土', '土': '水', '水': '火', '火': '金'
}

// 计算喜用神 (enhanced)
function getFavorableElement(
  dayMasterElement: string,
  elementCounts: Record<string, number>,
  monthBranch: string
): string {
  const total = Object.values(elementCounts).reduce((a, b) => a + b, 0)
  const dayMasterRatio = elementCounts[dayMasterElement] / total
  const monthElement = BRANCH_ELEMENT[monthBranch]
  const isInSeason = monthElement === dayMasterElement

  const adjustedRatio = isInSeason ? dayMasterRatio + 0.08 : dayMasterRatio

  if (adjustedRatio > 0.35) {
    // 极旺：喜克制
    return ELEMENT_CONTROLS[dayMasterElement]
  } else if (adjustedRatio > 0.28) {
    // 偏旺：喜泄气
    return ELEMENT_GENERATES[dayMasterElement]
  } else if (adjustedRatio > 0.18) {
    // 中和：维持平衡，补最弱
    const sorted = Object.entries(elementCounts).sort((a, b) => a[1] - b[1])
    return sorted[0][0]
  } else {
    // 偏弱/极弱：喜生扶
    const generatedBy = Object.entries(ELEMENT_GENERATES).find(([, v]) => v === dayMasterElement)?.[0]
    return generatedBy || dayMasterElement
  }
}

// 生成国学经典描述
function getClassicDescription(bazi: {
  dayMaster: string
  dayMasterElement: string
  favorableElement: string
  geJu: GeJu
  yearNayin: string
}): string {
  const elementPoems: Record<string, string> = {
    '金': '《易》曰：乾为天，为金，为玉。金主义，其性刚，其情烈。秋日金风，肃杀凛冽。',
    '木': '《易》曰：震为雷，为木。木主仁，其性直，其情和。春回大地，万物生发。',
    '水': '《易》曰：坎为水，为月。水主智，其性聪，其情善。天一生水，润泽万物。',
    '火': '《易》曰：离为火，为日。火主礼，其性急，其情恭。丽照八方，光明普照。',
    '土': '《易》曰：坤为地，为土。土主信，其性重，其情厚。厚德载物，生化万端。',
  }
  return elementPoems[bazi.dayMasterElement] || ''
}

// ============================================================
// Main BaZi Calculation
// ============================================================
export function calculateBazi(
  year: number,
  month: number,
  day: number,
  hourBranch: string,
  gender: string = 'male',
  longitude?: number
): BaziChart {
  // 真太阳时校正：根据出生地经度调整时辰
  let adjustedHourBranch = hourBranch
  let trueSolarTimeNote = ''
  if (longitude !== undefined) {
    const solarAdj = adjustForTrueSolarTime(hourBranch, longitude)
    adjustedHourBranch = solarAdj.adjustedBranch
    trueSolarTimeNote = solarAdj.note
  }

  // 节气校正月份：以节气「节」为分界确定命理月份
  const jieqiResult = getMonthByJieQi(year, month, day)
  const lunarMonth = jieqiResult.lunarMonth
  const monthBranchIndex = jieqiResult.monthBranchIndex

  // 年柱：立春前属上一年
  const baziYear = lunarMonth >= 1 && jieqiResult.jie === '小寒' && month === 1 ? year - 1 :
    (month <= 2 && jieqiResult.lunarMonth >= 11) ? year - 1 : year

  // First get day pillar to determine day master
  const dayPillarTemp = getDayPillar(year, month, day)
  const dayMaster = dayPillarTemp.stem

  const yearPillar = getYearPillar(baziYear, dayMaster)
  // 使用节气校正后的月份和月支
  const monthPillar = getMonthPillar(baziYear, lunarMonth, dayMaster, monthBranchIndex)
  const dayPillar = dayPillarTemp
  // Re-calculate day pillar hidden stems with correct tenGod references
  dayPillar.hiddenStems = (BRANCH_HIDDEN_STEMS[dayPillar.branch] || []).map(hs => ({
    stem: hs,
    element: STEM_ELEMENT[hs],
    tenGod: getTenGod(dayMaster, hs),
  }))
  const hourPillar = getHourPillar(dayMaster, adjustedHourBranch)

  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar]
  const elementCounts = countElements(pillars)

  const zodiacIndex = (baziYear - 4) % 12
  const zodiac = ZODIAC_ANIMALS[zodiacIndex]

  const dayMasterElement = STEM_ELEMENT[dayMaster]
  const dayMasterYinYang = STEM_YINYANG[dayMaster]

  const sorted = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])
  const dominantElement = sorted[0][0]
  const weakElement = sorted[sorted.length - 1][0]

  const favorableElement = getFavorableElement(dayMasterElement, elementCounts, monthPillar.branch)
  const unfavorableElement = ELEMENT_CONTROLS[favorableElement]

  // Collect ten gods
  const allTenGods = [
    yearPillar.tenGod, monthPillar.tenGod, hourPillar.tenGod,
    ...yearPillar.hiddenStems.map(h => h.tenGod),
    ...monthPillar.hiddenStems.map(h => h.tenGod),
    ...dayPillar.hiddenStems.map(h => h.tenGod),
    ...hourPillar.hiddenStems.map(h => h.tenGod),
  ]

  const geJu = determineGeJu(dayMaster, dayMasterElement, elementCounts, allTenGods)
  const dayMasterAnalysis = analyzeDayMasterStrength(dayMasterElement, elementCounts, monthPillar.branch)
  const shenSha = calculateShenSha(yearPillar.branch, dayPillar.branch, monthPillar.branch)

  // 大运: 用正确的起运岁数（三天折一年法）
  const yearStemIndex = (baziYear - 4) % 10
  const yearStemYinYang = yearStemIndex % 2 === 0 ? '阳' : '阴'
  const isForwardDaYun = (gender === 'male' && yearStemYinYang === '阳') || (gender === 'female' && yearStemYinYang === '阴')
  const daYunStartInfo = calculateDaYunStartAge(isForwardDaYun, jieqiResult.daysToNextJie, jieqiResult.daysToPrevJie)
  const monthStemIdx = HEAVENLY_STEMS.indexOf(monthPillar.stem as typeof HEAVENLY_STEMS[number])
  const monthBranchIdx = EARTHLY_BRANCHES.indexOf(monthPillar.branch as typeof EARTHLY_BRANCHES[number])
  const daYun = calculateDaYunWithStartAge(gender, yearStemIndex, monthStemIdx, monthBranchIdx, daYunStartInfo.startAge)
  // Fill in ten gods and descriptions for each dayun
  for (const dy of daYun) {
    dy.tenGod = getTenGod(dayMaster, dy.stem)
    const godInfo = TEN_GOD_MEANINGS[dy.tenGod]
    dy.desc = godInfo ? `${dy.tenGod}运：${godInfo.desc}` : `${dy.stem}${dy.branch}运`
  }

  const yearNayin = yearPillar.nayin

  // 先构建不含 career 的临时对象用于 analyzeCareer
  const chartBase = {
    yearPillar, monthPillar, dayPillar, hourPillar,
    zodiac, dayMaster, dayMasterElement, dayMasterYinYang,
    elementCounts, dominantElement, weakElement,
    favorableElement, unfavorableElement,
    geJu, dayMasterAnalysis, shenSha, daYun,
    yearNayin,
    classicDesc: '',
    trueSolarTimeNote,
    jieqiInfo: `节气月份：${jieqiResult.jie}后${jieqiResult.daysToPrevJie}天，距${jieqiResult.nextJie}${jieqiResult.daysToNextJie}天。命理${lunarMonth}月（${monthPillar.branch}月）。`,
    daYunStartDesc: daYunStartInfo.desc,
  }

  chartBase.classicDesc = getClassicDescription({
    dayMaster, dayMasterElement, favorableElement, geJu, yearNayin,
  })

  // 职业分析（暂无紫微事业宫数据，在 page.tsx 中会补充）
  const career = analyzeCareer(chartBase as BaziChart)

  const chart: BaziChart = {
    ...chartBase,
    career,
  }

  return chart
}

// ============================================================
// 紫微斗数 (Ziwei Doushu) - Enhanced
// ============================================================
export type ZiweiStar = {
  name: string
  palace: string
  element: string
  meaning: string
  brightness: string // 庙/旺/得/利/平/不/陷
  category: string // 主星/辅星/煞星
}

// 四化 (Four Transformations)
export type SiHua = {
  star: string
  transform: '化禄' | '化权' | '化科' | '化忌'
  palace: string
  meaning: string
}

const ZIWEI_MAIN_STARS = [
  { name: '紫微', element: '土', meaning: '帝王之星，尊贵权威，领导力强', category: '主星' },
  { name: '天机', element: '木', meaning: '智慧之星，聪明灵活，善于谋划', category: '主星' },
  { name: '太阳', element: '火', meaning: '光明之星，热情大方，乐于助人', category: '主星' },
  { name: '武曲', element: '金', meaning: '财星，务实稳重，理财能力强', category: '主星' },
  { name: '天同', element: '水', meaning: '福星，温和善良，追求安逸', category: '主星' },
  { name: '廉贞', element: '火', meaning: '桃花星，聪明好学，感情丰富', category: '主星' },
  { name: '天府', element: '土', meaning: '令星，稳重大方，善于储蓄', category: '主星' },
  { name: '太阴', element: '水', meaning: '月亮之星，温柔细腻，艺术天赋', category: '主星' },
  { name: '贪狼', element: '木', meaning: '欲望之星，多才多艺，社交能力强', category: '主星' },
  { name: '巨门', element: '水', meaning: '暗星，口才好，分析能力强', category: '主星' },
  { name: '天相', element: '水', meaning: '印星，公正无私，善于调和', category: '主星' },
  { name: '天梁', element: '土', meaning: '荫星，正直善良，乐善好施', category: '主星' },
  { name: '七杀', element: '金', meaning: '将星，勇敢果断，开创力强', category: '主星' },
  { name: '破军', element: '水', meaning: '耗星，变革创新，不安现状', category: '主星' },
]

const ZIWEI_ASSIST_STARS = [
  { name: '文昌', element: '金', meaning: '文学之星，利考试科举', category: '辅星' },
  { name: '文曲', element: '水', meaning: '才艺之星，利文艺创作', category: '辅星' },
  { name: '左辅', element: '土', meaning: '助力之星，善于辅佐协助', category: '辅星' },
  { name: '右弼', element: '水', meaning: '助力之星，柔和圆融', category: '辅星' },
  { name: '天魁', element: '火', meaning: '阳贵人星，男命得贵人扶持', category: '辅星' },
  { name: '天钺', element: '火', meaning: '阴贵人星，女命得贵人扶持', category: '辅星' },
]

const ZIWEI_SHA_STARS = [
  { name: '擎羊', element: '金', meaning: '煞星，性急刚烈，主刑伤', category: '煞星' },
  { name: '陀罗', element: '金', meaning: '煞星，拖延犹豫，主纠缠', category: '煞星' },
  { name: '火星', element: '火', meaning: '煞星，急躁冲动，主突发', category: '煞星' },
  { name: '铃星', element: '火', meaning: '煞星，阴性暗火，主暗伤', category: '煞星' },
]

const PALACES = [
  '命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫',
  '迁移宫', '交友宫', '事业宫', '田宅宫', '福德宫', '父母宫'
] as const

const BRIGHTNESS_LEVELS = ['庙', '旺', '得', '利', '平', '不', '陷']

// 四化飞星
function calculateSiHua(yearStemIndex: number, palaceAssignments: { palace: string; star: string; element: string }[]): SiHua[] {
  // 年干四化表 (simplified)
  const sihuaTable: Record<number, { lu: string; quan: string; ke: string; ji: string }> = {
    0: { lu: '廉贞', quan: '破军', ke: '武曲', ji: '太阳' }, // 甲
    1: { lu: '天机', quan: '天梁', ke: '紫微', ji: '太阴' }, // 乙
    2: { lu: '天同', quan: '天机', ke: '文昌', ji: '廉贞' }, // 丙
    3: { lu: '太阴', quan: '天同', ke: '天机', ji: '巨门' }, // 丁
    4: { lu: '贪狼', quan: '太阴', ke: '右弼', ji: '天机' }, // 戊
    5: { lu: '武曲', quan: '贪狼', ke: '天梁', ji: '文曲' }, // 己
    6: { lu: '太阳', quan: '武曲', ke: '太阴', ji: '天同' }, // 庚
    7: { lu: '巨门', quan: '太阳', ke: '文曲', ji: '文昌' }, // 辛
    8: { lu: '天梁', quan: '紫微', ke: '左辅', ji: '武曲' }, // 壬
    9: { lu: '破军', quan: '巨门', ke: '太阴', ji: '贪狼' }, // 癸
  }

  const yearSihua = sihuaTable[yearStemIndex]
  if (!yearSihua) return []

  const findPalace = (starName: string) => {
    const found = palaceAssignments.find(p => p.star === starName)
    return found?.palace || '命宫'
  }

  return [
    {
      star: yearSihua.lu,
      transform: '化禄',
      palace: findPalace(yearSihua.lu),
      meaning: `${yearSihua.lu}化禄：主财禄丰盈，${findPalace(yearSihua.lu)}得财气加持，利于发展。`,
    },
    {
      star: yearSihua.quan,
      transform: '化权',
      palace: findPalace(yearSihua.quan),
      meaning: `${yearSihua.quan}化权：主权势地位，${findPalace(yearSihua.quan)}得权柄加持，利于领导。`,
    },
    {
      star: yearSihua.ke,
      transform: '化科',
      palace: findPalace(yearSihua.ke),
      meaning: `${yearSihua.ke}化科：主声名文采，${findPalace(yearSihua.ke)}得科名加持，利于学业。`,
    },
    {
      star: yearSihua.ji,
      transform: '化忌',
      palace: findPalace(yearSihua.ji),
      meaning: `${yearSihua.ji}化忌：主挫折困扰，${findPalace(yearSihua.ji)}需注意化解。`,
    },
  ]
}

/**
 * 紫微斗数排盘 - 调用正规三合派安星引擎
 * 综合三合紫微、飞星紫微、河洛紫微、钦天四化等流派
 */
export function calculateZiwei(
  year: number,
  month: number,
  day: number,
  hourBranch: string,
  lunarMonth?: number,
  adjustedHourBranch?: string,
  baziYear?: number
) {
  // 使用节气校正后的月份和时辰
  const actualMonth = lunarMonth || month
  const actualHour = adjustedHourBranch || hourBranch
  const actualYear = baziYear || year

  // 调用正规安星法引擎
  const result = calculateZiweiProper(actualYear, actualMonth, day, actualHour)

  return result
}

// ============================================================
// City Database & Recommendation (Enhanced with 风水/河图洛书)
// ============================================================
export type CityRecommendation = {
  name: string
  province: string
  direction: string
  element: string
  score: number
  reason: string
  features: string[]
  baziMatch: string
  ziweiMatch: string
  fengshui: string
  hetuAnalysis: string
  nayinMatch: string
  shenShaAdvice: string
  daYunAdvice: string
  classicQuote: string
  careerMatch: string  // 职业产业匹配分析
}

type CityData = {
  name: string
  province: string
  direction: string
  element: string
  features: string[]
  climate: string
  industry: string[]
  fengshui: string // 风水格局描述
  hetuNumber: number // 河图数
  luoshuPosition: number // 洛书九宫位置 (1-9)
  terrain: string // 地形
  waterSystem: string // 水系
}

const CITY_DATABASE: CityData[] = [
  // 北方水城
  {
    name: '北京', province: '北京', direction: '北', element: '水',
    features: ['政治中心', '文化底蕴', '历史名城', '科技创新'],
    climate: '温带季风', industry: ['科技', '金融', '文化', '教育'],
    fengshui: '北依燕山，南临华北平原，西有太行屏障，东望渤海。龙脉汇聚，帝王之气经久不衰。',
    hetuNumber: 1, luoshuPosition: 1, terrain: '平原山前', waterSystem: '永定河/潮白河',
  },
  {
    name: '哈尔滨', province: '黑龙江', direction: '北', element: '水',
    features: ['冰雪之城', '异域风情', '音乐之都', '寒地文化'],
    climate: '寒温带', industry: ['装备制造', '食品', '旅游'],
    fengshui: '松花江穿城而过，水势浩荡，寒水之气极盛，利水命之人。',
    hetuNumber: 1, luoshuPosition: 1, terrain: '平原', waterSystem: '松花江',
  },
  {
    name: '大连', province: '辽宁', direction: '北', element: '水',
    features: ['海滨城市', '花园城市', '浪漫之都', '港口经济'],
    climate: '温带海洋', industry: ['造船', '石化', '旅游', '软件'],
    fengshui: '三面环海，一面依山，得水之利，��风聚气。海水环抱，财气旺盛。',
    hetuNumber: 6, luoshuPosition: 1, terrain: '半岛丘陵', waterSystem: '黄海/渤海',
  },
  {
    name: '天津', province: '天津', direction: '北', element: '水',
    features: ['港口城市', '曲艺之乡', '近代文化', '滨海新区'],
    climate: '温带季风', industry: ['航空航天', '石化', '装备', '港口'],
    fengshui: '九河下梢，海河汇聚五水入海，水势充沛，利商贸财运。',
    hetuNumber: 6, luoshuPosition: 6, terrain: '沿海平原', waterSystem: '海河水系',
  },
  // 南方火城
  {
    name: '广州', province: '广东', direction: '南', element: '火',
    features: ['花城', '美食之都', '商贸中心', '千年商都'],
    climate: '亚热带', industry: ['外贸', '汽车', '电子', '日化'],
    fengshui: '白云山为靠，珠江环绕，南向开阔。五羊衔穗，瑞气千年，商贸之气旺盛。',
    hetuNumber: 2, luoshuPosition: 9, terrain: '丘陵平原', waterSystem: '珠江',
  },
  {
    name: '深圳', province: '广东', direction: '南', element: '火',
    features: ['创新之城', '科技高地', '年轻活力', '经济特区'],
    climate: '亚热带', industry: ['科技', '金融', '创新', '生物'],
    fengshui: '面向大海，背靠梧桐山，气场开阔进取。新城新气象，破旧立新之地。',
    hetuNumber: 7, luoshuPosition: 9, terrain: '沿海丘陵', waterSystem: '深圳河/大鹏湾',
  },
  {
    name: '海口', province: '海南', direction: '南', element: '火',
    features: ['椰城', '自贸港', '度假胜地', '热带风情'],
    climate: '热带', industry: ['旅游', '医疗', '自贸', '农业'],
    fengshui: '孤岛离火之地，四面环海，火水既济之格。热气蒸腾，万物繁茂。',
    hetuNumber: 2, luoshuPosition: 9, terrain: '海岛平原', waterSystem: '南渡江/琼州海峡',
  },
  {
    name: '南宁', province: '广西', direction: '南', element: '火',
    features: ['绿城', '东盟门户', '壮乡文化', '宜居之城'],
    climate: '亚热带', industry: ['东盟贸易', '食品', '旅游', '制糖'],
    fengshui: '邕江穿城，青山环绕，绿意盎然。水火相济，宜居之地。',
    hetuNumber: 7, luoshuPosition: 9, terrain: '盆地', waterSystem: '邕江/郁江',
  },
  // 东方木城
  {
    name: '上海', province: '上海', direction: '东', element: '木',
    features: ['魔都', '国际金融', '时尚之都', '东方明珠'],
    climate: '亚热带季风', industry: ['金融', '贸易', '科技', '文创'],
    fengshui: '长江入海口，黄浦江蜿蜒，得水之利。东方震位，木气生发，万物繁荣。',
    hetuNumber: 3, luoshuPosition: 3, terrain: '冲积平原', waterSystem: '长江/黄浦江',
  },
  {
    name: '杭州', province: '浙江', direction: '东', element: '木',
    features: ['人间天堂', '电商之都', '文化名城', '数字经济'],
    climate: '亚热带', industry: ['电商', '数字经济', '旅游', '丝绸'],
    fengshui: '西湖如镜，钱塘潮涌，三面云山一面城。山水秀美，灵气充沛，文人墨客钟爱之地。',
    hetuNumber: 8, luoshuPosition: 3, terrain: '丘陵平原', waterSystem: '钱塘江/西湖',
  },
  {
    name: '南京', province: '江苏', direction: '东', element: '木',
    features: ['六朝古都', '文教名城', '创新高地', '虎踞龙蟠'],
    climate: '亚热带', industry: ['电子', '汽车', '教育', '软件'],
    fengshui: '紫金山龙蟠，石头城虎踞，长江天堑。帝王之气虽散，文脉绵延不绝。',
    hetuNumber: 3, luoshuPosition: 4, terrain: '丘陵', waterSystem: '长江/秦淮河',
  },
  {
    name: '青岛', province: '山东', direction: '东', element: '木',
    features: ['海滨城市', '啤酒之城', '帆船之都', '品牌之都'],
    climate: '温带海洋', industry: ['家电', '啤酒', '海洋', '旅游'],
    fengshui: '崂山为靠，面朝黄海，山海相依。东方木气与海水交融，清新雅致。',
    hetuNumber: 8, luoshuPosition: 3, terrain: '丘陵半岛', waterSystem: '黄海/胶州湾',
  },
  {
    name: '苏州', province: '江苏', direction: '东', element: '木',
    features: ['园林之城', '丝绸之府', '制造业强市', '文��名城'],
    climate: '亚热带', industry: ['电子', '生物医药', '纺织', '装备'],
    fengshui: '水网密布，太湖之滨，水木相生。园林甲天下，藏风聚气之佳地。',
    hetuNumber: 3, luoshuPosition: 4, terrain: '平原水网', waterSystem: '太湖/运河',
  },
  {
    name: '厦门', province: '福建', direction: '东', element: '木',
    features: ['鹭岛', '花园城市', '�����漫之都', '宜居海岛'],
    climate: '亚热带', industry: ['旅游', '电子', '软件', '港口'],
    fengshui: '鹭岛如珠，海水环抱，背靠九龙江。木气生发，兼得水利。',
    hetuNumber: 8, luoshuPosition: 4, terrain: '海岛丘陵', waterSystem: '台湾海峡/九龙江',
  },
  // 西方金城
  {
    name: '成都', province: '四川', direction: '西', element: '金',
    features: ['天府之国', '美食之都', '休闲之城', '科技重镇'],
    climate: '亚热带湿润', industry: ['电子信息', '航空', '生物医药', '文创'],
    fengshui: '群山环抱，沃野千里，都江堰水利千年。天府之土，藏风聚气，安居乐业之首选。',
    hetuNumber: 4, luoshuPosition: 7, terrain: '盆地平原', waterSystem: '岷江/都江堰',
  },
  {
    name: '重庆', province: '重庆', direction: '西', element: '金',
    features: ['山城', '火锅之都', '雾都', '西部中心'],
    climate: '亚热带', industry: ['汽车', '电���', '装备', '材料'],
    fengshui: '两江交汇，群山环绕，山城之势如金钟覆地。水势环抱，旺财旺运。',
    hetuNumber: 9, luoshuPosition: 7, terrain: '山地丘陵', waterSystem: '长江/嘉陵江',
  },
  {
    name: '西安', province: '陕西', direction: '西', element: '金',
    features: ['十三朝古都', '丝路起点', '历史名城', '科教重镇'],
    climate: '温带', industry: ['航空航天', '科技', '旅游', '军工'],
    fengshui: '八水绕长安，秦岭为屏，渭水为带。帝王龙脉之首，金气凝聚之地。',
    hetuNumber: 4, luoshuPosition: 7, terrain: '关中平原', waterSystem: '渭河/灞河',
  },
  {
    name: '昆明', province: '云南', direction: '西', element: '金',
    features: ['春城', '花卉之都', '生态宜居', '民族文化'],
    climate: '高原', industry: ['旅游', '花卉', '生物', '有色金属'],
    fengshui: '滇池如镜，西山如屏，四季如春。高原之气清澈通透，利于修身养性。',
    hetuNumber: 9, luoshuPosition: 6, terrain: '高原', waterSystem: '滇池',
  },
  {
    name: '兰州', province: '甘肃', direction: '西', element: '金',
    features: ['黄河之都', '丝路重镇', '石化基地', '河谷之城'],
    climate: '温带大陆', industry: ['石化', '有色金属', '能源', '农业'],
    fengshui: '黄河穿城，两山夹峙，如金带缠腰。河谷之势收藏有力，金气沉稳。',
    hetuNumber: 4, luoshuPosition: 6, terrain: '河谷盆地', waterSystem: '黄河',
  },
  // 中央土城
  {
    name: '武汉', province: '湖北', direction: '中', element: '土',
    features: ['九省通衢', '江城', '教育重镇', '光谷'],
    climate: '亚热带', industry: ['光电子', '汽车', '教育', '生物'],
    fengshui: '长江汉水交汇，龟蛇锁江。九省通衢，中央土气汇聚，四方来朝。',
    hetuNumber: 5, luoshuPosition: 5, terrain: '江汉平原', waterSystem: '长江/汉江',
  },
  {
    name: '长沙', province: '湖南', direction: '中', element: '土',
    features: ['娱乐之都', '美食之城', '历史文化', '工程机械'],
    climate: '亚热带', industry: ['传媒', '工程机械', '文化', '食品'],
    fengshui: '岳麓山为靠，湘江北去，橘子洲头如砥柱中流。文脉昌盛，土气厚重。',
    hetuNumber: 5, luoshuPosition: 2, terrain: '丘陵盆地', waterSystem: '湘江',
  },
  {
    name: '郑州', province: '河南', direction: '中', element: '土',
    features: ['交通枢纽', '商都', '中原文化', '国家中心城市'],
    climate: '温带', industry: ['交通', '食品', '电子', '装备'],
    fengshui: '中原腹地，黄河南岸，天地之中。河图洛书发源之地，土气最为纯正。',
    hetuNumber: 5, luoshuPosition: 5, terrain: '黄淮平原', waterSystem: '黄河/贾鲁河',
  },
  {
    name: '合肥', province: '安徽', direction: '中', element: '土',
    features: ['科教之城', '创新高地', '量子中心', '新兴科技'],
    climate: '亚热带', industry: ['科技', '家电', '汽车', '新能源'],
    fengshui: '巢湖之滨，大蜀山为靠，南淝河穿城。土水相济，利于科技创新。',
    hetuNumber: 10, luoshuPosition: 5, terrain: '丘陵平原', waterSystem: '巢湖/南淝河',
  },
  {
    name: '太原', province: '山西', direction: '中', element: '土',
    features: ['龙城', '晋商故里', '能源之都', '古都文化'],
    climate: '温带', industry: ['能源', '装备', '信息技术', '旅游'],
    fengshui: '汾河穿城，东西山对峙，盆地藏风。晋阳古城，土气深厚，利于守业。',
    hetuNumber: 10, luoshuPosition: 8, terrain: '盆地', waterSystem: '汾河',
  },
]

// 河图数理与五行关系
const HETU_ELEMENT: Record<number, { element: string; desc: string }> = {
  1: { element: '水', desc: '天一生水，地六成之' },
  2: { element: '火', desc: '地二生火，天七成之' },
  3: { element: '木', desc: '天三生木，地八成之' },
  4: { element: '金', desc: '天四生金，地九成之' },
  5: { element: '土', desc: '天五生土，地十成之' },
  6: { element: '水', desc: '地六成水，与天一同宗' },
  7: { element: '火', desc: '天七成火，与地二同宗' },
  8: { element: '木', desc: '地八成木，与天三同宗' },
  9: { element: '金', desc: '地九成金，与天四同宗' },
  10: { element: '土', desc: '地十成土，与天五同宗' },
}

// 洛书九宫方位解读
const LUOSHU_DESC: Record<number, string> = {
  1: '坎位正北，主智慧聪明，利水行之人。一白贪狼，主桃花与学业。',
  2: '坤位西南，主包容厚重，利土行之人。二黑巨门，主地产与农业。',
  3: '震位正东，主生发进取，利木行之人。三碧禄存，主竞争与拼搏。',
  4: '巽位东南，主文昌学业，利木行之人。四绿文曲，主文采与艺术。',
  5: '中宫中央，主厚德载物，利土行之人。五黄廉贞，主权威与中枢。',
  6: '乾位西北，主权威刚健，利金行之人。六白武曲，主财富与地位。',
  7: '兑位正西，主口才交际，利金行之人。七赤破军，主变革与享乐。',
  8: '艮位东北，主稳固厚实，利土行之人。八白左辅，主财运与地产。',
  9: '离位正南，主光明热烈，利火行之人。九紫右弼，主喜庆与名声。',
}

// 五行相生相克 (for city matching)
const ELEMENT_GENERATE_MAP: Record<string, string[]> = {
  '金': ['水'], '水': ['木'], '木': ['火'], '火': ['土'], '土': ['金'],
}
const ELEMENT_CONTROL_MAP: Record<string, string[]> = {
  '金': ['木'], '木': ['土'], '水': ['火'], '火': ['金'], '土': ['水'],
}
const ELEMENT_GENERATED_BY: Record<string, string> = {
  '金': '土', '水': '金', '木': '水', '火': '木', '土': '火',
}

// ============================================================
// Enhanced City Recommendation
// ============================================================
export function recommendCities(bazi: BaziChart, ziwei: ReturnType<typeof calculateZiwei>): CityRecommendation[] {
  const { favorableElement, dayMasterElement, elementCounts, weakElement, shenSha, daYun, yearNayin, geJu } = bazi
  const { mainStar, stars, siHua, migrationStars } = ziwei

  const migrationMainStar = migrationStars?.find(s => s.category === '主星')
  const migrationElement = migrationMainStar?.element || favorableElement

  // Current dayun (approximate: use first one for general advice)
  const currentDaYun = daYun[2] || daYun[0] // ~20s-30s

  // Check shensha relevant to travel/migration
  const hasYiMa = shenSha.some(s => s.name === '驿马星')
  const hasJinYu = shenSha.some(s => s.name === '金舆星')
  const hasTianLuo = shenSha.some(s => s.name === '天罗地网')

  // Si Hua in migration palace
  const migrationSiHua = siHua.find(s => s.palace === '迁移宫')

  const recommendations: CityRecommendation[] = CITY_DATABASE.map(city => {
    let score = 50
    const reasons: string[] = []
    let baziMatch = ''
    let ziweiMatch = ''
    let fengshui = ''
    let hetuAnalysis = ''
    let nayinMatch = ''
    let shenShaAdvice = ''
    let daYunAdvice = ''
    let classicQuote = ''

    // ========== 1. 喜用神匹配 (30分) ==========
    if (city.element === favorableElement) {
      score += 25
      reasons.push(`城市五行属${city.element}，与喜用神完美契合`)
      baziMatch = `喜用神为${favorableElement}，${city.direction}方${city.element}气旺盛。`
    } else if (ELEMENT_GENERATE_MAP[city.element]?.includes(favorableElement)) {
      score += 15
      reasons.push(`城市${city.element}气生喜用神${favorableElement}`)
      baziMatch = `城市${city.element}行可生喜用神${favorableElement}，间接助力。`
    } else if (city.element === ELEMENT_GENERATED_BY[favorableElement]) {
      score += 12
      reasons.push(`城市被喜用神所生，气场相和`)
    }

    // ========== 2. 纳音五行匹配 (15分) ==========
    const yearNayinElement = NAYIN_TABLE[bazi.yearPillar.stem + bazi.yearPillar.branch]?.element || ''
    if (city.element === yearNayinElement) {
      score += 10
      nayinMatch = `年柱纳音${yearNayin}属${yearNayinElement}，与${city.name}${city.element}行同气相求。`
    } else if (ELEMENT_GENERATE_MAP[yearNayinElement]?.includes(city.element)) {
      score += 6
      nayinMatch = `年柱纳音${yearNayin}属${yearNayinElement}，生${city.name}${city.element}行，气场和合。`
    } else {
      nayinMatch = `年柱纳音${yearNayin}，与${city.name}五行${getElementRelation(yearNayinElement, city.element)}。`
    }

    // ========== 3. 补足五行缺失 (10分) ==========
    if (city.element === weakElement) {
      score += 8
      reasons.push(`命局${weakElement}行偏弱，此城可补${weakElement}气`)
    }

    // ========== 4. 日主与城市关系 (8分) ==========
    if (ELEMENT_GENERATE_MAP[city.element]?.includes(dayMasterElement)) {
      score += 6
      reasons.push(`${city.element}生${dayMasterElement}，城市滋养日主`)
    }
    if (ELEMENT_CONTROL_MAP[city.element]?.includes(dayMasterElement)) {
      score -= 8
      reasons.push(`${city.element}克${dayMasterElement}，需注意调和`)
    }

    // ========== 5. 紫微迁移宫匹配 (12分) ==========
    if (migrationMainStar) {
      if (city.element === migrationElement) {
        score += 10
        ziweiMatch = `迁移宫主星${migrationMainStar.name}(${migrationMainStar.brightness})属${migrationElement}，与${city.name}五行共鸣。`
      } else if (ELEMENT_GENERATE_MAP[city.element]?.includes(migrationElement)) {
        score += 5
        ziweiMatch = `迁移宫${migrationMainStar.name}属${migrationElement}，${city.name}${city.element}行可生之。`
      } else {
        ziweiMatch = `迁移宫${migrationMainStar.name}属${migrationElement}，与${city.name}${city.element}行${getElementRelation(migrationElement, city.element)}。`
      }
    }

    // 命宫主星匹配
    if (city.element === mainStar.element) {
      score += 6
      ziweiMatch += ` 命宫主星${mainStar.name}属${mainStar.element}，与此城同气。`
    }

    // ========== 6. 四化影响 (8分) ==========
    if (migrationSiHua) {
      if (migrationSiHua.transform === '化禄') {
        score += 8
        ziweiMatch += ` 迁移宫化禄，外出大利！`
      } else if (migrationSiHua.transform === '化权') {
        score += 5
        ziweiMatch += ` 迁移宫化权，外出可掌权柄。`
      } else if (migrationSiHua.transform === '化忌') {
        score -= 5
        ziweiMatch += ` 迁移宫化忌，外出需谨慎。`
      }
    }

    // ========== 7. 事业宫匹配 (6分) ==========
    const careerStar = stars.find(s => s.palace === '事业宫' && s.category === '主星')
    if (careerStar && city.element === careerStar.element) {
      score += 5
      ziweiMatch += ` 事业宫${careerStar.name}属${careerStar.element}，利于此城发展事业。`
    }

    // ========== 8. 神煞影响 (5-10分) ==========
    if (hasYiMa) {
      if (['上海', '北京', '广州', '深圳'].includes(city.name)) {
        score += 5
        shenShaAdvice = '驿马入命，利于远行。大城市交通便利，驿马得用，发展无碍。'
      } else {
        shenShaAdvice = '驿马入命，不惧远行。此城亦可作为驿马落脚之处。'
      }
    }
    if (hasJinYu) {
      score += 3
      shenShaAdvice += (shenShaAdvice ? ' ' : '') + '金舆护行，迁徙安泰。'
    }
    if (hasTianLuo && city.terrain === '盆地') {
      score -= 5
      shenShaAdvice += (shenShaAdvice ? ' ' : '') + '天罗地网临命，盆地城市气场受限，宜选开阔之地。'
    }
    if (!shenShaAdvice) {
      const relevantSha = shenSha[0]
      shenShaAdvice = relevantSha?.cityAdvice || '命格平和，各方发展皆宜。'
    }

    // ========== 9. 大运分析 (5分) ==========
    if (currentDaYun) {
      if (city.element === currentDaYun.stemElement || city.element === currentDaYun.branchElement) {
        score += 4
        daYunAdvice = `当前大运${currentDaYun.stem}${currentDaYun.branch}(${currentDaYun.nayin})，运行${currentDaYun.stemElement}${currentDaYun.branchElement}地，与${city.name}${city.element}行气场相应，此运宜行此方。`
      } else {
        daYunAdvice = `当前大运${currentDaYun.stem}${currentDaYun.branch}(${currentDaYun.nayin})，${currentDaYun.desc}`
      }
    }

    // ========== 10. 河图洛书分析 (5分) ==========
    const hetuInfo = HETU_ELEMENT[city.hetuNumber]
    if (hetuInfo && hetuInfo.element === favorableElement) {
      score += 4
      hetuAnalysis = `${city.name}河图数为${city.hetuNumber}，${hetuInfo.desc}。与喜用神${favorableElement}相应。`
    } else if (hetuInfo) {
      hetuAnalysis = `${city.name}河图数为${city.hetuNumber}，${hetuInfo.desc}。`
    }
    const luoshuInfo = LUOSHU_DESC[city.luoshuPosition]
    if (luoshuInfo) {
      hetuAnalysis += ` 洛书九宫居${city.luoshuPosition}宫，${luoshuInfo}`
    }

    // ========== 11. 风水格局 ==========
    fengshui = city.fengshui

    // ========== 12. 格局适配 (5分) ==========
    if (geJu.name === '正官格' && ['北京', '南京', '西安'].includes(city.name)) {
      score += 4
      classicQuote = '正官格宜居政治文化中心，"学而优则仕"，此城利于仕途发展。'
    } else if (geJu.name === '七杀格' && ['深圳', '上海', '成都'].includes(city.name)) {
      score += 4
      classicQuote = '七杀格宜居创新开拓之城，"将在外，君命有所不受"，此城利于创业。'
    } else if (geJu.name === '食神格' && ['杭州', '成都', '厦门'].includes(city.name)) {
      score += 4
      classicQuote = '食神格宜居山水秀美之城，"食神有气胜财官"，此城利于享受生活。'
    } else if (geJu.name === '正印格' && ['北京', '南京', '武汉'].includes(city.name)) {
      score += 4
      classicQuote = '印格宜居��教重镇，"印绶扶身最为吉祥"，此城利于学术发展。'
    } else if (geJu.name === '正财格' && ['上海', '广州', '深圳'].includes(city.name)) {
      score += 3
      classicQuote = '财格宜居商贸中心，"财为养命之源"，此城利于财运亨通。'
    }

    if (!classicQuote) {
      const quotes: Record<string, string> = {
        '北': '《易》曰：坎为水，水流���方。北方水地，利于智慧之人。',
        '南': '《易》曰：离为火，附丽于物。南方火地，利于热情之人。',
        '东': '《易》曰：震为雷，动万物者。东方木地，利于进取之人。',
        '西': '《易》曰：兑为泽，说万物者。西方金地，利于果断之人。',
        '中': '《易》曰：坤为地，厚载万物。中央土地，利于包容之人。',
      }
      classicQuote = quotes[city.direction] || ''
    }

    // ========== 13. 职业产业匹配 (10分) ==========
    let careerMatch = ''
    const career = bazi.career
    if (career) {
      // 城市产业与命主适合行业的交叉匹配
      const cityIndustryKeywords = city.industry.join('、')
      const matchedIndustries = career.industries.filter(ind => {
        return city.industry.some(ci => {
          // 模糊匹配关键词
          const indKeys = ind.split(/[、/]/)
          return indKeys.some(k => ci.includes(k.slice(0, 2)) || k.includes(ci.slice(0, 2)))
        })
      })

      if (matchedIndustries.length >= 2) {
        score += 8
        careerMatch = `${city.name}产业（${cityIndustryKeywords}）与您的命理适合行业高度吻合。匹配行业：${matchedIndustries.slice(0, 3).join('、')}。宜在此城发展事业。`
      } else if (matchedIndustries.length === 1) {
        score += 4
        careerMatch = `${city.name}产业中${matchedIndustries[0]}与您的命理方向契合。城市主要产业：${cityIndustryKeywords}。`
      } else {
        // 检查五行属性是否与喜用神行业匹配
        if (city.element === favorableElement) {
          careerMatch = `${city.name}五行属${city.element}，与您喜用神同气。虽产业直接匹配度一般，但${city.element}行气场有助于事业发展。城市产业：${cityIndustryKeywords}。`
        } else {
          careerMatch = `${city.name}主要产业为${cityIndustryKeywords}，建议结合自身${career.primaryDirection}方向在此城中寻找对应领域。`
        }
      }

      // 特殊城市职业适配
      const cityCareerBonus: Record<string, string[]> = {
        '北京': ['政府机关', '国企央企', '教育管理', '高等教育', '科技研发', '文化出版'],
        '上海': ['金融证券', '国际贸易', '投资理财', '银行保险', '广告营销', '外贸'],
        '深圳': ['IT科技', '科技研发', '企业创业', '电子电器', '创新', '风险投资'],
        '广州': ['国际贸易', '外贸', '社交电商', '餐饮烹饪', '零售经营', '汽车制造'],
        '杭州': ['电商', '社交电商', '传媒广告', '直播电商', '数字经济', 'IT科技'],
        '成都': ['文艺创作', '餐饮美食', '旅游休闲', '电子信息', '文化出版', '自由职业者'],
        '武汉': ['高等教育', '学术研究', '光电子', '教育培训', '医疗卫生', '生物医药'],
        '南京': ['教育培训', '学术研究', '汽车制造', '电子电器', '军事国防', '软件'],
        '西安': ['军事国防', '航空航天', '考古历史', '旅游', '科技研发', '教育'],
        '重庆': ['装备制造', '汽车制造', '建筑工程', '物流运输', '电子电器', '材料'],
      }

      const bonusIndustries = cityCareerBonus[city.name]
      if (bonusIndustries) {
        const careerBonus = career.industries.filter(ind =>
          bonusIndustries.some(bi => ind.includes(bi.slice(0, 2)) || bi.includes(ind.slice(0, 2)))
        )
        if (careerBonus.length >= 2) {
          score += 5
          careerMatch += ` ${city.name}的${bonusIndustries.slice(0, 2).join('、')}等优势产业尤其适合您。`
        }
      }
    }

    // Normalize
    score = Math.min(Math.max(score, 15), 99)

    if (!baziMatch) {
      baziMatch = `日主${dayMasterElement}，${bazi.dayMasterAnalysis.strength}。城市五行属${city.element}，${getElementRelation(city.element, dayMasterElement)}。`
    }
    if (!ziweiMatch) {
      ziweiMatch = `命宫${mainStar.name}(${mainStar.brightness})，${mainStar.meaning}。`
    }

    return {
      name: city.name,
      province: city.province,
      direction: city.direction,
      element: city.element,
      score,
      reason: reasons.join('；') || `${city.name}五行属${city.element}，方位在${city.direction}`,
      features: city.features,
      baziMatch,
      ziweiMatch,
      fengshui,
      hetuAnalysis,
      nayinMatch,
      shenShaAdvice,
      daYunAdvice,
      classicQuote,
      careerMatch,
    }
  })

  return recommendations.sort((a, b) => b.score - a.score)
}

function getElementRelation(element1: string, element2: string): string {
  if (!element1 || !element2) return '关系待定'
  if (ELEMENT_GENERATE_MAP[element1]?.includes(element2)) return `${element1}生${element2}，相生有情`
  if (ELEMENT_CONTROL_MAP[element1]?.includes(element2)) return `${element1}克${element2}，须谨慎应对`
  if (element1 === element2) return `同属${element1}，气场相应`
  if (ELEMENT_GENERATE_MAP[element2]?.includes(element1)) return `${element2}生${element1}，得气滋养`
  return `${element1}与${element2}相安无事`
}

// 五行颜色映射（适配白色主题）
export const ELEMENT_COLORS: Record<string, string> = {
  '金': '#9A7B2C',
  '木': '#2D6A3F',
  '水': '#1E5A80',
  '火': '#B03A2E',
  '土': '#8B6530',
}

export const ELEMENT_BG_COLORS: Record<string, string> = {
  '金': 'rgba(154, 123, 44, 0.08)',
  '木': 'rgba(45, 106, 63, 0.08)',
  '水': 'rgba(30, 90, 128, 0.08)',
  '火': 'rgba(176, 58, 46, 0.08)',
  '土': 'rgba(139, 101, 48, 0.08)',
}

// 十神含义导出（供组件使用）
export { TEN_GOD_MEANINGS, analyzeCareer }
