import { SupabaseGoalRepository } from '@/repository/supabaseGoalRepository'
import { GoalSettingsView } from '@/components/GoalSettingsView/GoalSettingsView'
import { LogoutButton } from '@/components/LogoutButton/LogoutButton'

export default async function SettingsPage() {
  const repo = new SupabaseGoalRepository()
  const goal = await repo.get()

  return (
    <main className="max-w-md mx-auto px-4 py-6 space-y-6">
      <h1 className="text-lg font-semibold text-slate-800">目標設定</h1>
      <GoalSettingsView goal={goal} />
      <LogoutButton />
    </main>
  )
}
