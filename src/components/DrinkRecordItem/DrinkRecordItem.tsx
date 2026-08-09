'use client'

import { useState } from 'react'
import { calcPureAlcohol } from '@/domain/alcohol'
import { DRINK_CATEGORIES } from '@/constants/alcohol'
import type { DrinkRecord } from '@/lib/types'

export type DrinkRecordPatch = {
  category: string
  volumeMl: number
  alcoholPercent: number
  memo: string
}

type Props = {
  record: DrinkRecord
  onUpdate: (id: string, patch: DrinkRecordPatch) => void
  onDelete: (id: string) => void
}

type Mode = 'view' | 'edit' | 'confirmDelete'

const fieldClass = 'w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent'
const labelClass = 'text-xs text-slate-500'
// 破壊的操作を含むので44px相当のタップ領域を確保する
const actionClass = 'min-h-[38px] px-3.5 text-xs font-medium rounded-lg border transition-colors'

export function DrinkRecordItem({ record, onUpdate, onDelete }: Props) {
  const [mode, setMode] = useState<Mode>('view')
  const [category,       setCategory]       = useState(record.category)
  const [volumeMl,       setVolumeMl]       = useState(String(record.volumeMl))
  const [alcoholPercent, setAlcoholPercent] = useState(String(record.alcoholPercent))
  const [memo,           setMemo]           = useState(record.memo ?? '')

  const categoryLabel =
    DRINK_CATEGORIES.find(c => c.value === record.category)?.label ?? record.category

  const volume  = parseFloat(volumeMl)
  const percent = parseFloat(alcoholPercent)
  const valid   = !isNaN(volume) && !isNaN(percent) && volume > 0 && percent >= 0
  const preview = valid ? calcPureAlcohol(volume, percent) : null

  const startEdit = () => {
    // 前回のキャンセル分が残らないよう、開くたびにレコードの値へ戻す
    setCategory(record.category)
    setVolumeMl(String(record.volumeMl))
    setAlcoholPercent(String(record.alcoholPercent))
    setMemo(record.memo ?? '')
    setMode('edit')
  }

  const handleSave = () => {
    if (!valid) return
    onUpdate(record.id, { category, volumeMl: volume, alcoholPercent: percent, memo })
    setMode('view')
  }

  // 種類を変えたら容量・度数もその種類の既定値に合わせる。
  // 押し間違いの修正が主用途なので、1項目ずつ直させない
  const handleCategoryChange = (value: string) => {
    setCategory(value)
    const found = DRINK_CATEGORIES.find(c => c.value === value)
    if (found) {
      setVolumeMl(String(found.defaultMl))
      setAlcoholPercent(String(found.defaultPercent))
    }
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

      {mode === 'view' && (
        <>
          {record.memo && (
            <p className="text-xs text-slate-400">{record.memo}</p>
          )}
          <div className="flex gap-3 justify-end">
            <button
              onClick={startEdit}
              className={`${actionClass} text-slate-600 bg-white border-slate-200 hover:bg-slate-100`}
            >
              編集
            </button>
            <button
              onClick={() => setMode('confirmDelete')}
              className={`${actionClass} text-red-500 bg-white border-red-100 hover:bg-red-50`}
            >
              削除
            </button>
          </div>
        </>
      )}

      {mode === 'confirmDelete' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-600">この記録を削除しますか？</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setMode('view')}
              className={`${actionClass} text-slate-500 bg-white border-slate-200 hover:bg-slate-100`}
            >
              やめる
            </button>
            <button
              onClick={() => onDelete(record.id)}
              className={`${actionClass} text-white bg-red-500 border-red-500 hover:bg-red-600`}
            >
              削除する
            </button>
          </div>
        </div>
      )}

      {mode === 'edit' && (
        <div className="space-y-2.5">
          <div className="flex flex-col gap-1">
            <label htmlFor={`category-${record.id}`} className={labelClass}>種類</label>
            <select
              id={`category-${record.id}`}
              value={category}
              onChange={e => handleCategoryChange(e.target.value)}
              className={fieldClass}
            >
              {DRINK_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
              {!DRINK_CATEGORIES.some(c => c.value === category) && (
                <option value={category}>{category}</option>
              )}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor={`volume-${record.id}`} className={labelClass}>容量 (ml)</label>
              <input
                id={`volume-${record.id}`}
                type="number"
                value={volumeMl}
                onChange={e => setVolumeMl(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label htmlFor={`percent-${record.id}`} className={labelClass}>度数 (%)</label>
              <input
                id={`percent-${record.id}`}
                type="number"
                value={alcoholPercent}
                onChange={e => setAlcoholPercent(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor={`memo-${record.id}`} className={labelClass}>メモ</label>
            <input
              id={`memo-${record.id}`}
              type="text"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              className={fieldClass}
            />
          </div>

          {preview !== null && (
            <p className="text-xs text-indigo-500">
              純アルコール量 {preview.toFixed(1)}g
            </p>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setMode('view')}
              className={`${actionClass} text-slate-500 bg-white border-slate-200 hover:bg-slate-100`}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={!valid}
              className={`${actionClass} text-white bg-indigo-500 border-indigo-500 hover:bg-indigo-600 disabled:opacity-50`}
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
