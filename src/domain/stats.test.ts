import { describe, it, expect } from 'vitest'
import { buildWeeklyBarData, buildMonthlyTrend, calcMonthlyStats } from './stats'

const mockDailyRecords = [
  { date: '2025-05-01', totalAlcoholG: 20 },
  { date: '2025-05-02', totalAlcoholG: 0  },
  { date: '2025-05-03', totalAlcoholG: 35 },
  { date: '2025-05-04', totalAlcoholG: 50 },
  { date: '2025-05-05', totalAlcoholG: 0  },
  { date: '2025-05-06', totalAlcoholG: 15 },
  { date: '2025-05-07', totalAlcoholG: 25 },
]

describe('buildWeeklyBarData', () => {
  it('曜日ラベルと値の配列を返す', () => {
    const data = buildWeeklyBarData(mockDailyRecords)
    expect(data).toHaveLength(7)
    expect(data[0]).toMatchObject({ value: 20 })
  })

  it('空配列は空を返す', () => {
    expect(buildWeeklyBarData([])).toHaveLength(0)
  })
})

describe('buildMonthlyTrend', () => {
  it('日付と値のペアを返す', () => {
    const data = buildMonthlyTrend(mockDailyRecords)
    expect(data[0]).toMatchObject({ date: '2025-05-01', value: 20 })
  })
})

describe('calcMonthlyStats', () => {
  it('平均・最大・休肝日数・休肝率を返す', () => {
    const stats = calcMonthlyStats(mockDailyRecords)
    expect(stats.restDays).toBe(2)
    expect(stats.maxG).toBe(50)
    expect(stats.avgG).toBeCloseTo(20.71, 1)
    expect(stats.restRate).toBeCloseTo(2 / 7, 2)
  })

  it('空配列はゼロを返す', () => {
    const stats = calcMonthlyStats([])
    expect(stats.avgG).toBe(0)
    expect(stats.maxG).toBe(0)
    expect(stats.restDays).toBe(0)
    expect(stats.restRate).toBe(0)
  })
})
