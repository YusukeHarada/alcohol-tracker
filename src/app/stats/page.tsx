import { format, subDays, eachDayOfInterval } from 'date-fns'
import { ja } from 'date-fns/locale'
import { SupabaseDailySummaryRepository } from '@/repository/supabaseDrinkRepository'
import { buildWeeklyBarData, calcMonthlyStats } from '@/domain/stats'
import { BarChart } from '@/components/BarChart/BarChart'
import { StatsNav } from '@/components/StatsNav/StatsNav'

type Props = {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function StatsPage({ searchParams }: Props) {
  const params = await searchParams
  const now   = new Date()
  const year  = parseInt(params.year  ?? String(now.getFullYear()))
  const month = parseInt(params.month ?? String(now.getMonth() + 1))

  const summaryRepo = new SupabaseDailySummaryRepository()
  const summaries   = await summaryRepo.listByMonth(year, month)

  const dailyRecords = summaries.map(s => ({
    date: s.date,
    totalAlcoholG: s.totalAlcoholG,
  }))

  const weekEnd   = now
  const weekStart = subDays(now, 6)
  const weekDays  = eachDayOfInterval({ start: weekStart, end: weekEnd })
  const weeklyRecords = weekDays.map(d => {
    const dateStr = format(d, 'yyyy-MM-dd')
    const found   = summaries.find(s => s.date === dateStr)
    return { date: dateStr, totalAlcoholG: found?.totalAlcoholG ?? 0 }
  })

  const weeklyBarData = buildWeeklyBarData(weeklyRecords)
  const monthlyStats  = calcMonthlyStats(dailyRecords)

  return (
    <main className="max-w-md mx-auto px-4 py-6 space-y-6">
      <StatsNav year={year} month={month} />

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          {format(new Date(year, month - 1), 'yyyy年M月', { locale: ja })} のまとめ
        </h2>
        <div className="grid grid-cols-2 gap-5">
          <StatItem label="1日平均"  value={`${monthlyStats.avgG.toFixed(1)} g`} />
          <StatItem label="最大摂取量" value={`${monthlyStats.maxG.toFixed(0)} g`} />
          <StatItem label="休肝日数"  value={`${monthlyStats.restDays} 日`} />
          <StatItem
            label="休肝率"
            value={`${(monthlyStats.restRate * 100).toFixed(0)} %`}
            highlight={monthlyStats.restRate >= 0.3}
          />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">直近7日間の飲酒量</h2>
        <BarChart data={weeklyBarData} />
        <p className="text-xs text-slate-400 mt-2">破線は推奨上限（40g）</p>
      </section>
    </main>
  )
}

function StatItem({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-xl font-semibold ${highlight ? 'text-indigo-600' : 'text-slate-800'}`}>
        {value}
      </span>
    </div>
  )
}
