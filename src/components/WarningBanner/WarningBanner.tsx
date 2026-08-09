import { selectWarning } from '@/domain/warnings'
import type { WarningLevel } from '@/domain/warnings'
import type { UserGoal } from '@/lib/types'

type Props = {
  dailyTotalG: number
  weeklyTotalG: number
  weeklyRestDays: number
  consecutiveDays: number
  goal: UserGoal | null
}

// 1件しか出さないぶん、深刻度は色で伝える
const STYLE: Record<WarningLevel, { box: string; text: string; stroke: string }> = {
  alert:   { box: 'bg-red-50 border-red-200',     text: 'text-red-800',   stroke: '#dc2626' },
  caution: { box: 'bg-amber-50 border-amber-200', text: 'text-amber-800', stroke: '#d97706' },
}

export function WarningBanner(props: Props) {
  const warning = selectWarning(props)

  if (!warning) return null

  const style = STYLE[warning.level]

  return (
    <div className={`rounded-2xl border p-4 flex gap-3 items-center ${style.box}`}>
      <div className="shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={style.stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <p className={`text-sm ${style.text}`}>{warning.message}</p>
    </div>
  )
}
