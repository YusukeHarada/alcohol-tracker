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

  if (hasRecords) return null

  const handleRegister = async () => {
    setLoading(true)
    await registerRestDay(date)
    setLoading(false)
  }

  if (isRestDay) {
    return (
      <div className="w-full py-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
        <span className="text-emerald-600 text-sm font-medium">休肝日として記録済み</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleRegister}
      disabled={loading}
      className="w-full py-3.5 rounded-2xl border border-slate-200 text-slate-500 text-sm font-medium hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
    >
      {loading ? '登録中...' : '休肝日として記録する'}
    </button>
  )
}
