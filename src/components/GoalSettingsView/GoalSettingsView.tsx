'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertGoal } from '@/actions/goalActions'
import type { UserGoal } from '@/lib/types'

type Props = {
  goal: UserGoal | null
}

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
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="daily-limit" className="text-sm text-gray-600">
            1日の上限 (g)
          </label>
          <input
            id="daily-limit"
            type="number"
            value={dailyLimitG}
            onChange={e => setDailyLimitG(e.target.value)}
            className="border rounded p-2 text-sm"
          />
          <p className="text-xs text-gray-400">厚生労働省の推奨は40g</p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="weekly-rest" className="text-sm text-gray-600">
            週の休肝日 (日)
          </label>
          <input
            id="weekly-rest"
            type="number"
            min={0}
            max={7}
            value={weeklyRestDays}
            onChange={e => setWeeklyRestDays(e.target.value)}
            className="border rounded p-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="weekly-limit" className="text-sm text-gray-600">
            週の上限 (g)
          </label>
          <input
            id="weekly-limit"
            type="number"
            value={weeklyLimitG}
            onChange={e => setWeeklyLimitG(e.target.value)}
            className="border rounded p-2 text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
      >
        {saving ? '保存中...' : '保存する'}
      </button>
    </div>
  )
}
