import {
  DAILY_LIMIT_G,
  WEEKLY_LIMIT_G,
  CONSECUTIVE_ALERT_DAYS,
} from '@/constants/alcohol'
import type { UserGoal } from '@/lib/types'

export type WarningInput = {
  dailyTotalG:        number
  weeklyTotalG:       number
  consecutiveDays:    number
  hasRestDayThisWeek: boolean
  goal:               UserGoal | null
}

/**
 * 画面に出す警告文を組み立てる。
 *
 * しきい値はユーザーが設定した目標を優先し、未設定のときだけ定数にフォールバックする。
 * 以前は警告だけが定数（40g/280g）を見ていたため、目標を週200gにしても250gの日は
 * GoalCardが「未達」を出す一方でバナーは無言、という矛盾が同じ画面で起きていた。
 */
export function buildWarnings(input: WarningInput): string[] {
  const dailyLimit  = input.goal?.dailyLimitG  ?? DAILY_LIMIT_G
  const weeklyLimit = input.goal?.weeklyLimitG ?? WEEKLY_LIMIT_G

  const warnings: string[] = []

  if (input.dailyTotalG > dailyLimit) {
    warnings.push(`この日の飲酒量が上限（${dailyLimit}g）を超えています`)
  }
  if (input.weeklyTotalG > weeklyLimit) {
    warnings.push(`直近7日の飲酒量が上限（${weeklyLimit}g）を超えています`)
  }
  if (!input.hasRestDayThisWeek) {
    warnings.push('直近7日に休肝日がありません')
  }
  if (input.consecutiveDays >= CONSECUTIVE_ALERT_DAYS) {
    warnings.push(`${input.consecutiveDays}日連続で飲酒しています`)
  }

  return warnings
}
