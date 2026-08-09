'use client'

import { DrinkRecordItem } from '@/components/DrinkRecordItem/DrinkRecordItem'
import type { DrinkRecordPatch } from '@/components/DrinkRecordItem/DrinkRecordItem'
import { updateDrinkRecord, deleteDrinkRecord } from '@/actions/drinkActions'
import { formatDisplayDate } from '@/domain/dateNav'
import { DAILY_LIMIT_G } from '@/constants/alcohol'
import type { DrinkRecord, UserGoal } from '@/lib/types'

type Props = {
  date: string
  dailyTotalG: number
  weeklyTotalG: number
  restDaysThisWeek: number
  isRestDay: boolean
  records: DrinkRecord[]
  goal: UserGoal | null
}

export function DailySummaryCard({
  date,
  dailyTotalG,
  weeklyTotalG,
  restDaysThisWeek,
  isRestDay,
  records,
  goal,
}: Props) {
  // 見出しは選択中の日付に追従させる。以前は「今日の摂取量」で固定だったため、
  // DateNavで昨日に移動すると「今日の摂取量」に昨日の数字が並んでいた。
  const dateLabel = formatDisplayDate(date)
  const overDaily = dailyTotalG > (goal?.dailyLimitG ?? DAILY_LIMIT_G)

  const handleUpdate = async (id: string, patch: DrinkRecordPatch) => {
    const record = records.find(r => r.id === id)
    if (!record) return
    try {
      await updateDrinkRecord(id, patch, record.date)
    } catch {
      alert('更新に失敗しました')
    }
  }

  const handleDelete = async (id: string) => {
    const record = records.find(r => r.id === id)
    if (!record) return
    try {
      await deleteDrinkRecord(id, record.date)
    } catch {
      alert('削除に失敗しました')
    }
  }

  const headerGradient = isRestDay
    ? 'from-emerald-400 to-teal-500'
    : overDaily
    ? 'from-red-500 to-rose-500'
    : 'from-indigo-500 to-violet-500'

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
      <div className={`bg-gradient-to-r ${headerGradient} px-5 py-4`}>
        <div className="flex items-end justify-between">
          <span className="text-white/70 text-sm font-medium">{dateLabel}の摂取量</span>
          {isRestDay ? (
            <span className="text-white text-xl font-semibold">休肝日</span>
          ) : (
            <span className={`text-3xl font-bold text-white`}>
              {dailyTotalG.toFixed(1)}
              <span className="text-base font-normal text-white/70 ml-1">g</span>
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">直近7日の合計</p>
          <p className="text-xl font-semibold text-slate-700">
            {weeklyTotalG.toFixed(1)}
            <span className="text-sm font-normal text-slate-400 ml-1">g</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">直近7日の休肝日</p>
          <p className="text-xl font-semibold text-slate-700">
            {restDaysThisWeek}
            <span className="text-sm font-normal text-slate-400 ml-1">日</span>
          </p>
        </div>
      </div>

      {records.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-2">
          {records.map(r => (
            <DrinkRecordItem
              key={r.id}
              record={r}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
