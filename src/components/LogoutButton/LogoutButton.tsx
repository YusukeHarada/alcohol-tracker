'use client'

import { createClientSideClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClientSideClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full py-3.5 rounded-2xl border border-slate-200 text-slate-500 text-sm font-medium hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors"
    >
      ログアウト
    </button>
  )
}
