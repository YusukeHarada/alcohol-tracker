'use client'

import { useState } from 'react'
import { Calendar } from '@/components/Calendar/Calendar'
import { CalendarNav } from '@/components/CalendarNav/CalendarNav'
import { CalendarDayModal } from '@/components/CalendarDayModal/CalendarDayModal'
import { addDrinkRecord, updateDrinkRecord, deleteDrinkRecord } from '@/actions/drinkActions'
import { createClientSideClient } from '@/lib/supabase/client'
import type { DailySummary, DrinkRecord } from '@/lib/types'

type Props = {
  year: number
  month: number
  summaries: DailySummary[]
}

export function CalendarView({ year, month, summaries }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayRecords,   setDayRecords]   = useState<DrinkRecord[]>([])
  const [loading,      setLoading]      = useState(false)

  const fetchDayRecords = async (date: string) => {
    setLoading(true)
    const supabase = createClientSideClient()
    const { data } = await supabase
      .from('drink_records')
      .select('*')
      .eq('date', date)
      .order('created_at')

    setDayRecords(
      (data ?? []).map((d: any) => ({
        id:             d.id,
        userId:         d.user_id,
        date:           d.date,
        category:       d.category,
        volumeMl:       d.volume_ml,
        alcoholPercent: d.alcohol_percent,
        pureAlcoholG:   d.pure_alcohol_g,
        memo:           d.memo,
        createdAt:      d.created_at,
        updatedAt:      d.updated_at,
      }))
    )
    setLoading(false)
  }

  const handleDayClick = async (date: string) => {
    setSelectedDate(date)
    await fetchDayRecords(date)
  }

  const handleAdd = async (values: {
    category: string
    volumeMl: number
    alcoholPercent: number
    pureAlcoholG: number
    memo: string
  }) => {
    if (!selectedDate) return
    await addDrinkRecord({ ...values, date: selectedDate })
    await fetchDayRecords(selectedDate)
  }

  const handleUpdate = async (id: string, patch: { memo: string }) => {
    if (!selectedDate) return
    await updateDrinkRecord(id, patch, selectedDate)
    await fetchDayRecords(selectedDate)
  }

  const handleDelete = async (id: string) => {
    if (!selectedDate) return
    await deleteDrinkRecord(id, selectedDate)
    await fetchDayRecords(selectedDate)
  }

  return (
    <>
      <CalendarNav year={year} month={month} />
      <Calendar
        year={year}
        month={month}
        summaries={summaries}
        onDayClick={handleDayClick}
      />

      {selectedDate && !loading && (
        <CalendarDayModal
          date={selectedDate}
          records={dayRecords}
          onClose={() => setSelectedDate(null)}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}
