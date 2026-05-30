# alcohol-tracker コード解説書

C言語の組込み開発経験者向けに、今回のコードを解説します。

---

## 1. 全体像：C言語との対比

C言語の組込み開発と今回のWebアプリを対比すると以下のようになります。

| 組込み（C言語） | Webアプリ（今回） |
|---|---|
| マイコン上で動くファームウェア | ブラウザ・サーバーで動くアプリ |
| `main()` がエントリポイント | `app/page.tsx` がエントリポイント |
| ペリフェラル（GPIO、UART等）を操作 | DB（Supabase）を操作 |
| リアルタイムOS（TOPPERS等） | Next.js がリクエストを処理 |
| ヘッダファイルで型・インターフェース定義 | TypeScriptの型・interfaceで定義 |
| Makefileでビルド | `npm run build` でビルド |
| ユニットテスト（CUnit等） | Vitest でユニットテスト |

---

## 2. TypeScript：C言語との違い

### 基本的な型

C言語と対比すると分かりやすいです。

```c
// C言語
int volume = 500;
float percent = 5.0f;
char *memo = "飲み会";
int is_rest = 1;  // boolの代わり
```

```typescript
// TypeScript
const volume: number = 500;
const percent: number = 5.0;
const memo: string = '飲み会';
const isRest: boolean = true;
```

### null許容（ポインタのnullチェックに似ている）

```c
// C言語：ポインタがNULLかチェック
char *memo = get_memo();
if (memo != NULL) {
    printf("%s", memo);
}
```

```typescript
// TypeScript：null許容型
const memo: string | null = getMemo();
if (memo !== null) {
    console.log(memo);
}
```

`string | null` は「文字列またはnull」を意味します。C言語の `char *`（NULLになりうるポインタ）に相当します。

### 構造体に相当するもの（type / interface）

```c
// C言語：構造体
typedef struct {
    char id[64];
    char date[16];
    char category[32];
    float volume_ml;
    float alcohol_percent;
    float pure_alcohol_g;
} DrinkRecord;
```

```typescript
// TypeScript：type定義
type DrinkRecord = {
    id: string
    date: string
    category: string
    volumeMl: number
    alcoholPercent: number
    pureAlcoholG: number
    memo: string | null
}
```

C言語の `typedef struct` とほぼ同じ役割です。

### 関数ポインタに相当するもの

```c
// C言語：関数ポインタ
typedef void (*callback_t)(int value);
void register_callback(callback_t cb);
```

```typescript
// TypeScript：関数型
type OnSubmit = (values: SubmitValues) => void;

// Propsの中で使う
type Props = {
    onSubmit: OnSubmit
}
```

---

## 3. ディレクトリ構成の役割

```
src/
  domain/       ← ビジネスロジック（純粋関数）
  components/   ← UI部品
  actions/      ← DBへの書き込み処理
  repository/   ← DBアクセス層
  lib/          ← 共通の型・設定
  constants/    ← 定数
  app/          ← 画面（ページ）
```

### domain/：純粋関数の集まり

組込みでいう「計算ロジック」に相当します。副作用（DB操作・画面描画）を持たず、入力を受け取って出力を返すだけです。

```typescript
// src/domain/alcohol.ts

// 純アルコール計算：入力→出力のみ。副作用なし
export function calcPureAlcohol(volumeMl: number, alcoholPercent: number): number {
    if (volumeMl < 0 || alcoholPercent < 0) {
        throw new Error('負の値は不正です')
    }
    return volumeMl * (alcoholPercent / 100) * 0.8
}
```

C言語で書くと以下のイメージです。

```c
float calc_pure_alcohol(float volume_ml, float alcohol_percent) {
    if (volume_ml < 0 || alcohol_percent < 0) {
        return -1.0f;  // エラー
    }
    return volume_ml * (alcohol_percent / 100.0f) * 0.8f;
}
```

### repository/：DBアクセスの抽象化

組込みでいう「ドライバ層」に相当します。DBの操作を隠蔽し、上位層はDBの詳細を知らなくて済みます。

```typescript
// interface（ヘッダファイルのような役割）
export interface IDrinkRepository {
    add(record: NewDrinkInput): Promise<DrinkRecord>
    listByDate(date: string): Promise<DrinkRecord[]>
    update(id: string, patch: Partial<NewDrinkInput>): Promise<DrinkRecord>
    delete(id: string): Promise<void>
}
```

C言語のヘッダファイルで関数プロトタイプを宣言するのと同じ発想です。

```c
// drink_repository.h（ヘッダファイル）
DrinkRecord* drink_repo_add(NewDrinkInput *input);
DrinkRecord* drink_repo_list_by_date(const char *date);
int drink_repo_delete(const char *id);
```

実装は別ファイル（`supabaseDrinkRepository.ts`）に書き、テスト時はインメモリの偽実装（`InMemoryDrinkRepository`）に差し替えられます。これは組込みでのHAL（Hardware Abstraction Layer）と同じ考え方です。

---

## 4. async/await：非同期処理

C言語にはない概念ですが、Pythonで使い始めているなら馴染みがあるかもしれません。

DBへのアクセスは時間がかかります。その間CPUを止めないために非同期処理を使います。

```typescript
// 同期的に書くと（実際はこう書けない）
const records = drinkRepo.listByDate('2025-05-25');  // DBの応答を待つ間止まる
console.log(records);

// 非同期で書く（awaitで「待つ」を明示）
const records = await drinkRepo.listByDate('2025-05-25');  // 待つ間他の処理ができる
console.log(records);
```

`async` を関数につけると、その関数の中で `await` が使えます。

```typescript
async function fetchRecords(date: string) {
    const records = await drinkRepo.listByDate(date);  // ここで待つ
    return records;
}
```

Pythonの `async def` / `await` と全く同じです。

---

## 5. Reactコンポーネント：UI部品の単位

Reactは「UIをコンポーネント（部品）に分割する」考え方です。組込みでいうモジュール分割に似ています。

```typescript
// src/components/WarningBanner/WarningBanner.tsx

// Propsは「関数の引数」に相当
type Props = {
    dailyTotalG: number
    weeklyTotalG: number
    consecutiveDays: number
    hasRestDayThisWeek: boolean
}

// コンポーネントは「HTMLを返す関数」
export function WarningBanner({ dailyTotalG, weeklyTotalG, consecutiveDays, hasRestDayThisWeek }: Props) {
    const warnings: string[] = []

    if (dailyTotalG > 40) warnings.push('今日の飲酒量が推奨値を超えています')
    if (!hasRestDayThisWeek) warnings.push('今週まだ休肝日がありません')

    if (warnings.length === 0) return null  // 何も表示しない

    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <ul>
                {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                ))}
            </ul>
        </div>
    )
}
```

C言語で例えると以下のイメージです。

```c
// 警告メッセージを描画する関数
void render_warning_banner(float daily_total_g, int has_rest_day) {
    if (daily_total_g > 40.0f) {
        lcd_print("今日の飲酒量が推奨値を超えています");
    }
    if (!has_rest_day) {
        lcd_print("今週まだ休肝日がありません");
    }
}
```

### useState：状態を保持する変数

C言語のグローバル変数やstatic変数に近い概念です。

```c
// C言語：static変数で状態を保持
static int is_form_open = 0;

void toggle_form(void) {
    is_form_open = !is_form_open;
}
```

```typescript
// TypeScript（React）：useStateで状態を保持
const [isOpen, setIsOpen] = useState(false);

const toggleForm = () => {
    setIsOpen(!isOpen);  // setIsOpenで値を更新
};
```

`useState` の返り値は `[現在の値, 値を更新する関数]` のペアです。値を直接書き換えるのではなく、必ずセット関数を使います。

---

## 6. Next.js：サーバーとクライアントの分離

Next.jsは「サーバーで動くコード」と「ブラウザで動くコード」を同じプロジェクトに共存させます。

```
'use server'  ← サーバー側で実行（DBアクセス等）
'use client'  ← ブラウザ側で実行（ボタン操作等）
```

組込みで例えると、マイコン上で動くファームウェアとPCのデバッガが共存しているイメージです。

### Server Actions（`'use server'`）

DBへの書き込みはサーバー側で行います。

```typescript
// src/actions/drinkActions.ts
'use server'  // ← このファイルはサーバーで動く

export async function addDrinkRecord(input: {...}) {
    // ここはブラウザから見えない。DBのパスワード等も安全
    const drinkRepo = new SupabaseDrinkRepository()
    await drinkRepo.add({...})
    revalidatePath('/')  // 画面を再描画するよう指示
}
```

### Server Components（デフォルト）

`app/page.tsx` はデフォルトでサーバー側で動きます。DBからデータを取得してHTMLを返します。

```typescript
// src/app/page.tsx（Server Component）
export default async function HomePage() {
    // サーバー側でDBからデータ取得
    const records = await drinkRepo.listByDate(today)
    
    // データをコンポーネントに渡してHTMLを生成
    return (
        <main>
            <DailySummaryCard records={records} />
        </main>
    )
}
```

---

## 7. Supabase：DBの操作

SupabaseはPostgreSQLをベースにしたDBサービスです。SQLで操作しますが、TypeScriptからはクライアントライブラリ経由で操作します。

```typescript
// SQLで書くと
// SELECT * FROM drink_records WHERE date = '2025-05-25' ORDER BY created_at;

// TypeScriptで書くと
const { data, error } = await supabase
    .from('drink_records')
    .select('*')
    .eq('date', '2025-05-25')
    .order('created_at')
```

メソッドチェーンでSQLを組み立てます。Pythonのチェーンメソッドに似ています。

---

## 8. テスト：Vitestの使い方

今回はドメインロジックのテストをVitestで書いています。

```typescript
// src/domain/alcohol.test.ts

import { describe, it, expect } from 'vitest'
import { calcPureAlcohol } from './alcohol'

describe('calcPureAlcohol', () => {        // テストグループ
    it('ビール500ml 5%で約20gになる', () => { // 個別テスト
        expect(calcPureAlcohol(500, 5)).toBeCloseTo(20, 1)
        //     ↑実際の値          ↑期待値
    })

    it('負の値は例外を投げる', () => {
        expect(() => calcPureAlcohol(-1, 5)).toThrow()
    })
})
```

C言語のユニットテスト（CUnitやUnityフレームワーク）と同じ考え方です。

```c
// CUnity風のテスト（参考）
void test_calc_pure_alcohol(void) {
    TEST_ASSERT_FLOAT_WITHIN(0.1f, 20.0f, calc_pure_alcohol(500, 5));
}

void test_calc_pure_alcohol_negative(void) {
    TEST_ASSERT_EQUAL(-1.0f, calc_pure_alcohol(-1, 5));
}
```

---

## 9. アーキテクチャの全体像

```
ブラウザ
  ↓ タップ
'use client' コンポーネント（QuickAddButton等）
  ↓ 関数呼び出し
'use server' Server Actions（drinkActions.ts）
  ↓ メソッド呼び出し
Repository層（supabaseDrinkRepository.ts）
  ↓ HTTP通信
Supabase（PostgreSQL）
```

組込みのレイヤードアーキテクチャと同じ発想です。

```
アプリ層（main.c）
  ↓
ビジネスロジック層（alcohol_calc.c）
  ↓
ドライバ層（db_driver.c）
  ↓
ハードウェア（EEPROM等）
```

---

## 10. 用語対応表

| TypeScript/React用語 | C言語相当 | 説明 |
|---|---|---|
| `type` / `interface` | `typedef struct` | データ構造の定義 |
| `const` | `const` | 定数・再代入不可変数 |
| `async/await` | なし（割り込みに近い） | 非同期処理 |
| `useState` | `static` 変数 | コンポーネント内の状態 |
| `props` | 関数引数 | コンポーネントへの入力 |
| `export` | 関数プロトタイプ公開 | 他ファイルから使えるようにする |
| `import` | `#include` | 他ファイルの機能を使う |
| `null` | `NULL` | 値がない状態 |
| `throw new Error()` | `return -1` / assert | エラー通知 |
| `Promise<T>` | なし | 非同期処理の返り値 |
| `Array<T>` | `T[]` 配列 | 同じ型の集まり |
| `npm run build` | `make` | ビルドコマンド |
| `npm test` | `make test` | テスト実行 |
