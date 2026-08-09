import { describe, it, expect } from 'vitest'
import { buildWarnings } from './warnings'
import { DAILY_LIMIT_G, WEEKLY_LIMIT_G } from '@/constants/alcohol'
import type { UserGoal } from '@/lib/types'

const goal: UserGoal = {
  id: 'g1', userId: 'u1', dailyLimitG: 20, weeklyRestDays: 2, weeklyLimitG: 200,
}

const quiet = {
  dailyTotalG: 0,
  weeklyTotalG: 0,
  consecutiveDays: 0,
  hasRestDayThisWeek: true,
  goal: null,
}

describe('buildWarnings', () => {
  it('問題がなければ何も出さない', () => {
    expect(buildWarnings(quiet)).toEqual([])
  })

  it('目標が未設定なら定数をしきい値に使う', () => {
    expect(buildWarnings({ ...quiet, dailyTotalG: DAILY_LIMIT_G + 1 })).toHaveLength(1)
    expect(buildWarnings({ ...quiet, dailyTotalG: DAILY_LIMIT_G })).toEqual([])
    expect(buildWarnings({ ...quiet, weeklyTotalG: WEEKLY_LIMIT_G + 1 })).toHaveLength(1)
  })

  it('目標が設定されていれば定数ではなく目標値で判定する', () => {
    // 定数(40g)は下回るが、ユーザーの目標(20g)は超えている
    const warnings = buildWarnings({ ...quiet, goal, dailyTotalG: 30 })
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('20g')
  })

  it('目標を緩めれば定数を超えていても警告しない', () => {
    // 定数(280g)は超えるが、ユーザーの目標(400g)には収まっている
    const loose: UserGoal = { ...goal, dailyLimitG: 100, weeklyLimitG: 400 }
    expect(buildWarnings({ ...quiet, goal: loose, weeklyTotalG: 300 })).toEqual([])
  })

  it('上限ちょうどは警告しない', () => {
    expect(buildWarnings({ ...quiet, goal, dailyTotalG: 20, weeklyTotalG: 200 })).toEqual([])
  })

  it('休肝日が無ければ警告する', () => {
    expect(buildWarnings({ ...quiet, hasRestDayThisWeek: false }))
      .toEqual(['直近7日に休肝日がありません'])
  })

  it('連続飲酒日数が閾値に達したら警告する', () => {
    const warnings = buildWarnings({ ...quiet, consecutiveDays: 3 })
    expect(warnings).toEqual(['3日連続で飲酒しています'])
  })

  it('複数該当すればすべて返す', () => {
    const warnings = buildWarnings({
      dailyTotalG: 50, weeklyTotalG: 500, consecutiveDays: 5,
      hasRestDayThisWeek: false, goal,
    })
    expect(warnings).toHaveLength(4)
  })
})
