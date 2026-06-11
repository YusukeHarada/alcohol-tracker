'use client'

import { useState } from 'react'
import { TemplateForm } from '@/components/TemplateForm/TemplateForm'
import { addTemplate, deleteTemplate } from '@/actions/templateActions'
import { applyTemplate } from '@/domain/template'
import { DRINK_CATEGORIES } from '@/constants/alcohol'
import type { DrinkTemplate } from '@/lib/types'

type Props = {
  templates: DrinkTemplate[]
}

export function TemplateListView({ templates: initial }: Props) {
  const [templates, setTemplates] = useState(initial)
  const [showForm,  setShowForm]  = useState(false)
  const [loading,   setLoading]   = useState(false)

  const handleAdd = async (values: { name: string; items: DrinkTemplate['items'] }) => {
    setLoading(true)
    try {
      await addTemplate(values.name, values.items)
      setTemplates(prev => [
        ...prev,
        { id: crypto.randomUUID(), userId: '', name: values.name, items: values.items },
      ])
      setShowForm(false)
    } catch {
      alert('テンプレートの追加に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    const snapshot = templates
    setTemplates(prev => prev.filter(t => t.id !== id))
    try {
      await deleteTemplate(id)
    } catch {
      setTemplates(snapshot)
      alert('テンプレートの削除に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {templates.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 text-center py-8">
          テンプレートがまだありません
        </p>
      )}

      {templates.map(t => {
        const items = applyTemplate(t)
        const total = items.reduce((s, i) => s + i.pureAlcoholG, 0)

        return (
          <div key={t.id} className="border rounded-xl p-4 bg-white space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-medium text-sm">{t.name}</span>
              <button
                onClick={() => handleDelete(t.id)}
                disabled={loading}
                className="text-xs text-red-400 disabled:opacity-30"
              >
                削除
              </button>
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
            <p className="text-xs text-blue-600">合計 {total.toFixed(1)}g</p>
          </div>
        )
      })}

      {showForm ? (
        <div className="border rounded-xl p-4 bg-white space-y-3">
          <h2 className="text-sm font-medium">新しいテンプレート</h2>
          <TemplateForm onSubmit={handleAdd} />
          <button
            onClick={() => setShowForm(false)}
            className="w-full text-sm text-gray-400 py-2"
          >
            キャンセル
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 border border-dashed border-blue-300 text-blue-400 rounded-xl text-sm"
        >
          + テンプレートを追加
        </button>
      )}
    </div>
  )
}
