'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertGoal } from '@/actions/goalActions'
import type { UserGoal } from '@/lib/types'

type Props = {
  goal: UserGoal | null
}

const inputClass = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-shadow'
const labelClass = 'text-sm font-medium text-slate-600'
const hintClass  = 'text-xs text-slate-400 mt-0.5'

export function GoalSettingsView({ goal }: Props) {
  const router = useRouter()
  const [dailyLimitG,    setDailyLimitG]    = useState(String(goal?.dailyLimitG    ?? 40))
  const [weeklyRestDays, setWeeklyRestDays] = useState(String(goal?.weeklyRestDays ?? 2))
  const [weeklyLimitG,   setWeeklyLimitG]   = useState(String(goal?.weeklyLimitG   ?? 200))
  const [saving,         setSaving]         = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await upsertGoal({
      dailyLimitG:    parseFloat(dailyLimitG),
      weeklyRestDays: parseInt(weeklyRestDays),
      weeklyLimitG:   parseFloat(weeklyLimitG),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-5 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="daily-limit" className={labelClass}>
            1日の上限 (g)
          </label>
          <input
            id="daily-limit"
            type="number"
            value={dailyLimitG}
            onChange={e => setDailyLimitG(e.target.value)}
            className={inputClass}
          />
          <p className={hintClass}>厚生労働省の推奨は40g</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="weekly-rest" className={labelClass}>
            週の休肝日 (日)
          </label>
          <input
            id="weekly-rest"
            type="number"
            min={0}
            max={7}
            value={weeklyRestDays}
            onChange={e => setWeeklyRestDays(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="weekly-limit" className={labelClass}>
            週の上限 (g)
          </label>
          <input
            id="weekly-limit"
            type="number"
            value={weeklyLimitG}
            onChange={e => setWeeklyLimitG(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl text-sm font-semibold shadow-sm shadow-indigo-200 disabled:opacity-50 active:scale-[0.98] transition-transform"
      >
        {saving ? '保存中...' : '保存する'}
      </button>
    </div>
  )
}
