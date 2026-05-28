import { SupabaseDailySummaryRepository } from '@/repository/supabaseDrinkRepository'
import { CalendarView } from '@/components/CalendarView/CalendarView'

type Props = {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function CalendarPage({ searchParams }: Props) {
  const params = await searchParams
  const now   = new Date()
  const year  = parseInt(params.year  ?? String(now.getFullYear()))
  const month = parseInt(params.month ?? String(now.getMonth() + 1))

  const summaryRepo = new SupabaseDailySummaryRepository()
  const summaries   = await summaryRepo.listByMonth(year, month)

  return (
    <main className="max-w-md mx-auto px-4 py-6 space-y-4">
      <CalendarView year={year} month={month} summaries={summaries} />
    </main>
  )
}
