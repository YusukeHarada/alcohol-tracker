import { describe, it, expect } from 'vitest'
import { evaluateGoals, calcGoalProgress } from './goal'
import type { UserGoal } from '@/lib/types'

const mockGoal: UserGoal = {
  id: 'g1',
  userId: 'u1',
  dailyLimitG: 40,
  weeklyRestDays: 2,
  weeklyLimitG: 200,
}

describe('evaluateGoals', () => {
  it('全て達成していればachievedがtrue', () => {
    const result = evaluateGoals(mockGoal, {
      dailyTotalG: 30,
      weeklyRestDays: 2,
      weeklyTotalG: 150,
    })
    expect(result.dailyLimit.achieved).toBe(true)
    expect(result.weeklyRestDays.achieved).toBe(true)
    expect(result.weeklyLimit.achieved).toBe(true)
  })

  it('1日の上限超過はachievedがfalse', () => {
    const result = evaluateGoals(mockGoal, {
      dailyTotalG: 41,
      weeklyRestDays: 2,
      weeklyTotalG: 150,
    })
    expect(result.dailyLimit.achieved).toBe(false)
  })

  it('休肝日不足はachievedがfalse', () => {
    const result = evaluateGoals(mockGoal, {
      dailyTotalG: 30,
      weeklyRestDays: 1,
      weeklyTotalG: 150,
    })
    expect(result.weeklyRestDays.achieved).toBe(false)
  })
})

describe('calcGoalProgress', () => {
  it('全項目達成で1を返す', () => {
    const progress = calcGoalProgress(mockGoal, {
      dailyTotalG: 20,
      weeklyRestDays: 3,
      weeklyTotalG: 150,
    })
    expect(progress).toBe(1)
  })

  it('全項目未達で0を返す', () => {
    const progress = calcGoalProgress(mockGoal, {
      dailyTotalG: 50,
      weeklyRestDays: 0,
      weeklyTotalG: 300,
    })
    expect(progress).toBe(0)
  })
})
