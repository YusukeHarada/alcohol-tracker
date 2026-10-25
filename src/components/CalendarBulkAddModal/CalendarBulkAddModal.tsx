'use client'

import { useState } from 'react'
import { formatShortDate } from '@/domain/jstDate'
import { DRINK_CATEGORIES } from '@/constants/alcohol'
import { DrinkForm } from '@/components/DrinkForm/DrinkForm'
import type { CountedDrinkEntry } from '@/domain/drinkEntry'

type Props = {
  dates: string[]
  onClose: () => void
  onSubmit: (entries: CountedDrinkEntry[]) => Promise<void>
}

/**
 * カレンダーで選んだ複数日に、同じ内容をまとめて記録するモーダル。
 * 飲み物はいったんリストに積み、最後に1回で保存する（全日分を1回のinsertにするため）。
 */
export function CalendarBulkAddModal({ dates, onClose, onSubmit }: Props) {
  const [entries, setEntries] = useState<CountedDrinkEntry[]>([])
  // 追加のたびにフォームを初期状態に戻すためのkey
  const [formKey, setFormKey] = useState(0)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const perDayTotal = entries.reduce((s, e) => s + e.pureAlcoholG * (e.count ?? 1), 0)

  const handleAddEntry = (values: CountedDrinkEntry) => {
    setEntries(prev => [...prev, values])
    setFormKey(k => k + 1)
  }

  const handleRemoveEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (saving || entries.length === 0) return
    setSaving(true)
    setError(null)
    try {
      await onSubmit(entries)
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

        {entries.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm text-gray-500">記録する飲み物</h3>
            <ul className="space-y-2">
              {entries.map((e, i) => {
                const label = DRINK_CATEGORIES.find(c => c.value === e.category)?.label ?? e.category
                const count = e.count ?? 1
                return (
                  <li
                    key={i}
                    data-testid="bulk-entry"
                    className="flex items-center justify-between border rounded-xl px-3 py-2"
                  >
                    <div className="text-sm">
                      <span className="font-medium">{label}</span>
                      <span className="text-gray-500"> {e.volumeMl}ml {e.alcoholPercent}%</span>
                      {count > 1 && <span className="text-gray-500"> ×{count}本</span>}
                      {e.memo && <span className="block text-xs text-gray-400">{e.memo}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-indigo-600">{(e.pureAlcoholG * count).toFixed(1)}g</span>
                      <button
                        onClick={() => handleRemoveEntry(i)}
                        disabled={saving}
                        aria-label={`${label}を削除`}
                        className="text-xs text-gray-400"
                      >
                        削除
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        <div className="border-t pt-4 space-y-3">
          <h3 className="text-sm text-gray-500">飲み物を追加</h3>
          <DrinkForm key={formKey} onSubmit={handleAddEntry} submitVerb="追加する" />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || entries.length === 0}
          className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50"
        >
          {entries.length === 0
            ? '飲み物を追加してください'
            : `${dates.length}日に${entries.length}件を記録する（1日あたり${perDayTotal.toFixed(1)}g）`}
        </button>

        {saving && <p className="text-center text-sm text-gray-400">保存中...</p>}
        {error  && <p className="text-center text-sm text-red-500">{error}</p>}
      </div>
    </div>
  )
}
