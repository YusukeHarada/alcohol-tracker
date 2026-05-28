'use server'

import { revalidatePath } from 'next/cache'
import { SupabaseGoalRepository } from '@/repository/supabaseGoalRepository'

const repo = new SupabaseGoalRepository()

export async function upsertGoal(goal: {
  dailyLimitG: number
  weeklyRestDays: number
  weeklyLimitG: number
}) {
  await repo.upsert(goal)
  revalidatePath('/settings')
  revalidatePath('/')
}
