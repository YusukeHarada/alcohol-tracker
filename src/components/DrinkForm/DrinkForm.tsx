'use client'

import { useState } from 'react'
import { calcPureAlcohol } from '@/domain/alcohol'
import { MAX_DRINK_COUNT } from '@/domain/drinkEntry'
import { DRINK_CATEGORIES } from '@/constants/alcohol'

type SubmitValues = {
  category: string
  volumeMl: number
  alcoholPercent: number
  pureAlcoholG: number
  memo: string
  count: number
}

type Props = {
  onSubmit: (values: SubmitValues) => void
}

const inputClass = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-shadow'
const labelClass = 'text-xs font-medium text-slate-500'

export function DrinkForm({ onSubmit }: Props) {
  const initial = DRINK_CATEGORIES[0]
  const [category,       setCategory]       = useState<string>(initial.value)
  const [volumeMl,       setVolumeMl]       = useState(String(initial.defaultMl))
  const [alcoholPercent, setAlcoholPercent] = useState(String(initial.defaultPercent))
  const [memo,           setMemo]           = useState('')
  const [count,          setCount]          = useState('1')

  const volume  = parseFloat(volumeMl)
  const percent = parseFloat(alcoholPercent)
  const preview =
    !isNaN(volume) && !isNaN(percent) && volume > 0 && percent > 0
      ? calcPureAlcohol(volume, percent)
      : null

  const countNum    = parseInt(count, 10)
  const countValid  = Number.isInteger(countNum) && countNum >= 1 && countNum <= MAX_DRINK_COUNT
  const totalPreview = preview !== null && countValid ? preview * countNum : null

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    const found = DRINK_CATEGORIES.find(c => c.value === value)
    if (found) {
      setVolumeMl(String(found.defaultMl))
      setAlcoholPercent(String(found.defaultPercent))
    }
  }

  const handleSubmit = () => {
    if (!volumeMl || !alcoholPercent || isNaN(volume) || isNaN(percent)) return
    if (!countValid) return
    onSubmit({
      category,
      volumeMl:       volume,
      alcoholPercent: percent,
      pureAlcoholG:   preview ?? 0,
      memo,
      count:          countNum,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className={labelClass}>種類</label>
        <select
          id="category"
          value={category}
          onChange={e => handleCategoryChange(e.target.value)}
          className={inputClass}
        >
          {DRINK_CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 flex flex-col gap-1.5">
          <label htmlFor="volume" className={labelClass}>容量 (ml)</label>
          <input
            id="volume"
            type="number"
            value={volumeMl}
            onChange={e => setVolumeMl(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <label htmlFor="percent" className={labelClass}>度数 (%)</label>
          <input
            id="percent"
            type="number"
            value={alcoholPercent}
            onChange={e => setAlcoholPercent(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="w-20 flex flex-col gap-1.5">
          <label htmlFor="count" className={labelClass}>本数</label>
          <input
            id="count"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_DRINK_COUNT}
            value={count}
            onChange={e => setCount(e.target.value)}
            aria-invalid={!countValid}
            className={`${inputClass} ${countValid ? '' : 'border-red-300 focus:ring-red-200'}`}
          />
        </div>
      </div>

      {!countValid && (
        <p className="text-xs text-red-500">本数は1〜{MAX_DRINK_COUNT}の整数で入力してください</p>
      )}

      {totalPreview !== null && (
        <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm text-indigo-600">純アルコール量</span>
            {countNum > 1 && (
              <span className="text-xs text-indigo-400 mt-0.5">
                {preview?.toFixed(1)} g × {countNum}本
              </span>
            )}
          </div>
          <span className="text-lg font-bold text-indigo-700">{totalPreview.toFixed(1)} g</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="memo" className={labelClass}>メモ</label>
        <input
          id="memo"
          type="text"
          value={memo}
          onChange={e => setMemo(e.target.value)}
          className={inputClass}
          placeholder="任意"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!countValid}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold shadow-sm active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
      >
        {countValid && countNum > 1 ? `${countNum}本を記録する` : '記録する'}
      </button>
    </div>
  )
}
