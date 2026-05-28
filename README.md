# alcohol-tracker

飲みすぎ防止・休肝日管理アプリ

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

```bash
# 依存インストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.local にSupabaseのURLとAnon Keyを記入

# 開発サーバー起動
npm run dev

# テスト実行
npm test
```

## ディレクトリ構成

```
src/
  app/          # Next.js App Router ページ
  domain/       # ビジネスロジック（純粋関数）
  components/   # UIコンポーネント
  actions/      # Server Actions
  repository/   # Supabaseアクセス層
  lib/          # 型定義・クライアント
  constants/    # 定数
supabase/
  migrations/   # DBマイグレーション
```

## DB マイグレーション

```bash
npx supabase db push
```

## デプロイ

```bash
npx vercel --prod
```

## アルコール計算式

```
純アルコール量(g) = 容量(mL) × (度数 / 100) × 0.8
```

例：ビール500ml 5% → 500 × 0.05 × 0.8 = 20g
