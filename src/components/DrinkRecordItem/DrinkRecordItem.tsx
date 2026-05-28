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
    <div className="border rounded-lg p-3 space-y-2 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-sm font-medium">{categoryLabel}</span>
          <span className="text-sm text-gray-500 ml-2">
            {record.volumeMl}ml {record.alcoholPercent}%
          </span>
        </div>
        <span className="text-sm font-medium text-blue-600">
          {record.pureAlcoholG.toFixed(1)}g
        </span>
      </div>

      {!editing ? (
        <>
          {record.memo && (
            <p className="text-xs text-gray-400">{record.memo}</p>
          )}
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-gray-500 border rounded px-2 py-1"
            >
              編集
            </button>
            <button
              onClick={() => onDelete(record.id)}
              className="text-xs text-red-500 border border-red-200 rounded px-2 py-1"
            >
              削除
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-col gap-1">
            <label htmlFor={`memo-${record.id}`} className="text-xs text-gray-500">
              メモ
            </label>
            <input
              id={`memo-${record.id}`}
              type="text"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              className="border rounded p-1 text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-gray-400 border rounded px-2 py-1"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="text-xs text-white bg-blue-500 rounded px-2 py-1"
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
