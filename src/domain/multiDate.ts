/** 1回の一括記録で指定できる日数の上限。カレンダー1ヶ月分 */
export const MAX_BULK_DATES = 31

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** 選択中の日付に date を足す／外す。結果は常に昇順 */
export function toggleDate(selected: string[], date: string): string[] {
  return selected.includes(date)
    ? selected.filter(d => d !== date)
    : [...selected, date].sort()
}

/**
 * 一括記録の対象日を検証して重複を除き昇順に並べる。
 * サーバーアクションはクライアントから任意の値を受け取れるので、ここで弾く。
 */
export function normalizeTargetDates(dates: string[]): string[] {
  const unique = Array.from(new Set(dates)).sort()
  if (unique.length === 0) {
    throw new Error('対象日を1日以上指定してください')
  }
  if (unique.length > MAX_BULK_DATES) {
    throw new Error(`対象日は${MAX_BULK_DATES}日までです（受け取った日数: ${unique.length}）`)
  }
  const invalid = unique.find(d => !isValidDateString(d))
  if (invalid !== undefined) {
    throw new Error(`日付はyyyy-MM-dd形式で指定してください（受け取った値: ${invalid}）`)
  }
  return unique
}

/** 2/30 のような存在しない日も弾くため、往復変換して一致するかで判定する */
function isValidDateString(date: string): boolean {
  if (!DATE_PATTERN.test(date)) return false
  const parsed = new Date(date + 'T00:00:00Z')
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
}
