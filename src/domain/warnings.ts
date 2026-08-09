import {
  DAILY_LIMIT_G,
  WEEKLY_LIMIT_G,
  CONSECUTIVE_ALERT_DAYS,
} from '@/constants/alcohol'
import type { UserGoal } from '@/lib/types'

/** alert: 設定した上限を超えている / caution: 上限内だが習慣として注意したい */
export type WarningLevel = 'alert' | 'caution'

export type Warning = {
  key:     'weeklyOver' | 'dailyOver' | 'consecutive' | 'restDayShort'
  level:   WarningLevel
  message: string
}

export type WarningInput = {
  dailyTotalG:     number
  weeklyTotalG:    number
  weeklyRestDays:  number
  consecutiveDays: number
  goal:            UserGoal | null
}

/**
 * 該当する警告を重い順に返す。
 *
 * しきい値はユーザーが設定した目標を優先し、未設定のときだけ定数にフォールバックする。
 *
 * 「直近7日に休肝日がありません」という警告は廃止した。休肝日が0日という状態は
 * 必ず7日連続飲酒でもあるため（getConsecutiveDrinkingDaysは末尾から数える）、
 * consecutive と完全に重複していた。日数が出るぶん consecutive のほうが情報量が多い。
 * 代わりに「目標の休肝日数に届いていない」を見るようにしたので、
 * 「休肝日は1日あるが目標は2日」のような、連続飲酒では拾えない状態を拾える。
 */
export function buildWarnings(input: WarningInput): Warning[] {
  const dailyLimit    = input.goal?.dailyLimitG    ?? DAILY_LIMIT_G
  const weeklyLimit   = input.goal?.weeklyLimitG   ?? WEEKLY_LIMIT_G
  // 目標未設定なら「1日も休肝日がない」ときだけ注意する
  const restDayTarget = input.goal?.weeklyRestDays ?? 1

  const warnings: Warning[] = []

  // 累積の負荷が一番重い
  if (input.weeklyTotalG > weeklyLimit) {
    warnings.push({
      key:     'weeklyOver',
      level:   'alert',
      message: `直近7日の飲酒量が上限（${weeklyLimit}g）を超えています`,
    })
  }
  if (input.dailyTotalG > dailyLimit) {
    warnings.push({
      key:     'dailyOver',
      level:   'alert',
      message: `この日の飲酒量が上限（${dailyLimit}g）を超えています`,
    })
  }
  if (input.consecutiveDays >= CONSECUTIVE_ALERT_DAYS) {
    warnings.push({
      key:     'consecutive',
      level:   'caution',
      message: `${input.consecutiveDays}日連続で飲酒しています`,
    })
  }
  if (input.weeklyRestDays < restDayTarget) {
    warnings.push({
      key:     'restDayShort',
      level:   'caution',
      message: `直近7日の休肝日が${input.weeklyRestDays}日です（目標${restDayTarget}日）`,
    })
  }

  return warnings
}

/**
 * 表示する警告を1件だけ選ぶ。
 *
 * 該当するものを全部並べると週6日飲む人には常時点灯し、背景と同じになって
 * 肝心なときに効かない。常に「いま一番重いもの」だけを出す。
 */
export function selectWarning(input: WarningInput): Warning | null {
  return buildWarnings(input)[0] ?? null
}
