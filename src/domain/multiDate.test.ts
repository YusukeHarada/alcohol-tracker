import { describe, it, expect } from 'vitest'
import { toggleDate, normalizeTargetDates, MAX_BULK_DATES } from './multiDate'
import { shiftDateString } from './jstDate'

describe('toggleDate', () => {
  it('未選択の日は追加され、昇順に並ぶ', () => {
    expect(toggleDate(['2026-10-05'], '2026-10-01')).toEqual(['2026-10-01', '2026-10-05'])
  })

  it('選択済みの日は外れる', () => {
    expect(toggleDate(['2026-10-01', '2026-10-05'], '2026-10-01')).toEqual(['2026-10-05'])
  })
})

describe('normalizeTargetDates', () => {
  it('重複を除いて昇順に並べる', () => {
    expect(normalizeTargetDates(['2026-10-03', '2026-10-01', '2026-10-03']))
      .toEqual(['2026-10-01', '2026-10-03'])
  })

  it('空は弾く', () => {
    expect(() => normalizeTargetDates([])).toThrow()
  })

  it('上限までは通し、超えたら弾く', () => {
    const dates = Array.from({ length: MAX_BULK_DATES + 1 }, (_, i) =>
      shiftDateString('2026-01-01', i)
    )
    expect(normalizeTargetDates(dates.slice(0, MAX_BULK_DATES))).toHaveLength(MAX_BULK_DATES)
    expect(() => normalizeTargetDates(dates)).toThrow()
  })

  it('形式が違う日付は弾く', () => {
    expect(() => normalizeTargetDates(['2026/10/01'])).toThrow()
    expect(() => normalizeTargetDates(['2026-13-01'])).toThrow()
    expect(() => normalizeTargetDates(['2026-02-30'])).toThrow()
  })
})
