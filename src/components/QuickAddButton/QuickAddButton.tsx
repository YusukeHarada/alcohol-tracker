'use client'

import { useState } from 'react'
import { DrinkForm } from '@/components/DrinkForm/DrinkForm'
import { TemplateSelector } from '@/components/TemplateSelector/TemplateSelector'
import { addDrinkRecord } from '@/actions/drinkActions'
import { applyTemplate } from '@/domain/template'
import type { DrinkTemplate } from '@/lib/types'

type Props = {
  date: string
  templates: DrinkTemplate[]
}

type Tab = 'template' | 'manual'

export function QuickAddButton({ date, templates }: Props) {
  const [open,    setOpen]    = useState(false)
  const [tab,     setTab]     = useState<Tab>('template')
  const [loading, setLoading] = useState(false)

  const handleManualSubmit = async (values: {
    category: string
    volumeMl: number
    alcoholPercent: number
    pureAlcoholG: number
    memo: string
  }) => {
    setLoading(true)
    await addDrinkRecord({ ...values, date })
    setLoading(false)
    setOpen(false)
  }

  const handleTemplateSelect = async (template: DrinkTemplate) => {
    setLoading(true)
    const items = applyTemplate(template)
    await Promise.all(
      items.map(item =>
        addDrinkRecord({
          date,
          category:       item.category,
          volumeMl:       item.volumeMl,
          alcoholPercent: item.alcoholPercent,
          pureAlcoholG:   item.pureAlcoholG,
          memo:           template.name,
        })
      )
    )
    setLoading(false)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-4 rounded-xl bg-blue-500 text-white text-lg font-medium shadow"
      >
        + 記録する
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50">
          <div className="w-full max-w-md mx-auto bg-white rounded-t-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="font-medium">飲酒を記録</h2>
              <button onClick={() => setOpen(false)} className="text-sm text-gray-400">
                閉じる
              </button>
            </div>

            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setTab('template')}
                className={`flex-1 py-2 text-sm ${tab === 'template' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
              >
                テンプレート
              </button>
              <button
                onClick={() => setTab('manual')}
                className={`flex-1 py-2 text-sm ${tab === 'manual' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
              >
                手動入力
              </button>
            </div>

            {tab === 'template' ? (
              <TemplateSelector
                templates={templates}
                onSelect={handleTemplateSelect}
              />
            ) : (
              <DrinkForm onSubmit={handleManualSubmit} />
            )}

            {loading && (
              <p className="text-center text-sm text-gray-400">保存中...</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
