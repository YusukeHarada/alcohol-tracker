import type { UserGoal } from '@/lib/types'

type ActualValues = {
  dailyTotalG: number
  weeklyRestDays: number
  weeklyTotalG: number
}

type GoalItem = {
  achieved: boolean
  label: string
  actual: string
  target: string
}

export type GoalEvaluation = {
  dailyLimit:     GoalItem
  weeklyRestDays: GoalItem
  weeklyLimit:    GoalItem
}

export function evaluateGoals(
  goal: UserGoal,
  actual: ActualValues
): GoalEvaluation {
  return {
    dailyLimit: {
      achieved: actual.dailyTotalG <= goal.dailyLimitG,
      label:    '1日の上限',
      actual:   `${actual.dailyTotalG.toFixed(1)}g`,
      target:   `${goal.dailyLimitG}g以下`,
    },
    weeklyRestDays: {
      achieved: actual.weeklyRestDays >= goal.weeklyRestDays,
      label:    '週の休肝日',
      actual:   `${actual.weeklyRestDays}日`,
      target:   `${goal.weeklyRestDays}日以上`,
    },
    weeklyLimit: {
      achieved: actual.weeklyTotalG <= goal.weeklyLimitG,
      label:    '週の上限',
      actual:   `${actual.weeklyTotalG.toFixed(1)}g`,
      target:   `${goal.weeklyLimitG}g以下`,
    },
  }
}

export function calcGoalProgress(
  goal: UserGoal,
  actual: ActualValues
): number {
  const evaluation = evaluateGoals(goal, actual)
  const items = Object.values(evaluation)
  const achieved = items.filter(i => i.achieved).length
  return achieved / items.length
}
