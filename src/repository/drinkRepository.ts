import type { DrinkRecord, DailySummary } from '@/lib/types'

export type NewDrinkInput = Omit<DrinkRecord, 'id' | 'createdAt' | 'updatedAt'>

export interface IDrinkRepository {
  add(record: NewDrinkInput): Promise<DrinkRecord>
  listByDate(date: string): Promise<DrinkRecord[]>
  update(id: string, patch: Partial<NewDrinkInput>): Promise<DrinkRecord>
  delete(id: string): Promise<void>
}

export interface IDailySummaryRepository {
  listByMonth(year: number, month: number): Promise<DailySummary[]>
  listByRange(from: string, to: string): Promise<DailySummary[]>
  upsert(date: string, totalAlcoholG: number, isRestDay?: boolean): Promise<DailySummary>
  deleteByDate(date: string): Promise<void>
}