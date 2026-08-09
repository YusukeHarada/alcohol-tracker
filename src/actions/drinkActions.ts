'use server'

import { revalidatePath } from 'next/cache'
import { calcPureAlcohol, calcDailyTotal } from '@/domain/alcohol'
import { expandByCount } from '@/domain/drinkEntry'
import type { CountedDrinkEntry } from '@/domain/drinkEntry'
import { SupabaseDrinkRepository, SupabaseDailySummaryRepository } from '@/repository/supabaseDrinkRepository'

const summaryRepo = new SupabaseDailySummaryRepository()

/**
 * 複数件をまとめて記録する。本数指定もテンプレート適用もここを通す。
 *
 * 挿入は1回、日次合計の再計算も1回に固定している。
 * 以前はテンプレート適用が addDrinkRecord を Promise.all で並列に呼んでいたため、
 * 各呼び出しが挿入途中の状態を読んで daily_summaries を古い合計で上書きしうる
 * 競合があった。daily_summaries はカレンダー・統計・週次合計・Discord通知の
 * 数字すべての元なので、ここがズレると表示全体がズレる。
 */
export async function addDrinkRecords(date: string, entries: CountedDrinkEntry[]) {
  const expanded = expandByCount(entries)
  if (expanded.length === 0) return

  const drinkRepo = new SupabaseDrinkRepository()

  await drinkRepo.addMany(expanded.map(entry => ({
    userId:         '',
    date,
    category:       entry.category,
    volumeMl:       entry.volumeMl,
    alcoholPercent: entry.alcoholPercent,
    pureAlcoholG:   entry.pureAlcoholG,
    memo:           entry.memo || null,
  })))

  const records = await drinkRepo.listByDate(date)
  const total   = calcDailyTotal(records)
  await summaryRepo.upsert(date, total)

  revalidatePath('/')
  revalidatePath('/calendar')
}

export async function addDrinkRecord(input: CountedDrinkEntry & { date: string }) {
  const { date, ...entry } = input
  await addDrinkRecords(date, [entry])
}

export async function updateDrinkRecord(
  id: string,
  patch: { volumeMl?: number; alcoholPercent?: number; memo?: string },
  date: string
) {
  const drinkRepo    = new SupabaseDrinkRepository()
  const pureAlcoholG =
    patch.volumeMl !== undefined && patch.alcoholPercent !== undefined
      ? calcPureAlcohol(patch.volumeMl, patch.alcoholPercent)
      : undefined

  await drinkRepo.update(id, {
    ...patch,
    ...(pureAlcoholG !== undefined && { pureAlcoholG }),
  })

  const records = await drinkRepo.listByDate(date)
  const total   = calcDailyTotal(records)
  await summaryRepo.upsert(date, total)

  revalidatePath('/')
  revalidatePath('/calendar')
}

export async function deleteDrinkRecord(id: string, date: string) {
  const drinkRepo = new SupabaseDrinkRepository()
  await drinkRepo.delete(id)

  const records = await drinkRepo.listByDate(date)
  const total   = calcDailyTotal(records)
  await summaryRepo.upsert(date, total)

  revalidatePath('/')
  revalidatePath('/calendar')
}