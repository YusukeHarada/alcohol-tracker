'use client'

import { useState } from 'react'
import { calcPureAlcohol } from '@/domain/alcohol'
import { DRINK_CATEGORIES } from '@/constants/alcohol'

type SubmitValues = {
  category: string
  volumeMl: number
  alcoholPercent: number
  pureAlcoholG: number
  memo: string
}

type Props = {
  onSubmit: (values: SubmitValues) => void
}

export function DrinkForm({ onSubmit }: Props) {
  const initial = DRINK_CATEGORIES[0]
  const [category, setCategory] = useState<string>(initial.value)
  const [volumeMl,       setVolumeMl]       = useState(String(initial.defaultMl))
  const [alcoholPercent, setAlcoholPercent] = useState(String(initial.defaultPercent))
  const [memo,           setMemo]           = useState('')

  const volume  = parseFloat(volumeMl)
  const percent = parseFloat(alcoholPercent)
  const preview =
    !isNaN(volume) && !isNaN(percent) && volume > 0 && percent > 0
      ? calcPureAlcohol(volume, percent)
      : null

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
    onSubmit({
      category,
      volumeMl:       volume,
      alcoholPercent: percent,
      pureAlcoholG:   preview ?? 0,
      memo,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm text-gray-600">種類</label>
        <select
          id="category"
          value={category}
          onChange={e => handleCategoryChange(e.target.value)}
          className="border rounded p-2"
        >
          {DRINK_CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="volume" className="text-sm text-gray-600">容量 (ml)</label>
        <input
          id="volume"
          type="number"
          value={volumeMl}
          onChange={e => setVolumeMl(e.target.value)}
          className="border rounded p-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="percent" className="text-sm text-gray-600">度数 (%)</label>
        <input
          id="percent"
          type="number"
          value={alcoholPercent}
          onChange={e => setAlcoholPercent(e.target.value)}
          className="border rounded p-2"
        />
      </div>

      {preview !== null && (
        <p className="text-sm text-gray-600">
          純アルコール量：{preview.toFixed(1)} g
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="memo" className="text-sm text-gray-600">メモ</label>
        <input
          id="memo"
          type="text"
          value={memo}
          onChange={e => setMemo(e.target.value)}
          className="border rounded p-2"
          placeholder="任意"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white rounded p-3"
      >
        記録する
      </button>
    </div>
  )
}
