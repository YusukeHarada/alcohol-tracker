export type DrinkCategory =
  | 'beer'
  | 'sake'
  | 'wine'
  | 'whiskey'
  | 'chu-hi'
  | 'other'

export type DrinkRecord = {
  id: string
  userId: string | null
  date: string
  category: string
  volumeMl: number
  alcoholPercent: number
  pureAlcoholG: number
  memo: string | null
  createdAt: string
  updatedAt: string
}

export type DailySummary = {
  id: string
  userId: string | null
  date: string
  totalAlcoholG: number
  isRestDay: boolean
}

export type DrinkTemplateItem = {
  category: string
  volumeMl: number
  alcoholPercent: number
}

export type DrinkTemplate = {
  id: string
  userId: string | null
  name: string
  items: DrinkTemplateItem[]
}

export type UserGoal = {
  id: string
  userId: string | null
  dailyLimitG: number
  weeklyRestDays: number
  weeklyLimitG: number
}