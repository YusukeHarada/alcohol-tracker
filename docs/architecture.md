# アーキテクチャ概要

## 技術スタック

| 層 | 技術 |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend/DB | Supabase |
| Hosting | Vercel |
| Unit Test | Vitest + React Testing Library |

## ディレクトリ構成と責務

### domain/
副作用を持たない純粋関数のみ。テストが最も書きやすい層。
ビジネスルール（アルコール計算、集計、目標評価）はすべてここに置く。

### components/
`'use client'` のUIパーツ。データ取得ロジックを持たない。
Server Actionsをpropsで受け取る形にすることで、テスト時のモックが容易になる。

### actions/
`'use server'` のServer Actions。repositoryを呼び出してDBと通信する。
記録追加後にdaily_summariesを再集計する責務も持つ。

### repository/
Supabaseクエリの実装。interfaceで抽象化することで、テスト時は
InMemory実装に差し替えられる。

## テスト方針

| 対象 | 方針 |
|---|---|
| domain/ | 純粋関数なのでそのままテスト |
| components/ | React Testing LibraryでUIの振る舞いをテスト |
| repository/ | InMemory実装でインターフェースを検証 |
| actions/ | repositoryをモックしてロジックをテスト |
| Server Components | ロジックをdomain/に切り出してそちらをテスト |

## データフロー

```
ユーザー操作 → Server Action → Repository → Supabase
                    ↓
             revalidatePath → Server Component再描画
```

## アルコール計算式

```
純アルコール量(g) = 容量(mL) × (度数 / 100) × 0.8
```

## DB設計

### drink_records
1回の飲酒単位で記録する。pure_alcohol_gは保存時に計算済みの値を格納する。

### daily_summaries
drink_recordsの集計キャッシュ。カレンダー描画時に1ヶ月分を一括取得するために使う。
is_rest_dayはtotal_alcohol_g = 0のgenerated columnとして定義する。

### drink_templates
jsonb型のitemsカラムにDrinkTemplateItem[]を格納する。

### user_goals
user_idにuniqueを付けて1ユーザー1レコードとし、upsertで更新する。
