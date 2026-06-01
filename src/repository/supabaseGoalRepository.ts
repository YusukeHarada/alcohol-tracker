import { createServerClient } from '@/lib/supabase/server'
import type { IGoalRepository } from './goalRepository'
import type { UserGoal } from '@/lib/types'

export class SupabaseGoalRepository implements IGoalRepository {
  async get(): Promise<UserGoal | null> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('user_goals')
      .select('*')
      .single()
    if (error) return null
    return toGoal(data)
  }

  async upsert(goal: Omit<UserGoal, 'id' | 'userId'>): Promise<UserGoal> {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('user_goals')
      .upsert(
        {
          user_id:          user?.id,
          daily_limit_g:    goal.dailyLimitG,
          weekly_rest_days: goal.weeklyRestDays,
          weekly_limit_g:   goal.weeklyLimitG,
          updated_at:       new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()
    if (error) throw error
    return toGoal(data)
  }
}

function toGoal(d: any): UserGoal {
  return {
    id:             d.id,
    userId:         d.user_id,
    dailyLimitG:    d.daily_limit_g,
    weeklyRestDays: d.weekly_rest_days,
    weeklyLimitG:   d.weekly_limit_g,
  }
}
