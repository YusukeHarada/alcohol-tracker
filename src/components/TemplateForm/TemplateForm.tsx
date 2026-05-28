'use client'

import { useState } from 'react'
import { validateTemplate } from '@/domain/template'
import { DRINK_CATEGORIES } from '@/constants/alcohol'
import type { DrinkTemplateItem } from '@/lib/types'

type SubmitValues = {
  name: string
  items: DrinkTemplateItem[]
}

type Props = {
  onSubmit: (values: SubmitValues) => void
}

type ItemState = {
  key: number
  category: string
  volumeMl: string
  alcoholPercent: string
}

let keyCounter = 0

function makeItem(): ItemState {
  const def = DRINK_CATEGORIES[0]
  return {
    key:           keyCounter++,
    category:      def.value,
    volumeMl:      String(def.defaultMl),
    alcoholPercent: String(def.defaultPercent),
  }
}

export function TemplateForm({ onSubmit }: Props) {
  const [name,  setName]  = useState('')
  const [items, setItems] = useState<ItemState[]>([makeItem()])
  const [error, setError] = useState<string | null>(null)

  const updateItem = (key: number, patch: Partial<ItemState>) => {
    setItems(prev => prev.map(it => it.key === key ? { ...it, ...patch } : it))
  }

  const handleCategoryChange = (key: number, value: string) => {
    const def = DRINK_CATEGORIES.find(c => c.value === value)
    updateItem(key, {
      category: value,
      ...(def && {
        volumeMl:       String(def.defaultMl),
        alcoholPercent: String(def.defaultPercent),
      }),
    })
  }

  const handleSubmit = () => {
    setError(null)
    const parsed = items.map(it => ({
      category:       it.category,
      volumeMl:       parseFloat(it.volumeMl),
      alcoholPercent: parseFloat(it.alcoholPercent),
    }))
    const result = validateTemplate({ name, items: parsed })
    if (!result.ok) {
      setError(result.error)
      return
    }
    onSubmit({ name, items: parsed })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="template-name" className="text-sm text-gray-600">
          テンプレート名
        </label>
        <input
          id="template-name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border rounded p-2 text-sm"
          placeholder="例：いつもの晩酌"
        />
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.key} className="border rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">アイテム {idx + 1}</span>
              <button
                onClick={() => setItems(prev => prev.filter(it => it.key !== item.key))}
                disabled={items.length === 1}
                className="text-xs text-red-400 disabled:opacity-30"
              >
                削除
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`cat-${item.key}`} className="text-xs text-gray-500">
                種類
              </label>
              <select
                id={`cat-${item.key}`}
                value={item.category}
                onChange={e => handleCategoryChange(item.key, e.target.value)}
                className="border rounded p-1.5 text-sm"
              >
                {DRINK_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label htmlFor={`vol-${item.key}`} className="text-xs text-gray-500">
                  容量 (ml)
                </label>
                <input
                  id={`vol-${item.key}`}
                  type="number"
                  value={item.volumeMl}
                  onChange={e => updateItem(item.key, { volumeMl: e.target.value })}
                  className="border rounded p-1.5 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={`pct-${item.key}`} className="text-xs text-gray-500">
                  度数 (%)
                </label>
                <input
                  id={`pct-${item.key}`}
                  type="number"
                  value={item.alcoholPercent}
                  onChange={e => updateItem(item.key, { alcoholPercent: e.target.value })}
                  className="border rounded p-1.5 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setItems(prev => [...prev, makeItem()])}
        className="w-full py-2 border border-dashed border-gray-300 text-sm text-gray-400 rounded-lg"
      >
        + アイテムを追加
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-blue-500 text-white rounded-xl text-sm font-medium"
      >
        保存する
      </button>
    </div>
  )
}
