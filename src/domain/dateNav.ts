import { format, addDays, subDays, isToday as _isToday } from 'date-fns'
import { ja } from 'date-fns/locale'

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  if (_isToday(date)) return '今日'

  const yesterday = subDays(new Date(), 1)
  const yesterdayStr = format(yesterday, 'yyyy-MM-dd')
  if (dateStr === yesterdayStr) return '昨日'

  return format(date, 'M月d日（E）', { locale: ja })
}

export function getPrevDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return format(subDays(date, 1), 'yyyy-MM-dd')
}

export function getNextDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return format(addDays(date, 1), 'yyyy-MM-dd')
}

export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr + 'T00:00:00')
  return _isToday(date)
}