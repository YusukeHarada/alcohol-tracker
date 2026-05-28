import { describe, it, expect } from 'vitest'
import {
  calcWeeklyTotal,
  countRestDays,
  hasRestDayThisWeek,
  getConsecutiveDrinkingDays,
  isOverWeeklyLimit,
} from './weeklyStats'

const mockRecords = [
  { date: '2025-05-19', totalAlcoholG: 20 },
  { date: '2025-05-20', totalAlcoholG: 0  },
  { date: '2025-05-21', totalAlcoholG: 35 },
  { date: '2025-05-22', totalAlcoholG: 40 },
  { date: '2025-05-23', totalAlcoholG: 60 },
  { date: '2025-05-24', totalAlcoholG: 0  },
  { date: '2025-05-25', totalAlcoholG: 25 },
]

describe('calcWeeklyTotal', () => {
  it('週の純アルコール合計を返す', () => {
    expect(calcWeeklyTotal(mockRecords)).toBeCloseTo(180, 1)
  })

  it('空配列は0を返す', () => {
    expect(calcWeeklyTotal([])).toBe(0)
  })
})

describe('countRestDays', () => {
  it('totalAlcoholGが0の日数を返す', () => {
    expect(countRestDays(mockRecords)).toBe(2)
  })

  it('全日飲酒は0を返す', () => {
    const all = mockRecords.map(r => ({ ...r, totalAlcoholG: 20 }))
    expect(countRestDays(all)).toBe(0)
  })
})

describe('hasRestDayThisWeek', () => {
  it('休肝日が1日以上あればtrue', () => {
    expect(hasRestDayThisWeek(mockRecords)).toBe(true)
  })

  it('休肝日がなければfalse', () => {
    const all = mockRecords.map(r => ({ ...r, totalAlcoholG: 20 }))
    expect(hasRestDayThisWeek(all)).toBe(false)
  })
})

describe('getConsecutiveDrinkingDays', () => {
  it('末尾から連続飲酒日数を返す', () => {
    expect(getConsecutiveDrinkingDays(mockRecords)).toBe(1)
  })

  it('末尾3日連続飲酒なら3を返す', () => {
    const records = [
      { date: '2025-05-23', totalAlcoholG: 60 },
      { date: '2025-05-24', totalAlcoholG: 20 },
      { date: '2025-05-25', totalAlcoholG: 25 },
    ]
    expect(getConsecutiveDrinkingDays(records)).toBe(3)
  })

  it('空配列は0を返す', () => {
    expect(getConsecutiveDrinkingDays([])).toBe(0)
  })
})

describe('isOverWeeklyLimit', () => {
  it('280g以下はfalse', () => {
    expect(isOverWeeklyLimit(280)).toBe(false)
  })

  it('280gを超えるとtrue', () => {
    expect(isOverWeeklyLimit(280.1)).toBe(true)
  })
})
