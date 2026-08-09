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
import { buildQuickAddCandidates } from '@/domain/quickAdd'
import { todayJst, shiftDateString } from '@/domain/jstDate'
import { QUICK_ADD_LOOKBACK_DAYS } from '@/constants/alcohol'
import { DailySummaryCard } from '@/components/DailySummaryCard/DailySummaryCard'
import { WarningBanner } from '@/components/WarningBanner/WarningBanner'
import { QuickAddButton } from '@/components/QuickAddButton/QuickAddButton'
import { QuickAddChips } from '@/components/QuickAddChips/QuickAddChips'
import { GoalCard } from '@/components/GoalCard/GoalCard'
import { DateNav } from '@/components/DateNav/DateNav'
import { RestDayButton } from '@/components/RestDayButton/RestDayButton'

type Props = {
  searchParams: Promise<{ date?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const params       = await searchParams
  const today        = todayJst()
  const selectedDate = params.date ?? today

  const drinkRepo    = new SupabaseDrinkRepository()
  const summaryRepo  = new SupabaseDailySummaryRepository()
  const goalRepo     = new SupabaseGoalRepository()
  const templateRepo = new SupabaseTemplateRepository()

  const weekEnd   = selectedDate
  const weekStart = shiftDateString(selectedDate, -6)
  // ワンタップ記録チップの元になる履歴の範囲
  const lookbackStart = shiftDateString(selectedDate, -(QUICK_ADD_LOOKBACK_DAYS - 1))

  const [selectedRecords, weeklySummaries, selectedSummaries, goal, templates, historyRecords] =
    await Promise.all([
      drinkRepo.listByDate(selectedDate),
      summaryRepo.listByRange(weekStart, weekEnd),
      summaryRepo.listByRange(selectedDate, selectedDate),
      goalRepo.get(),
      templateRepo.list(),
      drinkRepo.listByRange(lookbackStart, selectedDate),
    ])

  const summaryMap     = Object.fromEntries(weeklySummaries.map(s => [s.date, s.totalAlcoholG]))
  const restDaySummary = Object.fromEntries(weeklySummaries.map(s => [s.date, s.isRestDay]))
  const weeklyRecords  = Array.from({ length: 7 }, (_, i) => {
    const dateStr = shiftDateString(weekStart, i)
    return { date: dateStr, totalAlcoholG: summaryMap[dateStr] ?? 0 }
  })
  // 今日はまだ飲酒の有無が確定していないため、休肝日登録済みでない限り休肝日カウントから除外する
  const restDayRecords = weeklyRecords.filter(r => r.date !== today || restDaySummary[today])

  const dailyTotal      = calcDailyTotal(selectedRecords)
  const weeklyTotal     = calcWeeklyTotal(weeklyRecords)
  const restDays        = countRestDays(restDayRecords)
  const consecutiveDays = getConsecutiveDrinkingDays(weeklyRecords)
  const hasRestDay      = hasRestDayThisWeek(restDayRecords)

  // daily_summariesに休肝日レコードが存在するか
  const isRegisteredRestDay = selectedSummaries.length > 0 && selectedSummaries[0].isRestDay
  const hasRecords          = selectedRecords.length > 0

  const quickAddCandidates = buildQuickAddCandidates(historyRecords)

  return (
    <main className="max-w-md mx-auto px-4 py-6 space-y-4">
      <DateNav date={selectedDate} today={today} />

      <WarningBanner
        dailyTotalG={dailyTotal}
        weeklyTotalG={weeklyTotal}
        consecutiveDays={consecutiveDays}
        hasRestDayThisWeek={hasRestDay}
        goal={goal}
      />

      <QuickAddChips date={selectedDate} candidates={quickAddCandidates} />

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
        date={selectedDate}
        dailyTotalG={dailyTotal}
        weeklyTotalG={weeklyTotal}
        restDaysThisWeek={restDays}
        isRestDay={isRestDay(selectedRecords)}
        records={selectedRecords}
        goal={goal}
      />

      <RestDayButton
        date={selectedDate}
        isRestDay={isRegisteredRestDay}
        hasRecords={hasRecords}
      />

      <QuickAddButton date={selectedDate} templates={templates} />
    </main>
  )
}
