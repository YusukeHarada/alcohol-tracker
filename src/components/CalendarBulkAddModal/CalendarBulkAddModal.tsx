'use client'

import { useState } from 'react'
import { formatShortDate } from '@/domain/jstDate'
import { DrinkForm } from '@/components/DrinkForm/DrinkForm'
import type { CountedDrinkEntry } from '@/domain/drinkEntry'

type Props = {
  dates: string[]
  onClose: () => void
  onSubmit: (values: CountedDrinkEntry) => Promise<void>
}

/** カレンダーで選んだ複数日に、同じ内容をまとめて記録するモーダル */
export function CalendarBulkAddModal({ dates, onClose, onSubmit }: Props) {
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)

  const handleSubmit = async (values: CountedDrinkEntry) => {
    if (saving) return
    setSaving(true)
    setError(null)
    try {
      await onSubmit(values)
    } catch {
      setError('保存に失敗しました。もう一度お試しください')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50">
      <div className="w-full max-w-md mx-auto bg-white rounded-t-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="font-medium">{dates.length}日にまとめて追加</h2>
          <button onClick={onClose} disabled={saving} className="text-sm text-gray-400">
            閉じる
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <p className="text-xs text-gray-500">選択した日それぞれに同じ内容を記録します</p>
          <div className="flex flex-wrap gap-1">
            {dates.map(d => (
              <span key={d} className="text-xs text-indigo-700 bg-indigo-100 rounded px-2 py-0.5">
                {formatShortDate(d)}
              </span>
            ))}
          </div>
        </div>

        <DrinkForm onSubmit={handleSubmit} />

        {saving && <p className="text-center text-sm text-gray-400">保存中...</p>}
        {error  && <p className="text-center text-sm text-red-500">{error}</p>}
      </div>
    </div>
  )
}
