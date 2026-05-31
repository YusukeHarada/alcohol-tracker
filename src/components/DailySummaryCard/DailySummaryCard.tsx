'use client'

import { DrinkRecordItem } from '@/components/DrinkRecordItem/DrinkRecordItem'
import { updateDrinkRecord, deleteDrinkRecord } from '@/actions/drinkActions'
import { DAILY_LIMIT_G } from '@/constants/alcohol'
import type { DrinkRecord } from '@/lib/types'

type Props = {
  dailyTotalG: number
  weeklyTotalG: number
  restDaysThisWeek: number
  isRestDay: boolean
  records: DrinkRecord[]
}

export function DailySummaryCard({
  dailyTotalG,
  weeklyTotalG,
  restDaysThisWeek,
  isRestDay,
  records,
}: Props) {
  const overDaily = dailyTotalG > DAILY_LIMIT_G

  const handleUpdate = async (id: string, patch: { memo: string }) => {
    const record = records.find(r => r.id === id)
    if (!record) return
    await updateDrinkRecord(id, patch, record.date)
  }

  const handleDelete = async (id: string) => {
    const record = records.find(r => r.id === id)
    if (!record) return
    await deleteDrinkRecord(id, record.date)
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
          <span className="text-white/70 text-sm font-medium">今日の摂取量</span>
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
          <p className="text-xs text-slate-400 mb-1">今週の合計</p>
          <p className="text-xl font-semibold text-slate-700">
            {weeklyTotalG.toFixed(1)}
            <span className="text-sm font-normal text-slate-400 ml-1">g</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">今週の休肝日</p>
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
