import type { UserGoal } from '@/lib/types'

export interface IGoalRepository {
  get(): Promise<UserGoal | null>
  upsert(goal: Omit<UserGoal, 'id' | 'userId'>): Promise<UserGoal>
}
