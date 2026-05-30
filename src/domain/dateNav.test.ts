import { describe, it, expect } from 'vitest'
import { formatDisplayDate, getPrevDate, getNextDate, isToday } from './dateNav'

describe('formatDisplayDate', () => {
  it('今日の日付を「今日」と表示する', () => {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    expect(formatDisplayDate(dateStr)).toBe('今日')
  })

  it('昨日の日付を「昨日」と表示する', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
    expect(formatDisplayDate(dateStr)).toBe('昨日')
  })

  it('それ以外はM月d日（曜日）形式で返す', () => {
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

describe('isToday', () => {
  it('今日の日付はtrueを返す', () => {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    expect(isToday(dateStr)).toBe(true)
  })

  it('昨日の日付はfalseを返す', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
    expect(isToday(dateStr)).toBe(false)
  })
})