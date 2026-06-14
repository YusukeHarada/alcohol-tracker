'use server'

import { revalidatePath } from 'next/cache'
import { SupabaseDailySummaryRepository } from '@/repository/supabaseDrinkRepository'

const summaryRepo = new SupabaseDailySummaryRepository()

export async function registerRestDay(date: string) {
  await summaryRepo.upsert(date, 0)
  revalidatePath('/')
  revalidatePath('/calendar')
}

export async function cancelRestDay(date: string) {
  await summaryRepo.deleteByDate(date)
  revalidatePath('/')
  revalidatePath('/calendar')
}
