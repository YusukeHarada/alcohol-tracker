# alcohol-tracker

飲みすぎ防止・休肝日管理アプリ

## 機能

- **飲酒記録** — 飲み物の種類・量・度数を記録し、純アルコール量を自動計算
- **カレンダー** — 月ごとの飲酒状況を一覧表示。休肝日は色分けで視認
- **統計** — 週次・月次の飲酒量グラフと休肝日数の集計
- **テンプレート** — よく飲む組み合わせをテンプレート登録してワンタップで追加
- **目標設定** — 1日の上限g・週の休肝日数・週の上限gを設定

## 技術スタック

| 層 | 技術 |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend/DB | Supabase |
| Hosting | Vercel |
| Unit Test | Vitest + React Testing Library |

## 前提条件

- Node.js 18 以上
- [Supabase](https://supabase.com) アカウント

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

## アーキテクチャ

### データフロー

```
ユーザー操作 → Server Action → Repository → Supabase
                    ↓
             revalidatePath → Server Component 再描画
```

### 各層の責務

| 層 | 責務 |
|---|---|
| `domain/` | 副作用を持たない純粋関数。アルコール計算・集計・目標評価 |
| `components/` | `'use client'` の UI パーツ。データ取得ロジックを持たない |
| `actions/` | `'use server'` の Server Actions。Repository を呼び出し DB と通信 |
| `repository/` | Supabase クエリの実装。Interface で抽象化しテスト時は InMemory 実装に差し替え可能 |

### テスト方針

| 対象 | 方針 |
|---|---|
| `domain/` | 純粋関数なのでそのままテスト |
| `components/` | React Testing Library で UI の振る舞いをテスト |
| `repository/` | InMemory 実装でインターフェースを検証 |
| `actions/` | Repository をモックしてロジックをテスト |

## DB 設計

| テーブル | 役割 |
|---|---|
| `drink_records` | 1回の飲酒単位で記録。`pure_alcohol_g` は保存時に計算済みの値を格納 |
| `daily_summaries` | `drink_records` の集計キャッシュ。カレンダー描画時に1ヶ月分を一括取得するために使用。`is_rest_day` は `total_alcohol_g = 0` の generated column |
| `drink_templates` | JSONB 型の `items` カラムに飲み物リストを格納 |
| `user_goals` | `user_id` に UNIQUE 制約で1ユーザー1レコード。upsert で更新 |

全テーブルに RLS を設定し、ユーザーは自分のレコードのみアクセス可能。

## ディレクトリ構成

```
src/
  app/          # Next.js App Router ページ（calendar / stats / templates / settings / login）
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

## アルコール計算式

```
純アルコール量(g) = 容量(mL) × (度数 / 100) × 0.8
```

例：ビール 500mL 5% → 500 × 0.05 × 0.8 = **20g**
