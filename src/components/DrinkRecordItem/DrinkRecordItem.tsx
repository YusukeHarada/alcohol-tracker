'use client'

import { useState } from 'react'
import { DRINK_CATEGORIES } from '@/constants/alcohol'
import type { DrinkRecord } from '@/lib/types'

type Props = {
  record: DrinkRecord
  onUpdate: (id: string, patch: { memo: string }) => void
  onDelete: (id: string) => void
}

export function DrinkRecordItem({ record, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [memo,    setMemo]    = useState(record.memo ?? '')

  const categoryLabel =
    DRINK_CATEGORIES.find(c => c.value === record.category)?.label ?? record.category

  const handleSave = () => {
    onUpdate(record.id, { memo })
    setEditing(false)
  }

  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-sm font-medium text-slate-700">{categoryLabel}</span>
          <span className="text-xs text-slate-400 ml-2">
            {record.volumeMl}ml · {record.alcoholPercent}%
          </span>
        </div>
        <span className="text-sm font-semibold text-indigo-600">
          {record.pureAlcoholG.toFixed(1)}g
        </span>
      </div>

      {!editing ? (
        <>
          {record.memo && (
            <p className="text-xs text-slate-400">{record.memo}</p>
          )}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition-colors"
            >
              編集
            </button>
            <button
              onClick={() => onDelete(record.id)}
              className="text-xs text-red-500 bg-white border border-red-100 rounded-lg px-2.5 py-1 hover:bg-red-50 transition-colors"
            >
              削除
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-col gap-1">
            <label htmlFor={`memo-${record.id}`} className="text-xs text-slate-500">
              メモ
            </label>
            <input
              id={`memo-${record.id}`}
              type="text"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-slate-400 bg-white border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="text-xs text-white bg-indigo-500 rounded-lg px-2.5 py-1 hover:bg-indigo-600 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
