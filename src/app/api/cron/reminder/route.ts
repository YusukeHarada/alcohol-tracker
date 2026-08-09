import { NextResponse, type NextRequest } from 'next/server'
import { toJstDateString, shiftDateString } from '@/domain/jstDate'
import { buildReminderMessage } from '@/domain/reminder'
import { fetchReminderState } from '@/repository/supabaseReminderRepository'

export const dynamic = 'force-dynamic'

/**
 * 未記録の日の夜にDiscordへリマインドを送る。Vercel Cronから1日1回叩かれる。
 *
 * middleware は /api/cron 配下を認証対象から外しているため、
 * このプレフィックス下に置くルートは必ず自前でシークレットを検証すること。
 */
export async function GET(request: NextRequest) {
  // Vercel Cron は CRON_SECRET が設定されていれば Authorization: Bearer <secret> を送る。
  // 未設定のときは通す（fail open）のではなく落とす。公開URLなので誰でも叩ける。
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const userId     = process.env.REMINDER_USER_ID
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  const appUrl     = process.env.APP_URL
  if (!userId || !webhookUrl || !appUrl) {
    console.error('reminder cron: 環境変数が未設定です')
    return NextResponse.json({ ok: false, error: 'env not configured' }, { status: 500 })
  }

  const date      = toJstDateString(new Date())
  const weekStart = shiftDateString(date, -6)

  try {
    const state   = await fetchReminderState(userId, date, weekStart)
    const message = buildReminderMessage(state, appUrl)

    // 送信不要の日も200を返す。Cronログを「失敗が出たら本当に異常」な状態に保つため
    if (!message) return NextResponse.json({ ok: true, skipped: true })

    const res = await fetch(webhookUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ content: message }),
    })

    if (!res.ok) {
      console.error('Discord webhook failed', res.status, await res.text())
      return NextResponse.json({ ok: false, status: res.status }, { status: 502 })
    }

    return NextResponse.json({ ok: true, sent: true })
  } catch (e) {
    // Vercelのcronログにスタックトレースではなく読める1行を残す
    console.error('reminder cron failed', e)
    return NextResponse.json({ ok: false, error: 'reminder failed' }, { status: 500 })
  }
}
