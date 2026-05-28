'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { calcDailyTotal, isRestDay } from '@/domain/alcohol'
import { DrinkForm } from '@/components/DrinkForm/DrinkForm'
import { DrinkRecordItem } from '@/components/DrinkRecordItem/DrinkRecordItem'
import type { DrinkRecord } from '@/lib/types'

type Props = {
  date: string
  records: DrinkRecord[]
  onClose: () => void
  onAdd: (values: {
    category: string
    volumeMl: number
    alcoholPercent: number
    pureAlcoholG: number
    memo: string
  }) => Promise<void>
  onUpdate: (id: string, patch: { memo: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function CalendarDayModal({
  date, records, onClose, onAdd, onUpdate, onDelete,
}: Props) {
  const [showForm, setShowForm] = useState(false)
  const [loading,  setLoading]  = useState(false)

  const total = calcDailyTotal(records)
  const rest  = isRestDay(records)

  const handleAdd = async (values: {
    category: string
    volumeMl: number
    alcoholPercent: number
    pureAlcoholG: number
    memo: string
  }) => {
    setLoading(true)
    await onAdd(values)
    setLoading(false)
    setShowForm(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50">
      <div className="w-full max-w-md mx-auto bg-white rounded-t-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="font-medium">
            {format(new Date(date), 'yyyy年M月d日（E）', { locale: ja })}
          </h2>
          <button onClick={onClose} className="text-sm text-gray-400">
            閉じる
          </button>
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <span className="text-sm text-gray-500">合計</span>
          {rest ? (
            <span className="text-blue-600 font-medium">休肝日</span>
          ) : (
            <span className="font-medium">{total.toFixed(1)}g</span>
          )}
        </div>

        {records.length > 0 && (
          <div className="space-y-2">
            {records.map(r => (
              <DrinkRecordItem
                key={r.id}
                record={r}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}

        {showForm ? (
          <div className="border-t pt-4 space-y-3">
            <h3 className="text-sm text-gray-500">この日に追加</h3>
            <DrinkForm onSubmit={handleAdd} />
            {loading && (
              <p className="text-center text-sm text-gray-400">保存中...</p>
            )}
            <button
              onClick={() => setShowForm(false)}
              className="w-full text-sm text-gray-400 py-2"
            >
              キャンセル
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 border border-blue-300 text-blue-500 rounded-xl text-sm"
          >
            + 追加
          </button>
        )}
      </div>
    </div>
  )
}
