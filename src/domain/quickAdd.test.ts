import { describe, it, expect } from 'vitest'
import { buildQuickAddCandidates, type QuickAddSource } from './quickAdd'

function rec(over: Partial<QuickAddSource> = {}): QuickAddSource {
  return {
    category:       'beer',
    volumeMl:       500,
    alcoholPercent: 5,
    date:           '2026-08-01',
    createdAt:      '2026-08-01T12:00:00Z',
    ...over,
  }
}

describe('buildQuickAddCandidates', () => {
  it('出現回数の多い組み合わせが先頭に来る', () => {
    const records = [
      rec({ category: 'beer' }),
      rec({ category: 't-hi', volumeMl: 500, alcoholPercent: 7 }),
      rec({ category: 't-hi', volumeMl: 500, alcoholPercent: 7 }),
      rec({ category: 't-hi', volumeMl: 500, alcoholPercent: 7 }),
    ]
    const result = buildQuickAddCandidates(records)
    expect(result[0].category).toBe('t-hi')
    expect(result[1].category).toBe('beer')
  })

  it('同じ種類でも容量・度数が違えば別候補になる', () => {
    const records = [
      rec({ category: 'beer', volumeMl: 500 }),
      rec({ category: 'beer', volumeMl: 350 }),
    ]
    const result = buildQuickAddCandidates(records)
    const beers  = result.filter(c => c.source === 'history')
    expect(beers).toHaveLength(2)
    expect(beers.map(c => c.volumeMl).sort()).toEqual([350, 500])
  })

  it('同回数なら直近の日付が先に来る', () => {
    const records = [
      rec({ category: 'beer', date: '2026-08-01' }),
      rec({ category: 'sake', volumeMl: 180, alcoholPercent: 15, date: '2026-08-05' }),
    ]
    const result = buildQuickAddCandidates(records)
    expect(result[0].category).toBe('sake')
  })

  it('同日同回数なら createdAt が新しい方が先に来る', () => {
    const records = [
      rec({ category: 'beer', date: '2026-08-01', createdAt: '2026-08-01T10:00:00Z' }),
      rec({
        category: 'sake', volumeMl: 180, alcoholPercent: 15,
        date: '2026-08-01', createdAt: '2026-08-01T20:00:00Z',
      }),
    ]
    const result = buildQuickAddCandidates(records)
    expect(result[0].category).toBe('sake')
  })

  it('履歴が空でもデフォルトの候補が4件返る', () => {
    const result = buildQuickAddCandidates([])
    expect(result).toHaveLength(4)
    expect(result.every(c => c.source === 'default')).toBe(true)
    expect(result[0]).toMatchObject({ category: 't-hi', label: '宝ハイボール', volumeMl: 500 })
    expect(result.some(c => c.category === 'other')).toBe(false)
  })

  it('履歴が足りない分はデフォルトで補充され、履歴と重複しない', () => {
    const records = [rec({ category: 'beer', volumeMl: 500, alcoholPercent: 5 })]
    const result  = buildQuickAddCandidates(records)

    expect(result).toHaveLength(4)
    expect(result[0]).toMatchObject({ category: 'beer', source: 'history' })
    // beer 500ml/5% はデフォルトにも存在するが重複させない
    expect(result.filter(c => c.key === 'beer|500|5')).toHaveLength(1)
  })

  it('候補が多くても limit 件で打ち切る', () => {
    const records = [
      rec({ category: 'beer' }),
      rec({ category: 'sake',    volumeMl: 180, alcoholPercent: 15 }),
      rec({ category: 'wine',    volumeMl: 120, alcoholPercent: 12 }),
      rec({ category: 'whiskey', volumeMl: 60,  alcoholPercent: 40 }),
      rec({ category: 'chu-hi',  volumeMl: 350, alcoholPercent: 5  }),
    ]
    expect(buildQuickAddCandidates(records)).toHaveLength(4)
    expect(buildQuickAddCandidates(records, 2)).toHaveLength(2)
  })

  it('pureAlcoholG が計算式と一致する', () => {
    const result = buildQuickAddCandidates([
      rec({ category: 't-hi', volumeMl: 500, alcoholPercent: 7 }),
    ])
    expect(result[0].pureAlcoholG).toBeCloseTo(28, 5)
  })

  it('容量0・度数0のレコードは候補にならない', () => {
    const records = [
      rec({ category: 'other', volumeMl: 0, alcoholPercent: 0 }),
      rec({ category: 'beer',  volumeMl: 500, alcoholPercent: 0 }),
    ]
    const result = buildQuickAddCandidates(records)
    expect(result.every(c => c.source === 'default')).toBe(true)
  })

  it('未知の種類はラベルに category 文字列をそのまま使う', () => {
    const result = buildQuickAddCandidates([
      rec({ category: 'highball-x', volumeMl: 350, alcoholPercent: 9 }),
    ])
    expect(result[0].label).toBe('highball-x')
  })

  it('数値が文字列で来ても正しく集計する', () => {
    const records = [
      { ...rec(), volumeMl: '500' as unknown as number },
      rec({ volumeMl: 500 }),
    ]
    const result = buildQuickAddCandidates(records)
    expect(result.filter(c => c.source === 'history')).toHaveLength(1)
    expect(result[0].volumeMl).toBe(500)
  })
})
