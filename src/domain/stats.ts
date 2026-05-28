import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

type DailyRecord = {
  date: string
  totalAlcoholG: number
}

export type BarData = {
  label: string
  value: number
  isOver: boolean
}

export type TrendPoint = {
  date: string
  value: number
}

export type MonthlyStats = {
  avgG: number
  maxG: number
  restDays: number
  restRate: number
}

export function buildWeeklyBarData(records: DailyRecord[]): BarData[] {
  return records.map(r => ({
    label: format(new Date(r.date), 'E', { locale: ja }),
    value: r.totalAlcoholG,
    isOver: r.totalAlcoholG > 40,
  }))
}

export function buildMonthlyTrend(records: DailyRecord[]): TrendPoint[] {
  return records.map(r => ({
    date: r.date,
    value: r.totalAlcoholG,
  }))
}

export function calcMonthlyStats(records: DailyRecord[]): MonthlyStats {
  if (records.length === 0) {
    return { avgG: 0, maxG: 0, restDays: 0, restRate: 0 }
  }
  const restDays = records.filter(r => r.totalAlcoholG === 0).length
  const maxG = Math.max(...records.map(r => r.totalAlcoholG))
  const avgG = records.reduce((s, r) => s + r.totalAlcoholG, 0) / records.length
  const restRate = restDays / records.length
  return { avgG, maxG, restDays, restRate }
}
