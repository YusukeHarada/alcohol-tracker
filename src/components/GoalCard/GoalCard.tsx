import { evaluateGoals } from '@/domain/goal'
import type { UserGoal } from '@/lib/types'

type Props = {
  goal: UserGoal
  actual: {
    dailyTotalG: number
    weeklyRestDays: number
    weeklyTotalG: number
  }
}

export function GoalCard({ goal, actual }: Props) {
  const evaluation = evaluateGoals(goal, actual)
  const items      = Object.values(evaluation)

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm space-y-3">
      <h2 className="text-sm text-gray-500">今週の目標</h2>
      {items.map(item => (
        <div key={item.label} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {item.achieved ? (
              <span data-testid="goal-achieved" className="text-blue-500">✓</span>
            ) : (
              <span data-testid="goal-failed" className="text-red-400">!</span>
            )}
            <span className="text-sm text-gray-700">{item.label}</span>
          </div>
          <div className="text-right">
            <span className={`text-sm font-medium ${item.achieved ? 'text-blue-600' : 'text-red-500'}`}>
              {item.actual}
            </span>
            <span className="text-xs text-gray-400 ml-1">/ {item.target}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
