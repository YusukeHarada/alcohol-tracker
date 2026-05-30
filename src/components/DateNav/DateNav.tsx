'use client'

import { useRouter } from 'next/navigation'
import { getPrevDate, getNextDate, formatDisplayDate, isToday } from '@/domain/dateNav'

type Props = {
  date: string
  today: string
}

export function DateNav({ date, today }: Props) {
  const router  = useRouter()
  const isAtToday = isToday(date)

  const goTo = (d: string) => {
    if (d === today) {
      router.push('/')
    } else {
      router.push(`/?date=${d}`)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => goTo(getPrevDate(date))}
        className="p-2 text-gray-400 hover:text-gray-600"
      >
        ←
      </button>

      <div className="text-center">
        <h1 className="text-lg font-semibold">
          {formatDisplayDate(date)}
        </h1>
        {!isAtToday && (
          <button
            onClick={() => goTo(today)}
            className="text-xs text-blue-500 mt-0.5"
          >
            今日に戻る
          </button>
        )}
      </div>

      <button
        onClick={() => goTo(getNextDate(date))}
        disabled={isAtToday}
        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
      >
        →
      </button>
    </div>
  )
}
