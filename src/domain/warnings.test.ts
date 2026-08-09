import { describe, it, expect } from 'vitest'
import { buildWarnings, selectWarning } from './warnings'
import { DAILY_LIMIT_G, WEEKLY_LIMIT_G } from '@/constants/alcohol'
import type { UserGoal } from '@/lib/types'

const goal: UserGoal = {
  id: 'g1', userId: 'u1', dailyLimitG: 20, weeklyRestDays: 2, weeklyLimitG: 200,
}

/** 何も警告が出ない状態 */
const quiet = {
  dailyTotalG:     0,
  weeklyTotalG:    0,
  weeklyRestDays:  2,
  consecutiveDays: 0,
  goal,
}

describe('しきい値', () => {
  it('問題がなければ何も出さない', () => {
    expect(selectWarning(quiet)).toBeNull()
  })

  it('目標が未設定なら定数をしきい値に使う', () => {
    const noGoal = { ...quiet, goal: null }
    expect(selectWarning({ ...noGoal, dailyTotalG: DAILY_LIMIT_G })).toBeNull()
    expect(selectWarning({ ...noGoal, dailyTotalG: DAILY_LIMIT_G + 1 })?.key).toBe('dailyOver')
    expect(selectWarning({ ...noGoal, weeklyTotalG: WEEKLY_LIMIT_G + 1 })?.key).toBe('weeklyOver')
  })

  it('目標が設定されていれば定数ではなく目標値で判定する', () => {
    // 定数(40g)は下回るが、ユーザーの目標(20g)は超えている
    const warning = selectWarning({ ...quiet, dailyTotalG: 30 })
    expect(warning?.key).toBe('dailyOver')
    expect(warning?.message).toContain('20g')
  })

  it('目標を緩めれば定数を超えていても警告しない', () => {
    const loose: UserGoal = { ...goal, dailyLimitG: 100, weeklyLimitG: 400 }
    expect(selectWarning({ ...quiet, goal: loose, weeklyTotalG: 300 })).toBeNull()
  })

  it('上限ちょうどは警告しない', () => {
    expect(selectWarning({ ...quiet, dailyTotalG: 20, weeklyTotalG: 200 })).toBeNull()
  })
})

describe('休肝日の不足', () => {
  it('目標の休肝日数に届いていなければ警告する', () => {
    const warning = selectWarning({ ...quiet, weeklyRestDays: 1 })
    expect(warning?.key).toBe('restDayShort')
    expect(warning?.message).toBe('直近7日の休肝日が1日です（目標2日）')
  })

  it('目標を満たしていれば警告しない', () => {
    expect(selectWarning({ ...quiet, weeklyRestDays: 2 })).toBeNull()
    expect(selectWarning({ ...quiet, weeklyRestDays: 3 })).toBeNull()
  })

  it('目標未設定なら休肝日が0日のときだけ警告する', () => {
    const noGoal = { ...quiet, goal: null }
    expect(selectWarning({ ...noGoal, weeklyRestDays: 1 })).toBeNull()
    expect(selectWarning({ ...noGoal, weeklyRestDays: 0 })?.key).toBe('restDayShort')
  })
})

describe('優先度', () => {
  const everything = {
    dailyTotalG:     50,
    weeklyTotalG:    500,
    weeklyRestDays:  0,
    consecutiveDays: 7,
    goal,
  }

  it('すべて該当しても表示は1件だけ', () => {
    expect(buildWarnings(everything)).toHaveLength(4)
    expect(selectWarning(everything)?.key).toBe('weeklyOver')
  })

  it('重い順に並ぶ', () => {
    expect(buildWarnings(everything).map(w => w.key)).toEqual([
      'weeklyOver', 'dailyOver', 'consecutive', 'restDayShort',
    ])
  })

  it('週の上限内なら日の上限超過が最優先になる', () => {
    expect(selectWarning({ ...everything, weeklyTotalG: 100 })?.key).toBe('dailyOver')
  })

  it('上限内なら連続飲酒が休肝日不足より優先される', () => {
    const inLimit = { ...everything, dailyTotalG: 10, weeklyTotalG: 100 }
    expect(selectWarning(inLimit)?.key).toBe('consecutive')
  })

  it('連続日数が閾値未満なら休肝日不足が出る', () => {
    const inLimit = {
      ...everything, dailyTotalG: 10, weeklyTotalG: 100,
      consecutiveDays: 2, weeklyRestDays: 1,
    }
    expect(selectWarning(inLimit)?.key).toBe('restDayShort')
  })
})

describe('深刻度', () => {
  it('上限超過はalert、習慣の警告はcaution', () => {
    expect(selectWarning({ ...quiet, weeklyTotalG: 500 })?.level).toBe('alert')
    expect(selectWarning({ ...quiet, dailyTotalG: 50 })?.level).toBe('alert')
    expect(selectWarning({ ...quiet, consecutiveDays: 3 })?.level).toBe('caution')
    expect(selectWarning({ ...quiet, weeklyRestDays: 0 })?.level).toBe('caution')
  })
})
