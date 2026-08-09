import { createAdminClient } from '@/lib/supabase/admin'
import { calcWeeklyTotal, countRestDays } from '@/domain/weeklyStats'
import { shiftDateString } from '@/domain/jstDate'
import type { ReminderState } from '@/domain/reminder'
import type { UserGoal } from '@/lib/types'

/**
 * cronからリマインドに必要な状態を読む。
 *
 * interface＋実装の2ファイル構成にしていないのは、差し替え先が存在せず、
 * テスト対象がプレーンな構造体を受け取る buildReminderMessage だから。
 *
 * service_roleキーを使うためRLSが効かない。全クエリで user_id を明示フィルタすること。
 * このモジュールは読み取り専用に保つ。
 */
export async function fetchReminderState(
  userId: string,
  date: string,
  weekStart: string
): Promise<ReminderState> {
  const supabase = createAdminClient()

  const [recordsRes, summariesRes, goalRes] = await Promise.all([
    supabase
      .from('drink_records')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .limit(1),
    supabase
      .from('daily_summaries')
      .select('date, total_alcohol_g, is_rest_day')
      .eq('user_id', userId)
      .gte('date', weekStart)
      .lte('date', date)
      .order('date'),
    supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  if (recordsRes.error)   throw recordsRes.error
  if (summariesRes.error) throw summariesRes.error

  const totalMap   = new Map<string, number>()
  const restDayMap = new Map<string, boolean>()
  for (const s of summariesRes.data ?? []) {
    totalMap.set(s.date as string, Number(s.total_alcohol_g))
    restDayMap.set(s.date as string, Boolean(s.is_rest_day))
  }

  // src/app/page.tsx と同様、週の7日ぶんを必ず materialize する。
  // daily_summaries に行が無い日は0g＝休肝日として数える必要があるため、
  // 取得できた行だけを集計すると休肝日を過少カウントしてしまう。
  const weekDays: { date: string; totalAlcoholG: number }[] = []
  for (let d = weekStart; d <= date; d = shiftDateString(d, 1)) {
    weekDays.push({ date: d, totalAlcoholG: totalMap.get(d) ?? 0 })
  }

  const isRegisteredRestDay = restDayMap.get(date) ?? false

  // 今日はまだ飲酒の有無が確定していないため、休肝日登録済みでない限りカウントから除外する
  const restDaySource = weekDays.filter(d => d.date !== date || isRegisteredRestDay)

  // goalRes.error は無視する（未設定なら null 扱い。SupabaseGoalRepository.get() と同じ挙動）
  const goalRow = goalRes.data
  const goal: UserGoal | null = goalRow
    ? {
        id:             goalRow.id,
        userId:         goalRow.user_id,
        dailyLimitG:    Number(goalRow.daily_limit_g),
        weeklyRestDays: Number(goalRow.weekly_rest_days),
        weeklyLimitG:   Number(goalRow.weekly_limit_g),
      }
    : null

  return {
    date,
    hasRecords:     (recordsRes.data ?? []).length > 0,
    isRegisteredRestDay,
    weeklyTotalG:   calcWeeklyTotal(weekDays),
    weeklyRestDays: countRestDays(restDaySource),
    goal,
  }
}
