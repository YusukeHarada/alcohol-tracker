import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { SupabaseDrinkRepository, SupabaseDailySummaryRepository } from '@/repository/supabaseDrinkRepository'
import { SupabaseGoalRepository } from '@/repository/supabaseGoalRepository'
import { SupabaseTemplateRepository } from '@/repository/supabaseTemplateRepository'
import { calcDailyTotal, isRestDay } from '@/domain/alcohol'
import {
  calcWeeklyTotal,
  countRestDays,
  hasRestDayThisWeek,
  getConsecutiveDrinkingDays,
} from '@/domain/weeklyStats'
import { DailySummaryCard } from '@/components/DailySummaryCard/DailySummaryCard'
import { WarningBanner } from '@/components/WarningBanner/WarningBanner'
import { QuickAddButton } from '@/components/QuickAddButton/QuickAddButton'
import { GoalCard } from '@/components/GoalCard/GoalCard'
import { DateNav } from '@/components/DateNav/DateNav'

type Props = {
  searchParams: Promise<{ date?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const params       = await searchParams
  const today        = format(new Date(), 'yyyy-MM-dd')
  const selectedDate = params.date ?? today

  const drinkRepo    = new SupabaseDrinkRepository()
  const summaryRepo  = new SupabaseDailySummaryRepository()
  const goalRepo     = new SupabaseGoalRepository()
  const templateRepo = new SupabaseTemplateRepository()

  // 選択日のレコードと週次サマリーを並列取得（DBアクセス3回に削減）
  const weekStart = format(
    startOfWeek(new Date(selectedDate + 'T00:00:00'), { weekStartsOn: 1 }),
    'yyyy-MM-dd'
  )
  const weekEnd = format(
    endOfWeek(new Date(selectedDate + 'T00:00:00'), { weekStartsOn: 1 }),
    'yyyy-MM-dd'
  )

  const [selectedRecords, weeklySummaries, goal, templates] = await Promise.all([
    drinkRepo.listByDate(selectedDate),
    summaryRepo.listByRange(weekStart, weekEnd),
    goalRepo.get(),
    templateRepo.list(),
  ])

  // 週次集計をsummaryMapから構築（DBアクセスなし）
  const summaryMap = Object.fromEntries(weeklySummaries.map(s => [s.date, s.totalAlcoholG]))
  const weekDays   = eachDayOfInterval({
    start: new Date(weekStart + 'T00:00:00'),
    end:   new Date(weekEnd   + 'T00:00:00'),
  })
  const weeklyRecords = weekDays.map(d => {
    const dateStr = format(d, 'yyyy-MM-dd')
    return { date: dateStr, totalAlcoholG: summaryMap[dateStr] ?? 0 }
  })

  const dailyTotal      = calcDailyTotal(selectedRecords)
  const weeklyTotal     = calcWeeklyTotal(weeklyRecords)
  const restDays        = countRestDays(weeklyRecords)
  const consecutiveDays = getConsecutiveDrinkingDays(weeklyRecords)
  const hasRestDay      = hasRestDayThisWeek(weeklyRecords)

  return (
    <main className="max-w-md mx-auto px-4 py-6 space-y-4">
      <DateNav date={selectedDate} today={today} />

      <WarningBanner
        dailyTotalG={dailyTotal}
        weeklyTotalG={weeklyTotal}
        consecutiveDays={consecutiveDays}
        hasRestDayThisWeek={hasRestDay}
      />

      {goal && (
        <GoalCard
          goal={goal}
          actual={{
            dailyTotalG:    dailyTotal,
            weeklyRestDays: restDays,
            weeklyTotalG:   weeklyTotal,
          }}
        />
      )}

      <DailySummaryCard
        dailyTotalG={dailyTotal}
        weeklyTotalG={weeklyTotal}
        restDaysThisWeek={restDays}
        isRestDay={isRestDay(selectedRecords)}
        records={selectedRecords}
      />

      <QuickAddButton date={selectedDate} templates={templates} />
    </main>
  )
}
