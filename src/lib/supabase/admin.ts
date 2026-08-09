import { createClient } from '@supabase/supabase-js'

/**
 * service_roleキーを使うSupabaseクライアント。
 *
 * 注意：このクライアントはRLSを完全にバイパスする。
 * - サーバー専用。'use client' のファイルから絶対にimportしない
 * - SUPABASE_SERVICE_ROLE_KEY に NEXT_PUBLIC_ を付けてはいけない
 * - RLSが守ってくれないので、全クエリで user_id を明示フィルタすること
 *
 * モジュールのトップレベルではなく関数内でクライアントを生成する。
 * トップレベルだと next build のモジュール評価時にthrowしてビルドが落ちる。
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase admin の環境変数が未設定です')
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
