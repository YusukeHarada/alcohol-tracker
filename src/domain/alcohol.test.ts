import { describe, it, expect } from 'vitest'
import {
  calcPureAlcohol,
  calcDailyTotal,
  isOverDailyLimit,
  isRestDay,
} from './alcohol'

describe('calcPureAlcohol', () => {
  it('ビール500ml 5%で約20gになる', () => {
    expect(calcPureAlcohol(500, 5)).toBeCloseTo(20, 1)
  })

  it('日本酒180ml 15%で約21.6gになる', () => {
    expect(calcPureAlcohol(180, 15)).toBeCloseTo(21.6, 1)
  })

  it('容量0は0を返す', () => {
    expect(calcPureAlcohol(0, 5)).toBe(0)
  })

  it('度数0は0を返す', () => {
    expect(calcPureAlcohol(500, 0)).toBe(0)
  })

  it('負の値は例外を投げる', () => {
    expect(() => calcPureAlcohol(-1, 5)).toThrow()
    expect(() => calcPureAlcohol(500, -1)).toThrow()
  })
})

describe('calcDailyTotal', () => {
  it('複数レコードの純アルコール量を合計する', () => {
    const records = [
      { pureAlcoholG: 20 },
      { pureAlcoholG: 21.6 },
    ]
    expect(calcDailyTotal(records)).toBeCloseTo(41.6, 1)
  })

  it('空配列は0を返す', () => {
    expect(calcDailyTotal([])).toBe(0)
  })
})

describe('isOverDailyLimit', () => {
  it('40g以下はfalse', () => {
    expect(isOverDailyLimit(40)).toBe(false)
  })

  it('40gを超えるとtrue', () => {
    expect(isOverDailyLimit(40.1)).toBe(true)
  })

  it('カスタム上限を指定できる', () => {
    expect(isOverDailyLimit(30, 30)).toBe(false)
    expect(isOverDailyLimit(30.1, 30)).toBe(true)
  })
})

describe('isRestDay', () => {
  it('レコードなしは休肝日', () => {
    expect(isRestDay([])).toBe(true)
  })

  it('レコードありは飲酒日', () => {
    expect(isRestDay([{ pureAlcoholG: 20 }])).toBe(false)
  })
})
