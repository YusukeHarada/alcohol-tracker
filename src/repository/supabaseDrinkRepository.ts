import { createServerClient } from '@/lib/supabase/server'
import type { IDrinkRepository, IDailySummaryRepository, NewDrinkInput } from './drinkRepository'
import type { DrinkRecord, DailySummary } from '@/lib/types'

export class SupabaseDrinkRepository implements IDrinkRepository {
  async add(input: NewDrinkInput): Promise<DrinkRecord> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('drink_records')
      .insert({
        user_id: input.userId,
        date: input.date,
        category: input.category,
        volume_ml: input.volumeMl,
        alcohol_percent: input.alcoholPercent,
        pure_alcohol_g: input.pureAlcoholG,
        memo: input.memo,
      })
      .select()
      .single()
    if (error) throw error
    return toRecord(data)
  }

  async listByDate(date: string): Promise<DrinkRecord[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('drink_records')
      .select('*')
      .eq('date', date)
      .order('created_at')
    if (error) throw error
    return (data ?? []).map(toRecord)
  }

  async update(id: string, patch: Partial<NewDrinkInput>): Promise<DrinkRecord> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('drink_records')
      .update({
        ...(patch.volumeMl !== undefined && { volume_ml: patch.volumeMl }),
        ...(patch.alcoholPercent !== undefined && { alcohol_percent: patch.alcoholPercent }),
        ...(patch.pureAlcoholG !== undefined && { pure_alcohol_g: patch.pureAlcoholG }),
        ...(patch.memo !== undefined && { memo: patch.memo }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return toRecord(data)
  }

  async delete(id: string): Promise<void> {
    const supabase = await createServerClient()
    const { error } = await supabase.from('drink_records').delete().eq('id', id)
    if (error) throw error
  }
}

export class SupabaseDailySummaryRepository implements IDailySummaryRepository {
  async listByMonth(year: number, month: number): Promise<DailySummary[]> {
    const supabase = await createServerClient()
    const from = `${year}-${String(month).padStart(2, '0')}-01`
    const to   = `${year}-${String(month).padStart(2, '0')}-31`
    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .gte('date', from)
      .lte('date', to)
    if (error) throw error
    return (data ?? []).map(toSummary)
  }

  async upsert(date: string, totalAlcoholG: number): Promise<DailySummary> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('daily_summaries')
      .upsert({ date, total_alcohol_g: totalAlcoholG })
      .select()
      .single()
    if (error) throw error
    return toSummary(data)
  }
}

function toRecord(d: any): DrinkRecord {
  return {
    id:             d.id,
    userId:         d.user_id,
    date:           d.date,
    category:       d.category,
    volumeMl:       d.volume_ml,
    alcoholPercent: d.alcohol_percent,
    pureAlcoholG:   d.pure_alcohol_g,
    memo:           d.memo,
    createdAt:      d.created_at,
    updatedAt:      d.updated_at,
  }
}

function toSummary(d: any): DailySummary {
  return {
    id:            d.id,
    userId:        d.user_id,
    date:          d.date,
    totalAlcoholG: d.total_alcohol_g,
    isRestDay:     d.is_rest_day,
  }
}
