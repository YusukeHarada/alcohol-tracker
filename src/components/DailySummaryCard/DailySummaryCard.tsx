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

  return (
    <div className="rounded-xl border bg-white p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-sm">今日</span>
        {isRestDay ? (
          <span className="text-blue-600 font-medium">休肝日</span>
        ) : (
          <span className={`text-2xl font-bold ${overDaily ? 'text-red-600' : 'text-gray-800'}`}>
            {dailyTotalG.toFixed(1)}
            <span className="text-sm font-normal text-gray-500 ml-1">g</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-gray-500 text-sm">今週の合計</span>
        <span className="text-gray-700">{weeklyTotalG.toFixed(1)} g</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-sm">今週の休肝日</span>
        <span className="text-gray-700">{restDaysThisWeek} 日</span>
      </div>

      {records.length > 0 && (
        <div className="border-t pt-3 space-y-2">
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
