import { SupabaseDailySummaryRepository } from '@/repository/supabaseDrinkRepository'
import { todayJst } from '@/domain/jstDate'
import { CalendarView } from '@/components/CalendarView/CalendarView'

type Props = {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams
  const today = todayJst()
  const year  = parseInt(params.year  ?? today.slice(0, 4))
  const month = parseInt(params.month ?? today.slice(5, 7))

  const summaryRepo = new SupabaseDailySummaryRepository()
  const summaries   = await summaryRepo.listByMonth(year, month)

  return (
    <main className="max-w-md mx-auto px-4 py-6 space-y-4">
      <CalendarView year={year} month={month} summaries={summaries} />
    </main>
  )
}
