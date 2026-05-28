import { DAILY_LIMIT_G } from '@/constants/alcohol'

export function calcPureAlcohol(volumeMl: number, alcoholPercent: number): number {
  if (volumeMl < 0 || alcoholPercent < 0) {
    throw new Error('負の値は不正です')
  }
  return volumeMl * (alcoholPercent / 100) * 0.8
}

export function calcDailyTotal(records: { pureAlcoholG: number }[]): number {
  return records.reduce((sum, r) => sum + r.pureAlcoholG, 0)
}

export function isOverDailyLimit(totalG: number, limitG = DAILY_LIMIT_G): boolean {
  return totalG > limitG
}

export function isRestDay(records: { pureAlcoholG: number }[]): boolean {
  return records.length === 0
}
