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

  const progressItems = [
    {
      ...evaluation.dailyLimit,
      progress: goal.dailyLimitG > 0
        ? Math.min(actual.dailyTotalG / goal.dailyLimitG, 1)
        : 0,
    },
    {
      ...evaluation.weeklyRestDays,
      progress: goal.weeklyRestDays > 0
        ? Math.min(actual.weeklyRestDays / goal.weeklyRestDays, 1)
        : 1,
    },
    {
      ...evaluation.weeklyLimit,
      progress: goal.weeklyLimitG > 0
        ? Math.min(actual.weeklyTotalG / goal.weeklyLimitG, 1)
        : 0,
    },
  ]

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-5 space-y-4">
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">今週の目標</h2>
      <div className="space-y-3.5">
        {progressItems.map(item => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {item.achieved ? (
                  <svg data-testid="goal-achieved" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg data-testid="goal-failed" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
                <span className="text-sm text-slate-600">{item.label}</span>
              </div>
              <div>
                <span className={`text-sm font-semibold ${item.achieved ? 'text-emerald-600' : 'text-red-500'}`}>
                  {item.actual}
                </span>
                <span className="text-xs text-slate-400 ml-1">/ {item.target}</span>
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${item.achieved ? 'bg-emerald-400' : 'bg-red-400'}`}
                style={{ width: `${item.progress * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
