'use client'

import { useState } from 'react'
import { Calendar } from '@/components/Calendar/Calendar'
import { CalendarNav } from '@/components/CalendarNav/CalendarNav'
import { CalendarDayModal } from '@/components/CalendarDayModal/CalendarDayModal'
import { CalendarBulkAddModal } from '@/components/CalendarBulkAddModal/CalendarBulkAddModal'
import {
  addDrinkRecord,
  addDrinkRecordsToDates,
  updateDrinkRecord,
  deleteDrinkRecord,
} from '@/actions/drinkActions'
import { toggleDate, MAX_BULK_DATES } from '@/domain/multiDate'
import type { CountedDrinkEntry } from '@/domain/drinkEntry'
import type { DrinkRecordPatch } from '@/components/DrinkRecordItem/DrinkRecordItem'
import { createClientSideClient } from '@/lib/supabase/client'
import type { DailySummary, DrinkRecord } from '@/lib/types'

type Props = {
  year: number
  month: number
  summaries: DailySummary[]
  dailyLimitG?: number
}

export function CalendarView({ year, month, summaries, dailyLimitG }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayRecords,   setDayRecords]   = useState<DrinkRecord[]>([])
  const [loading,      setLoading]      = useState(false)
  const [multiSelect,   setMultiSelect]   = useState(false)
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [showBulkAdd,   setShowBulkAdd]   = useState(false)

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
    if (multiSelect) {
      setSelectedDates(prev => toggleDate(prev, date))
      return
    }
    setSelectedDate(date)
    await fetchDayRecords(date)
  }

  const exitMultiSelect = () => {
    setMultiSelect(false)
    setSelectedDates([])
    setShowBulkAdd(false)
  }

  const handleBulkAdd = async (entries: CountedDrinkEntry[]) => {
    await addDrinkRecordsToDates(selectedDates, entries)
    exitMultiSelect()
  }

  const handleAdd = async (values: CountedDrinkEntry) => {
    if (!selectedDate) return
    await addDrinkRecord({ ...values, date: selectedDate })
    await fetchDayRecords(selectedDate)
  }

  const handleUpdate = async (id: string, patch: DrinkRecordPatch) => {
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
        selectedDates={multiSelect ? selectedDates : []}
        dailyLimitG={dailyLimitG}
      />

      {multiSelect ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 text-center">
            日付をタップして選択（{selectedDates.length}日選択中）
          </p>
          {selectedDates.length > MAX_BULK_DATES && (
            <p className="text-xs text-red-500 text-center">
              一度に追加できるのは{MAX_BULK_DATES}日までです
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={exitMultiSelect}
              className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm"
            >
              キャンセル
            </button>
            <button
              onClick={() => setShowBulkAdd(true)}
              disabled={selectedDates.length === 0 || selectedDates.length > MAX_BULK_DATES}
              className="flex-1 py-3 rounded-xl bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50"
            >
              {selectedDates.length}日にまとめて追加
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setMultiSelect(true)}
          className="w-full py-3 border border-indigo-300 text-indigo-500 rounded-xl text-sm"
        >
          複数日を選択してまとめて追加
        </button>
      )}

      {showBulkAdd && (
        <CalendarBulkAddModal
          dates={selectedDates}
          onClose={() => setShowBulkAdd(false)}
          onSubmit={handleBulkAdd}
        />
      )}

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
