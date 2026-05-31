'use client'

import { useState } from 'react'
import { registerRestDay } from '@/actions/restDayActions'

type Props = {
  date: string
  isRestDay: boolean
  hasRecords: boolean
}

export function RestDayButton({ date, isRestDay, hasRecords }: Props) {
  const [loading, setLoading] = useState(false)

  // 記録がある日は表示しない
  if (hasRecords) return null

  const handleRegister = async () => {
    setLoading(true)
    await registerRestDay(date)
    setLoading(false)
  }

  if (isRestDay) {
    return (
      <div className="w-full py-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
        <span className="text-blue-600 text-sm font-medium">🌿 休肝日として記録済み</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleRegister}
      disabled={loading}
      className="w-full py-3 rounded-xl border border-blue-300 text-blue-500 text-sm disabled:opacity-50"
    >
      {loading ? '登録中...' : '🌿 休肝日として記録する'}
    </button>
  )
}
