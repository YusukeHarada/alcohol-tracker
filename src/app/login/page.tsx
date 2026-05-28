'use client'

import { useState } from 'react'
import { createClientSideClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClientSideClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('メールアドレスまたはパスワードが間違っています')
      setLoading(false)
      return
    }
    router.push('/')
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClientSideClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError('登録に失敗しました')
      setLoading(false)
      return
    }
    setError('確認メールを送信しました')
    setLoading(false)
  }

  return (
    <main className="max-w-sm mx-auto px-4 py-16 space-y-6">
      <h1 className="text-xl font-semibold text-center">飲酒記録</h1>

      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm text-gray-600">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border rounded p-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm text-gray-600">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border rounded p-2"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          ログイン
        </button>

        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full py-3 border border-gray-300 text-gray-600 rounded-lg disabled:opacity-50"
        >
          新規登録
        </button>
      </div>
    </main>
  )
}
