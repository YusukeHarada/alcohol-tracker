import { format, getDaysInMonth } from 'date-fns'
import { DAILY_LIMIT_G } from '@/constants/alcohol'

export type DayStatus = 'empty' | 'rest' | 'drinking' | 'over'

type SummaryLike = {
  totalAlcoholG: number
  isRestDay: boolean
} | null

export function buildCalendarDays(year: number, month: number): string[] {
  const count = getDaysInMonth(new Date(year, month - 1))
  return Array.from({ length: count }, (_, i) => {
    return format(new Date(year, month - 1, i + 1), 'yyyy-MM-dd')
  })
}

export function getDayStatus(summary: SummaryLike): DayStatus {
  if (!summary) return 'empty'
  if (summary.isRestDay) return 'rest'
  if (summary.totalAlcoholG > DAILY_LIMIT_G) return 'over'
  return 'drinking'
}
