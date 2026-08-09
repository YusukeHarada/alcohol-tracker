import { isOverWeeklyLimit } from './weeklyStats'
import { formatShortDate } from './jstDate'
import type { UserGoal } from '@/lib/types'

export type ReminderState = {
  date:                string  // JSTのyyyy-MM-dd
  hasRecords:          boolean // 当日のdrink_recordsが1件以上ある
  isRegisteredRestDay: boolean // 当日が休肝日として登録済み
  weeklyTotalG:        number  // 当日を含む直近7日の合計
  weeklyRestDays:      number
  goal:                UserGoal | null
}

/**
 * リマインドとして送るべきメッセージを返す。送る必要がなければnull。
 *
 * 記録済みの日には送らない。毎晩必ず届く通知は読み飛ばされるようになり、
 * 肝心の未記録日の通知まで無視されてしまうため。
 */
export function buildReminderMessage(state: ReminderState, appUrl: string): string | null {
  if (state.hasRecords || state.isRegisteredRestDay) return null

  const lines = [
    `🍶 ${formatShortDate(state.date)} の記録がまだです`,
    '',
    `直近7日: 合計 ${state.weeklyTotalG.toFixed(1)}g ／ 休肝日 ${state.weeklyRestDays}日`,
  ]

  if (state.goal) {
    lines.push(
      `目標: ${state.goal.weeklyLimitG}g以下 ／ 休肝日 ${state.goal.weeklyRestDays}日以上`
    )
    if (isOverWeeklyLimit(state.weeklyTotalG, state.goal.weeklyLimitG)) {
      lines.push('⚠️ 週の上限を超えています')
    }
  }

  lines.push('', '飲んだら記録、飲んでいなければ休肝日を登録しましょう', appUrl)

  return lines.join('\n')
}
