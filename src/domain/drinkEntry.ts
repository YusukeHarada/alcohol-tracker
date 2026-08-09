/** 1回の記録操作で登録できる本数の上限。誤入力（0を余分に打つ等）を弾くための値 */
export const MAX_DRINK_COUNT = 20

export type DrinkEntry = {
  category: string
  volumeMl: number
  alcoholPercent: number
  pureAlcoholG: number
  memo: string
}

export type CountedDrinkEntry = DrinkEntry & { count?: number }

export function normalizeDrinkCount(count: number | undefined): number {
  if (count === undefined) return 1
  if (!Number.isInteger(count) || count < 1 || count > MAX_DRINK_COUNT) {
    throw new Error(`本数は1〜${MAX_DRINK_COUNT}の整数で指定してください（受け取った値: ${count}）`)
  }
  return count
}

/**
 * 本数付きの入力を1杯1件のレコードに展開する。
 * DBは「1レコード＝1杯」のままなので、本数はここで潰しきる。
 * 集計・カレンダー・統計・通知はこの前提の上に乗っているため、
 * countをDBまで持ち込まないことでそれらに影響を出さない。
 */
export function expandByCount(entries: CountedDrinkEntry[]): DrinkEntry[] {
  return entries.flatMap(({ count, ...entry }) =>
    Array.from({ length: normalizeDrinkCount(count) }, () => ({ ...entry }))
  )
}
