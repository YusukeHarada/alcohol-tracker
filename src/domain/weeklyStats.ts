import { WEEKLY_LIMIT_G } from '@/constants/alcohol'

type DailyRecord = {
  date: string
  totalAlcoholG: number
}

export function calcWeeklyTotal(records: DailyRecord[]): number {
  return records.reduce((sum, r) => sum + r.totalAlcoholG, 0)
}

export function countRestDays(records: DailyRecord[]): number {
  return records.filter(r => r.totalAlcoholG === 0).length
}

export function hasRestDayThisWeek(records: DailyRecord[]): boolean {
  return countRestDays(records) > 0
}

export function getConsecutiveDrinkingDays(records: DailyRecord[]): number {
  let count = 0
  for (let i = records.length - 1; i >= 0; i--) {
    if (records[i].totalAlcoholG > 0) {
      count++
    } else {
      break
    }
  }
  return count
}

export function isOverWeeklyLimit(totalG: number, limitG = WEEKLY_LIMIT_G): boolean {
  return totalG > limitG
}
