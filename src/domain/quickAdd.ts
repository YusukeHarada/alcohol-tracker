import { calcPureAlcohol } from './alcohol'
import { DRINK_CATEGORIES, QUICK_ADD_CHIP_COUNT } from '@/constants/alcohol'

export type QuickAddCandidate = {
  key:            string
  category:       string
  label:          string
  volumeMl:       number
  alcoholPercent: number
  pureAlcoholG:   number
  source:         'history' | 'default'
}

// 集計に必要な項目だけを要求する。DrinkRecordをそのまま渡せる
export type QuickAddSource = {
  category:       string
  volumeMl:       number
  alcoholPercent: number
  date:           string
  createdAt:      string
}

type Bucket = {
  category:       string
  volumeMl:       number
  alcoholPercent: number
  count:          number
  lastDate:       string
  lastCreatedAt:  string
}

function buildKey(category: string, volumeMl: number, alcoholPercent: number): string {
  return `${category}|${volumeMl}|${alcoholPercent}`
}

function resolveLabel(category: string): string {
  return DRINK_CATEGORIES.find(c => c.value === category)?.label ?? category
}

function toCandidate(
  category: string,
  volumeMl: number,
  alcoholPercent: number,
  source: 'history' | 'default'
): QuickAddCandidate {
  return {
    key:          buildKey(category, volumeMl, alcoholPercent),
    category,
    label:        resolveLabel(category),
    volumeMl,
    alcoholPercent,
    pureAlcoholG: calcPureAlcohol(volumeMl, alcoholPercent),
    source,
  }
}

/**
 * 過去の記録から「よく飲む組み合わせ」を頻度順に抽出する。
 *
 * 期間の絞り込みは呼び出し側（listByRange）の責務とし、この関数は
 * 現在時刻に依存しない純粋関数に保つ。
 *
 * 履歴が足りない場合はDRINK_CATEGORIESで補充するため、戻り値が空になることはない。
 */
export function buildQuickAddCandidates(
  records: QuickAddSource[],
  limit: number = QUICK_ADD_CHIP_COUNT
): QuickAddCandidate[] {
  if (limit <= 0) return []

  const buckets = new Map<string, Bucket>()

  for (const record of records) {
    // PostgRESTのnumericが文字列で来る場合に備えて正規化する
    const volumeMl       = Number(record.volumeMl)
    const alcoholPercent = Number(record.alcoholPercent)

    // 「その他」を0ml/0%のまま保存したレコードは候補として意味を成さない
    if (!(volumeMl > 0) || !(alcoholPercent > 0)) continue

    const key      = buildKey(record.category, volumeMl, alcoholPercent)
    const existing = buckets.get(key)

    if (!existing) {
      buckets.set(key, {
        category:      record.category,
        volumeMl,
        alcoholPercent,
        count:         1,
        lastDate:      record.date,
        lastCreatedAt: record.createdAt,
      })
      continue
    }

    existing.count++
    if (
      record.date > existing.lastDate ||
      (record.date === existing.lastDate && record.createdAt > existing.lastCreatedAt)
    ) {
      existing.lastDate      = record.date
      existing.lastCreatedAt = record.createdAt
    }
  }

  // 回数の多い順。同数なら直近に飲んだ方を優先する
  const fromHistory = [...buckets.values()]
    .sort((a, b) =>
      b.count - a.count ||
      b.lastDate.localeCompare(a.lastDate) ||
      b.lastCreatedAt.localeCompare(a.lastCreatedAt)
    )
    .slice(0, limit)
    .map(b => toCandidate(b.category, b.volumeMl, b.alcoholPercent, 'history'))

  if (fromHistory.length >= limit) return fromHistory

  // 履歴が足りない分はデフォルトの飲み物で埋める（初回利用時に空にしないため）
  const seen       = new Set(fromHistory.map(c => c.key))
  const candidates = [...fromHistory]

  for (const c of DRINK_CATEGORIES) {
    if (candidates.length >= limit) break
    if (c.value === 'other') continue
    const key = buildKey(c.value, c.defaultMl, c.defaultPercent)
    if (seen.has(key)) continue
    seen.add(key)
    candidates.push(toCandidate(c.value, c.defaultMl, c.defaultPercent, 'default'))
  }

  return candidates
}
