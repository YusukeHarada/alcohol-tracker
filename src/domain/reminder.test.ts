import { describe, it, expect } from 'vitest'
import { buildReminderMessage, type ReminderState } from './reminder'
import type { UserGoal } from '@/lib/types'

const APP_URL = 'https://alcohol-tracker.example.com/'

const goal: UserGoal = {
  id: 'g1', userId: 'u1', dailyLimitG: 40, weeklyRestDays: 2, weeklyLimitG: 200,
}

function state(over: Partial<ReminderState> = {}): ReminderState {
  return {
    date:                '2026-08-09',
    hasRecords:          false,
    isRegisteredRestDay: false,
    weeklyTotalG:        92.34,
    weeklyRestDays:      1,
    goal:                null,
    ...over,
  }
}

describe('buildReminderMessage', () => {
  it('当日に記録があれば送らない', () => {
    expect(buildReminderMessage(state({ hasRecords: true }), APP_URL)).toBeNull()
  })

  it('休肝日として登録済みなら送らない', () => {
    expect(buildReminderMessage(state({ isRegisteredRestDay: true }), APP_URL)).toBeNull()
  })

  it('未記録なら日付・週サマリ・リンクを含むメッセージを返す', () => {
    const message = buildReminderMessage(state(), APP_URL)
    expect(message).not.toBeNull()
    expect(message).toContain('8/9 の記録がまだです')
    expect(message).toContain('合計 92.3g')
    expect(message).toContain('休肝日 1日')
    expect(message).toContain(APP_URL)
  })

  it('目標が未設定なら目標行も警告行も出さない', () => {
    const message = buildReminderMessage(state({ goal: null }), APP_URL)!
    expect(message).not.toContain('目標:')
    expect(message).not.toContain('⚠️')
  })

  it('目標があり上限内なら目標行だけ出す', () => {
    const message = buildReminderMessage(state({ goal, weeklyTotalG: 92.34 }), APP_URL)!
    expect(message).toContain('目標: 週 200g以下 ／ 休肝日 2日以上')
    expect(message).not.toContain('⚠️')
  })

  it('週の上限を超えていれば警告行を出す', () => {
    const message = buildReminderMessage(state({ goal, weeklyTotalG: 250 }), APP_URL)!
    expect(message).toContain('⚠️ 週の上限を超えています')
  })

  it('g は小数第1位まで表示する', () => {
    const message = buildReminderMessage(state({ weeklyTotalG: 92.34 }), APP_URL)!
    expect(message).toContain('92.3g')
    expect(message).not.toContain('92.34')
  })
})
