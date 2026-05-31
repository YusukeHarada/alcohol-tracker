'use client'

import { useRouter } from 'next/navigation'
import { getPrevDate, getNextDate, formatDisplayDate, isToday } from '@/domain/dateNav'

type Props = {
  date: string
  today: string
}

export function DateNav({ date, today }: Props) {
  const router    = useRouter()
  const isAtToday = isToday(date)

  const goTo = (d: string) => {
    if (d === today) {
      router.push('/')
    } else {
      router.push(`/?date=${d}`)
    }
  }

  return (
    <div className="flex items-center justify-between px-1">
      <button
        onClick={() => goTo(getPrevDate(date))}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="text-center">
        <h1 className="text-base font-semibold text-slate-800">
          {formatDisplayDate(date)}
        </h1>
        {!isAtToday && (
          <button
            onClick={() => goTo(today)}
            className="text-xs text-indigo-500 hover:text-indigo-700 mt-0.5 transition-colors"
          >
            今日に戻る
          </button>
        )}
      </div>

      <button
        onClick={() => goTo(getNextDate(date))}
        disabled={isAtToday}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:pointer-events-none"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}
