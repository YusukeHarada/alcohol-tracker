'use client'

import { useRouter } from 'next/navigation'
import { format, addMonths, subMonths } from 'date-fns'
import { ja } from 'date-fns/locale'

type Props = {
  year: number
  month: number
}

export function CalendarNav({ year, month }: Props) {
  const router  = useRouter()
  const current = new Date(year, month - 1)

  const navigate = (date: Date) => {
    router.push(`/calendar?year=${date.getFullYear()}&month=${date.getMonth() + 1}`)
  }

  return (
    <div className="flex items-center justify-between">
      <button onClick={() => navigate(subMonths(current, 1))} className="p-2 text-gray-500">
        ←
      </button>
      <h2 className="font-medium">
        {format(current, 'yyyy年M月', { locale: ja })}
      </h2>
      <button onClick={() => navigate(addMonths(current, 1))} className="p-2 text-gray-500">
        →
      </button>
    </div>
  )
}
