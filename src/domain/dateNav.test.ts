import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { formatDisplayDate, getPrevDate, getNextDate, isToday } from './dateNav'

// UTCとJSTで日付が割れる時刻に固定する。
// 2026-08-09T16:30:00Z は UTC では 8/9、JST では 8/10。
// CIランナーはUTCなので、ローカル時刻ベースの実装に戻ると下のテストが落ちる。
const UTC_EVENING = new Date('2026-08-09T16:30:00Z')
const JST_TODAY     = '2026-08-10'
const JST_YESTERDAY = '2026-08-09'

describe('JSTをまたぐ時刻での「今日」判定', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(UTC_EVENING)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('UTCでは前日でもJSTの日付を今日とみなす', () => {
    expect(isToday(JST_TODAY)).toBe(true)
  })

  it('UTC基準の日付は今日ではない', () => {
    expect(isToday(JST_YESTERDAY)).toBe(false)
  })

  it('JSTの今日を「今日」と表示する', () => {
    expect(formatDisplayDate(JST_TODAY)).toBe('今日')
  })

  it('JSTの前日を「昨日」と表示する', () => {
    expect(formatDisplayDate(JST_YESTERDAY)).toBe('昨日')
  })
})

describe('formatDisplayDate', () => {
  it('今日・昨日以外はM月d日（曜日）形式で返す', () => {
    expect(formatDisplayDate('2025-05-01')).toMatch(/5月1日/)
  })
})

describe('getPrevDate', () => {
  it('前日の日付文字列を返す', () => {
    expect(getPrevDate('2025-05-10')).toBe('2025-05-09')
  })

  it('月初から前月末に正しく移動する', () => {
    expect(getPrevDate('2025-05-01')).toBe('2025-04-30')
  })
})

describe('getNextDate', () => {
  it('翌日の日付文字列を返す', () => {
    expect(getNextDate('2025-05-10')).toBe('2025-05-11')
  })

  it('月末から翌月初に正しく移動する', () => {
    expect(getNextDate('2025-05-31')).toBe('2025-06-01')
  })
})
