import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
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
import { DailySummaryCard } from '@/components/DailySummaryCard/DailySummaryCard'
import { WarningBanner } from '@/components/WarningBanner/WarningBanner'
import { QuickAddButton } from '@/components/QuickAddButton/QuickAddButton'
import { GoalCard } from '@/components/GoalCard/GoalCard'

export default async function HomePage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const drinkRepo    = new SupabaseDrinkRepository()
  const goalRepo     = new SupabaseGoalRepository()
  const templateRepo = new SupabaseTemplateRepository()

  const [todayRecords, goal, templates] = await Promise.all([
    drinkRepo.listByDate(today),
    goalRepo.get(),
    templateRepo.list(),
  ])

  const dailyTotal = calcDailyTotal(todayRecords)

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd   = endOfWeek(new Date(),   { weekStartsOn: 1 })
  const weekDays  = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const weeklyRecords = await Promise.all(
    weekDays.map(async d => {
      const dateStr = format(d, 'yyyy-MM-dd')
      const records = await drinkRepo.listByDate(dateStr)
      return { date: dateStr, totalAlcoholG: calcDailyTotal(records) }
    })
  )

  const weeklyTotal    = calcWeeklyTotal(weeklyRecords)
  const restDays       = countRestDays(weeklyRecords)
  const consecutiveDays = getConsecutiveDrinkingDays(weeklyRecords)
  const hasRestDay     = hasRestDayThisWeek(weeklyRecords)

  return (
    <main className="max-w-md mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">
        {format(new Date(), 'M月d日（E）', { locale: ja })}
      </h1>

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
            dailyTotalG:   dailyTotal,
            weeklyRestDays: restDays,
            weeklyTotalG:  weeklyTotal,
          }}
        />
      )}

      <DailySummaryCard
        dailyTotalG={dailyTotal}
        weeklyTotalG={weeklyTotal}
        restDaysThisWeek={restDays}
        isRestDay={isRestDay(todayRecords)}
        records={todayRecords}
      />

      <QuickAddButton date={today} templates={templates} />
    </main>
  )
}
