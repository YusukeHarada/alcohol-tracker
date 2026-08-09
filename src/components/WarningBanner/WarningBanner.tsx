import { buildWarnings } from '@/domain/warnings'
import type { UserGoal } from '@/lib/types'

type Props = {
  dailyTotalG: number
  weeklyTotalG: number
  consecutiveDays: number
  hasRestDayThisWeek: boolean
  goal: UserGoal | null
}

export function WarningBanner(props: Props) {
  const warnings = buildWarnings(props)

  if (warnings.length === 0) return null

  return (
    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
      <div className="shrink-0 mt-0.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <div className="space-y-1">
        {warnings.map((w, i) => (
          <p key={i} className="text-sm text-amber-800">{w}</p>
        ))}
      </div>
    </div>
  )
}
