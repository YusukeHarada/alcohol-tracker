import { describe, it, expect } from 'vitest'
import { toJstDateString, shiftDateString, formatShortDate } from './jstDate'

describe('toJstDateString', () => {
  it('cron実行時刻（12:00 UTC）はJSTでも同じ日付', () => {
    expect(toJstDateString(new Date('2026-08-09T12:00:00Z'))).toBe('2026-08-09')
  })

  it('JST 23:59:59 はまだ当日', () => {
    expect(toJstDateString(new Date('2026-08-09T14:59:59Z'))).toBe('2026-08-09')
  })

  it('JST 0:00 で翌日に変わる', () => {
    expect(toJstDateString(new Date('2026-08-09T15:00:00Z'))).toBe('2026-08-10')
  })

  it('UTCでは前日でもJSTでは翌日になる（UTC 深夜帯）', () => {
    expect(toJstDateString(new Date('2026-08-09T16:30:00Z'))).toBe('2026-08-10')
  })
})

describe('shiftDateString', () => {
  it('月とうるう年をまたいで遡れる', () => {
    expect(shiftDateString('2026-03-01', -6)).toBe('2026-02-23')
    expect(shiftDateString('2024-03-01', -1)).toBe('2024-02-29')
  })

  it('年をまたいで進める', () => {
    expect(shiftDateString('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('0日ずらすと同じ日付', () => {
    expect(shiftDateString('2026-08-09', 0)).toBe('2026-08-09')
  })
})

describe('formatShortDate', () => {
  it('ゼロ埋めを外して 8/9 形式にする', () => {
    expect(formatShortDate('2026-08-09')).toBe('8/9')
    expect(formatShortDate('2026-12-25')).toBe('12/25')
  })
})
