'use client'

import { applyTemplate } from '@/domain/template'
import { DRINK_CATEGORIES } from '@/constants/alcohol'
import type { DrinkTemplate } from '@/lib/types'

type Props = {
  templates: DrinkTemplate[]
  onSelect: (template: DrinkTemplate) => void
}

export function TemplateSelector({ templates, onSelect }: Props) {
  if (templates.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        テンプレートがありません
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {templates.map(t => {
        const items = applyTemplate(t)
        const total = items.reduce((s, i) => s + i.pureAlcoholG, 0)

        return (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className="w-full text-left border rounded-xl p-4 bg-white space-y-1 active:bg-gray-50"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">{t.name}</span>
              <span className="text-xs text-blue-600">{total.toFixed(1)}g</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {t.items.map((item, i) => {
                const label =
                  DRINK_CATEGORIES.find(c => c.value === item.category)?.label
                  ?? item.category
                return (
                  <span
                    key={i}
                    className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5"
                  >
                    {label} {item.volumeMl}ml
                  </span>
                )
              })}
            </div>
          </button>
        )
      })}
    </div>
  )
}
