import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { todayJst, shiftDateString } from '@/domain/jstDate'

// 「今日」の判定はすべてJSTの日付文字列どうしの比較で行う。
// DateNavは'use client'だがSSRもされるため、サーバー（UTC）と端末のTZで
// 判定が割れると「今日」の表示がハイドレーション時に入れ替わってしまう。

export function formatDisplayDate(dateStr: string): string {
  const today = todayJst()
  if (dateStr === today) return '今日'
  if (dateStr === shiftDateString(today, -1)) return '昨日'

  return format(new Date(dateStr + 'T00:00:00'), 'M月d日（E）', { locale: ja })
}

export function getPrevDate(dateStr: string): string {
  return shiftDateString(dateStr, -1)
}

export function getNextDate(dateStr: string): string {
  return shiftDateString(dateStr, 1)
}

export function isToday(dateStr: string): boolean {
  return dateStr === todayJst()
}
