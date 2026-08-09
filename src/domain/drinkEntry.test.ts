import { describe, it, expect } from 'vitest'
import { expandByCount, normalizeDrinkCount, MAX_DRINK_COUNT } from './drinkEntry'
import type { CountedDrinkEntry } from './drinkEntry'

const beer: CountedDrinkEntry = {
  category: 'beer', volumeMl: 500, alcoholPercent: 5, pureAlcoholG: 20, memo: '',
}
const sake: CountedDrinkEntry = {
  category: 'sake', volumeMl: 180, alcoholPercent: 15, pureAlcoholG: 21.6, memo: '',
}

describe('normalizeDrinkCount', () => {
  it('未指定は1本として扱う', () => {
    expect(normalizeDrinkCount(undefined)).toBe(1)
  })

  it('上限までは通す', () => {
    expect(normalizeDrinkCount(1)).toBe(1)
    expect(normalizeDrinkCount(MAX_DRINK_COUNT)).toBe(MAX_DRINK_COUNT)
  })

  it('0以下は弾く', () => {
    expect(() => normalizeDrinkCount(0)).toThrow()
    expect(() => normalizeDrinkCount(-1)).toThrow()
  })

  it('上限超えは弾く', () => {
    expect(() => normalizeDrinkCount(MAX_DRINK_COUNT + 1)).toThrow()
  })

  it('整数でない値は弾く', () => {
    expect(() => normalizeDrinkCount(1.5)).toThrow()
    expect(() => normalizeDrinkCount(NaN)).toThrow()
  })
})

describe('expandByCount', () => {
  it('本数のぶんだけレコードに展開する', () => {
    const result = expandByCount([{ ...beer, count: 3 }])
    expect(result).toHaveLength(3)
    expect(result.every(r => r.category === 'beer' && r.pureAlcoholG === 20)).toBe(true)
  })

  it('展開後のレコードにcountを残さない', () => {
    const [first] = expandByCount([{ ...beer, count: 2 }])
    expect(first).not.toHaveProperty('count')
  })

  it('本数未指定は1件になる', () => {
    expect(expandByCount([beer])).toHaveLength(1)
  })

  it('複数種類をまとめて展開できる（テンプレート適用の経路）', () => {
    const result = expandByCount([{ ...beer, count: 2 }, sake])
    expect(result.map(r => r.category)).toEqual(['beer', 'beer', 'sake'])
  })

  it('空配列は空配列を返す', () => {
    expect(expandByCount([])).toEqual([])
  })

  it('1件でも不正な本数があれば全体を弾く', () => {
    expect(() => expandByCount([beer, { ...sake, count: 0 }])).toThrow()
  })
})
