'use client'

import { useEffect, useState, useTransition } from 'react'
import { addDrinkRecord } from '@/actions/drinkActions'
import type { QuickAddCandidate } from '@/domain/quickAdd'

type Props = {
  date: string
  candidates: QuickAddCandidate[]
}

export function QuickAddChips({ date, candidates }: Props) {
  const [isPending, startTransition] = useTransition()
  const [pendingKey, setPendingKey]  = useState<string | null>(null)

  // Server Actionの完了とrevalidatePathによる再描画が終わるまで押下中表示を維持する。
  // finallyで消すと再描画前にハイライトが消えてちらつく。
  useEffect(() => {
    if (!isPending) setPendingKey(null)
  }, [isPending])

  if (candidates.length === 0) return null

  const handleTap = (c: QuickAddCandidate) => {
    if (isPending) return // 二重タップ・別チップの同時タップを弾く
    setPendingKey(c.key)
    startTransition(async () => {
      try {
        await addDrinkRecord({
          date,
          category:       c.category,
          volumeMl:       c.volumeMl,
          alcoholPercent: c.alcoholPercent,
          pureAlcoholG:   c.pureAlcoholG,
          memo:           '',
        })
      } catch {
        alert('記録の保存に失敗しました')
        setPendingKey(null)
      }
    })
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-slate-400 px-1">ワンタップ記録</p>
      <div className="flex flex-wrap gap-2">
        {candidates.map(c => {
          const tapped = pendingKey === c.key
          return (
            <button
              key={c.key}
              onClick={() => handleTap(c)}
              disabled={isPending}
              aria-busy={tapped}
              className={`flex-1 min-w-[calc(50%-0.25rem)] rounded-2xl border px-3 py-2.5 text-left
                transition-all active:scale-[0.98] disabled:opacity-50
                ${tapped
                  ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200'
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'}`}
            >
              <span className="block text-sm font-medium text-slate-700">
                {c.label} {c.volumeMl}ml
              </span>
              <span className="block text-xs text-indigo-500 mt-0.5">
                {tapped ? '記録中...' : `${c.pureAlcoholG.toFixed(1)}g`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
