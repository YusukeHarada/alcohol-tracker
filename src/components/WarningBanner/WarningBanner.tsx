import {
  DAILY_LIMIT_G,
  WEEKLY_LIMIT_G,
  CONSECUTIVE_ALERT_DAYS,
} from '@/constants/alcohol'

type Props = {
  dailyTotalG: number
  weeklyTotalG: number
  consecutiveDays: number
  hasRestDayThisWeek: boolean
}

export function WarningBanner({
  dailyTotalG,
  weeklyTotalG,
  consecutiveDays,
  hasRestDayThisWeek,
}: Props) {
  const warnings: string[] = []

  if (dailyTotalG > DAILY_LIMIT_G)
    warnings.push('今日の飲酒量が推奨値を超えています')
  if (weeklyTotalG > WEEKLY_LIMIT_G)
    warnings.push('今週の飲酒量が推奨値を超えています')
  if (!hasRestDayThisWeek)
    warnings.push('今週まだ休肝日がありません')
  if (consecutiveDays >= CONSECUTIVE_ALERT_DAYS)
    warnings.push(`${consecutiveDays}日連続で飲酒しています`)

  if (warnings.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-sm font-medium text-red-700 mb-2">注意</p>
      <ul className="space-y-1">
        {warnings.map((w, i) => (
          <li key={i} className="text-sm text-red-600">{w}</li>
        ))}
      </ul>
    </div>
  )
}
