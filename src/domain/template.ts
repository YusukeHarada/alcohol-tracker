import { calcPureAlcohol } from './alcohol'
import type { DrinkTemplate, DrinkTemplateItem } from '@/lib/types'

type AppliedItem = DrinkTemplateItem & { pureAlcoholG: number }

export function applyTemplate(template: DrinkTemplate): AppliedItem[] {
  return template.items.map(item => ({
    ...item,
    pureAlcoholG: calcPureAlcohol(item.volumeMl, item.alcoholPercent),
  }))
}

type ValidateInput = {
  name: string
  items: DrinkTemplateItem[]
}

type ValidateResult =
  | { ok: true }
  | { ok: false; error: string }

export function validateTemplate(input: ValidateInput): ValidateResult {
  if (!input.name.trim()) {
    return { ok: false, error: '名前を入力してください' }
  }
  if (input.items.length === 0) {
    return { ok: false, error: 'アイテムを1件以上追加してください' }
  }
  return { ok: true }
}
