import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { SupabaseDrinkRepository } from '@/repository/supabaseDrinkRepository'
import { SupabaseGoalRepository } from '@/repository/supabaseGoalRepository'
import { SupabaseTemplateRepository } from '@/repository/supabaseTemplateRepository'
import { calcDailyTotal, isRestDay } from '@/domain/alcohol'
import {
  calcWeeklyTotal,
  countRestDays,
  hasRestDayThisWeek,
  getConsecutiveDrinkingDays,
} from '@/domain/weeklyStats'
import { formatDisplayDate } from '@/domain/dateNav'
import { DailySummaryCard } from '@/components/DailySummaryCard/DailySummaryCard'
import { WarningBanner } from '@/components/WarningBanner/WarningBanner'
import { QuickAddButton } from '@/components/QuickAddButton/QuickAddButton'
import { GoalCard } from '@/components/GoalCard/GoalCard'
import { DateNav } from '@/components/DateNav/DateNav'
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from 'date-fns'

type Props = {
  searchParams: Promise<{ date?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const params      = await searchParams
  const today       = format(new Date(), 'yyyy-MM-dd')
  const selectedDate = params.date ?? today

  const drinkRepo    = new SupabaseDrinkRepository()
  const goalRepo     = new SupabaseGoalRepository()
  const templateRepo = new SupabaseTemplateRepository()

  const [selectedRecords, goal, templates] = await Promise.all([
    drinkRepo.listByDate(selectedDate),
    goalRepo.get(),
    templateRepo.list(),
  ])

  const dailyTotal = calcDailyTotal(selectedRecords)

  // 今週の集計（表示日が含まれる週）
  const weekStart = startOfWeek(new Date(selectedDate + 'T00:00:00'), { weekStartsOn: 1 })
  const weekEnd   = endOfWeek(new Date(selectedDate + 'T00:00:00'),   { weekStartsOn: 1 })
  const weekDays  = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const weeklyRecords = await Promise.all(
    weekDays.map(async d => {
      const dateStr = format(d, 'yyyy-MM-dd')
      const records = await drinkRepo.listByDate(dateStr)
      return { date: dateStr, totalAlcoholG: calcDailyTotal(records) }
    })
  )

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
