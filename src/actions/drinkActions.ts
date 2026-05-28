'use server'

import { revalidatePath } from 'next/cache'
import { calcPureAlcohol, calcDailyTotal } from '@/domain/alcohol'
import { SupabaseDrinkRepository, SupabaseDailySummaryRepository } from '@/repository/supabaseDrinkRepository'

const drinkRepo   = new SupabaseDrinkRepository()
const summaryRepo = new SupabaseDailySummaryRepository()

export async function addDrinkRecord(input: {
  date: string
  category: string
  volumeMl: number
  alcoholPercent: number
  pureAlcoholG: number
  memo: string
}) {
  await drinkRepo.add({
    date:           input.date,
    category:       input.category,
    volumeMl:       input.volumeMl,
    alcoholPercent: input.alcoholPercent,
    pureAlcoholG:   input.pureAlcoholG,
    memo:           input.memo || null,
  })

  const records = await drinkRepo.listByDate(input.date)
  const total = calcDailyTotal(records)
  await summaryRepo.upsert(input.date, total)

  revalidatePath('/')
  revalidatePath('/calendar')
}

export async function updateDrinkRecord(
  id: string,
  patch: { volumeMl?: number; alcoholPercent?: number; memo?: string },
  date: string
) {
  const pureAlcoholG =
    patch.volumeMl !== undefined && patch.alcoholPercent !== undefined
      ? calcPureAlcohol(patch.volumeMl, patch.alcoholPercent)
      : undefined

  await drinkRepo.update(id, {
    ...patch,
    ...(pureAlcoholG !== undefined && { pureAlcoholG }),
  })

  const records = await drinkRepo.listByDate(date)
  const total = calcDailyTotal(records)
  await summaryRepo.upsert(date, total)

  revalidatePath('/')
  revalidatePath('/calendar')
}

export async function deleteDrinkRecord(id: string, date: string) {
  await drinkRepo.delete(id)

  const records = await drinkRepo.listByDate(date)
  const total = calcDailyTotal(records)
  await summaryRepo.upsert(date, total)

  revalidatePath('/')
  revalidatePath('/calendar')
}
