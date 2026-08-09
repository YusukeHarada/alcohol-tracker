# alcohol-tracker

飲みすぎ防止・休肝日管理アプリ

## 機能

- **飲酒記録** — 飲み物の種類・量・度数を記録し、純アルコール量を自動計算
- **ワンタップ記録** — 直近60日の履歴から「よく飲む組み合わせ」を自動抽出し、ホーム上部に1タップで記録できるチップを表示
- **カレンダー** — 月ごとの飲酒状況を一覧表示。休肝日は色分けで視認
- **統計** — 週次・月次の飲酒量グラフと休肝日数の集計
- **テンプレート** — よく飲む組み合わせをテンプレート登録してワンタップで追加
- **目標設定** — 1日の上限g・週の休肝日数・週の上限gを設定
- **リマインド** — 未記録の日の夜に Discord へ通知（Vercel Cron）

## 技術スタック

| 層 | 技術 |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend/DB | Supabase |
| Hosting | Vercel |
| Unit Test | Vitest + React Testing Library |

## セットアップ

### 1. 依存インストール

```bash
npm install
```

### 2. Supabase プロジェクトの準備

[Supabase](https://supabase.com) でプロジェクトを作成し、**Project URL** と **anon key** を取得する。

```bash
# Supabase CLI のインストール（未インストールの場合）
npm install -g supabase

# DB マイグレーションを適用
npx supabase db push
```

### 3. 環境変数の設定

プロジェクトルートに `.env.local` を作成して以下を記入する。

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

| 変数 | 用途 | 公開範囲 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトの URL | クライアント |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の anon key | クライアント |

Discord リマインドを使う場合は以下も設定する（アプリ本体の動作には不要）。

```env
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
CRON_SECRET=<任意のランダム文字列>
REMINDER_USER_ID=<auth.users.id の UUID>
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
APP_URL=https://<your-app>.vercel.app/
```

| 変数 | 用途 | 公開範囲 |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | cron から DB を読む（RLS をバイパスする） | **サーバー専用。絶対に `NEXT_PUBLIC_` を付けない** |
| `CRON_SECRET` | cron エンドポイントの Bearer 認証。Vercel が自動で付与する | サーバー専用 |
| `REMINDER_USER_ID` | リマインド対象の `auth.users.id` | サーバー専用 |
| `DISCORD_WEBHOOK_URL` | Discord の Incoming Webhook URL | サーバー専用（漏れると誰でもチャンネルに投稿できる） |
| `APP_URL` | 通知に載せるアプリの URL | サーバー専用 |

本番では Vercel の Settings → Environment Variables に **Production** スコープで登録する。
ローカル検証は `.env.local`（gitignore 済み）に置く。

### 4. 開発サーバー起動

```bash
npm run dev
```

## テスト

```bash
npm test               # ウォッチモードで実行
npm run test:run       # 1回だけ実行
npm run test:coverage  # カバレッジレポート付きで実行
npm run test:ui        # ブラウザ UI で確認
```

## ディレクトリ構成

```
src/
  app/          # Next.js App Router ページ（calendar / stats / templates / settings / login）
    api/cron/   # Vercel Cron から叩かれる Route Handler
  domain/       # ビジネスロジック（純粋関数）
  components/   # UI コンポーネント
  actions/      # Server Actions（drink / goal / restDay / template）
  repository/   # Supabase アクセス層
  lib/          # 型定義・Supabase クライアント
  constants/    # 定数（飲み物カテゴリ等）
supabase/
  migrations/   # DB マイグレーション
docs/           # アーキテクチャ・設計ドキュメント
```

## デプロイ

```bash
npx vercel --prod
```

## Discord リマインド

未記録の日の夜21時（JST）に Discord へ通知する。`vercel.json` の `crons` で
`/api/cron/reminder` を叩き、その日に飲酒記録も休肝日登録も無ければ Webhook に POST する。
**記録済みの日は送らない**（毎晩届く通知は読み飛ばされるようになるため）。

手元での確認:

```bash
# 認証なし → 401（302 で /login に飛ぶ場合は middleware の除外が効いていない）
curl -i http://localhost:3000/api/cron/reminder

# 認証あり → 未記録なら Discord に着弾、記録済みなら {"ok":true,"skipped":true}
curl -i -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminder

# Webhook 単体の疎通確認
curl -X POST -H 'Content-Type: application/json' \
  -d '{"content":"テスト"}' "$DISCORD_WEBHOOK_URL"
```

注意点:

- cron 式は **UTC**。`0 12 * * *` = 21:00 JST
- Vercel Hobby プランでは cron は最大2本・1日1回まで。発火は指定した「時」の中でずれる（実際には 21:00〜21:59 JST のどこか）
- cron は**本番デプロイにのみ登録される**。プレビューデプロイでは動かない
- `CRON_SECRET` が未設定だと毎晩 401 になり、通知が来ないまま静かに失敗する。デプロイ後に一度手動で叩いて確認する
- Webhook URL を再生成した場合は環境変数の更新が必要。失敗は Vercel のログにしか出ない

## アルコール計算式

```
純アルコール量(g) = 容量(mL) × (度数 / 100) × 0.8
```

例：ビール 500mL 5% → 500 × 0.05 × 0.8 = **20g**
