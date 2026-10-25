'use client'

import { buildCalendarDays, getDayStatus } from '@/domain/calendar'
import { todayJst } from '@/domain/jstDate'
import type { DayStatus } from '@/domain/calendar'
import type { DailySummary } from '@/lib/types'

type Props = {
  year: number
  month: number
  summaries: DailySummary[]
  onDayClick: (date: string) => void
  /** 複数日選択モードで選ばれている日 */
  selectedDates?: string[]
  /** 赤（上限超え）にする1日の量。目標の上限を渡す */
  dailyLimitG?: number
}

const STATUS_CLASS: Record<DayStatus, string> = {
  empty:    'text-gray-300',
  rest:     'bg-blue-100 text-blue-700 font-medium',
  drinking: 'bg-yellow-100 text-yellow-700',
  over:     'bg-red-100 text-red-700 font-medium',
}

export function Calendar({ year, month, summaries, onDayClick, selectedDates = [], dailyLimitG }: Props) {
  const days       = buildCalendarDays(year, month)
  const summaryMap = Object.fromEntries(summaries.map(s => [s.date, s]))
  const firstDow   = new Date(year, month - 1, 1).getDay()
  const today      = todayJst()

  return (
    <div>
      <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-1">
        {['日','月','火','水','木','金','土'].map(d => (
          <span key={d} className="py-1">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map(date => {
          const s       = summaryMap[date] ?? null
          const summary = s
            ? { totalAlcoholG: s.totalAlcoholG, isRestDay: s.isRestDay }
            : null
          const status  = getDayStatus(summary, dailyLimitG)
          const day     = parseInt(date.split('-')[2])
          const isToday    = date === today
          const isSelected = selectedDates.includes(date)
          const ringClass  =
            isSelected ? 'ring-2 ring-indigo-500 ring-offset-1'
            : isToday  ? 'ring-2 ring-gray-500'
            : ''

          return (
            <div
              key={date}
              data-testid={`day-${date}`}
              data-status={status}
              data-selected={isSelected || undefined}
              onClick={() => onDayClick(date)}
              className={`rounded-lg p-1 text-center cursor-pointer text-sm ${STATUS_CLASS[status]} ${ringClass}`}
            >
              <span className={`block ${isToday ? 'font-bold' : ''}`}>{day}</span>
              {summary && summary.totalAlcoholG > 0 && (
                <span className="block text-xs">
                  {summary.totalAlcoholG.toFixed(0)}g
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
