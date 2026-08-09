const JST_OFFSET_MS = 9 * 60 * 60 * 1000

/**
 * UTC基準のDateをJSTのyyyy-MM-ddに変換する。
 * Vercelのサーバーは常にUTCなので、cronから「今日」を判定するときに必要。
 * 日本にサマータイムはないため固定オフセットで正しい。
 */
export function toJstDateString(now: Date): string {
  return new Date(now.getTime() + JST_OFFSET_MS).toISOString().slice(0, 10)
}

/** yyyy-MM-dd を days 日ずらす。タイムゾーンに依存しない */
export function shiftDateString(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** yyyy-MM-dd を「8/9」形式にする。Dateを作らないのでTZの影響を受けない */
export function formatShortDate(date: string): string {
  const [, month, day] = date.split('-')
  return `${Number(month)}/${Number(day)}`
}
