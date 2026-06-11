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
    try {
      await addDrinkRecord({ ...values, date })
      setOpen(false)
    } catch {
      alert('記録の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = async (template: DrinkTemplate) => {
    setLoading(true)
    try {
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
      setOpen(false)
    } catch {
      alert('記録の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-base font-semibold shadow-md shadow-indigo-200 active:scale-[0.98] transition-transform"
      >
        + 記録する
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 pt-5 pb-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-slate-800">飲酒を記録</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="flex gap-1 mt-4 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setTab('template')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors
                    ${tab === 'template' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                >
                  テンプレート
                </button>
                <button
                  onClick={() => setTab('manual')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors
                    ${tab === 'manual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                >
                  手動入力
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-8">
              {tab === 'template' ? (
                <TemplateSelector
                  templates={templates}
                  onSelect={handleTemplateSelect}
                />
              ) : (
                <DrinkForm onSubmit={handleManualSubmit} />
              )}

              {loading && (
                <p className="text-center text-sm text-slate-400 mt-4">保存中...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
