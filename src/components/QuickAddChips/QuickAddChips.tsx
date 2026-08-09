'use client'

import { useEffect, useState, useTransition } from 'react'
import { addDrinkRecord } from '@/actions/drinkActions'
import { QUICK_ADD_MAX_TAP_COUNT } from '@/constants/alcohol'
import type { QuickAddCandidate } from '@/domain/quickAdd'

type Props = {
  date: string
  candidates: QuickAddCandidate[]
}

export function QuickAddChips({ date, candidates }: Props) {
  const [isPending, startTransition] = useTransition()
  const [pendingKey, setPendingKey]  = useState<string | null>(null)
  const [counts,     setCounts]      = useState<Record<string, number>>({})

  // Server Actionの完了とrevalidatePathによる再描画が終わるまで押下中表示を維持する。
  // finallyで消すと再描画前にハイライトが消えてちらつく。
  useEffect(() => {
    if (!isPending) setPendingKey(null)
  }, [isPending])

  if (candidates.length === 0) return null

  const countOf = (key: string) => counts[key] ?? 1

  // 「+」だけで増減を賄うため、上限を超えたら1本に戻す。
  // チップは半分幅の2行なので、−ボタンを置くと文字が入らない。
  const bumpCount = (key: string) => {
    if (isPending) return
    setCounts(prev => ({
      ...prev,
      [key]: ((prev[key] ?? 1) % QUICK_ADD_MAX_TAP_COUNT) + 1,
    }))
  }

  const handleTap = (c: QuickAddCandidate) => {
    if (isPending) return // 二重タップ・別チップの同時タップを弾く
    const count = countOf(c.key)
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
          count,
        })
        setCounts(prev => ({ ...prev, [c.key]: 1 }))
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
          const count  = countOf(c.key)
          const totalG = c.pureAlcoholG * count
          return (
            <div key={c.key} className="relative flex-1 min-w-[calc(50%-0.25rem)]">
              <button
                onClick={() => handleTap(c)}
                disabled={isPending}
                aria-busy={tapped}
                className={`w-full rounded-2xl border pl-3 pr-12 py-2.5 text-left
                  transition-all active:scale-[0.98] disabled:opacity-50
                  ${tapped
                    ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'}`}
              >
                <span className="block text-sm font-medium text-slate-700">
                  {c.label} {c.volumeMl}ml
                </span>
                <span className="block text-xs text-indigo-500 mt-0.5">
                  {tapped
                    ? '記録中...'
                    : count > 1
                      ? `${count}本 · ${totalG.toFixed(1)}g`
                      : `${totalG.toFixed(1)}g`}
                </span>
              </button>

              <button
                onClick={() => bumpCount(c.key)}
                disabled={isPending}
                aria-label={`${c.label}の本数を増やす`}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full
                  text-xs font-semibold transition-colors disabled:opacity-50
                  ${count > 1
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-500'}`}
              >
                {count > 1 ? `×${count}` : '+'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
