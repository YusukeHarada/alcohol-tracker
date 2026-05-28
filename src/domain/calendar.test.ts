import { describe, it, expect } from 'vitest'
import { buildCalendarDays, getDayStatus } from './calendar'

describe('buildCalendarDays', () => {
  it('2025年5月は31日分返す', () => {
    expect(buildCalendarDays(2025, 5)).toHaveLength(31)
  })

  it('最初の要素は2025-05-01', () => {
    expect(buildCalendarDays(2025, 5)[0]).toBe('2025-05-01')
  })

  it('最後の要素は2025-05-31', () => {
    const days = buildCalendarDays(2025, 5)
    expect(days[days.length - 1]).toBe('2025-05-31')
  })

  it('2025年2月は28日分返す', () => {
    expect(buildCalendarDays(2025, 2)).toHaveLength(28)
  })
})

describe('getDayStatus', () => {
  it('データなしはempty', () => {
    expect(getDayStatus(null)).toBe('empty')
  })

  it('休肝日はrest', () => {
    expect(getDayStatus({ totalAlcoholG: 0, isRestDay: true })).toBe('rest')
  })

  it('40g超はover', () => {
    expect(getDayStatus({ totalAlcoholG: 40.1, isRestDay: false })).toBe('over')
  })

  it('40g以下の飲酒日はdrinking', () => {
    expect(getDayStatus({ totalAlcoholG: 20, isRestDay: false })).toBe('drinking')
  })
})
