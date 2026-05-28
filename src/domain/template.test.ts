import { describe, it, expect } from 'vitest'
import { applyTemplate, validateTemplate } from './template'
import type { DrinkTemplate } from '@/lib/types'

const mockTemplate: DrinkTemplate = {
  id: 't1',
  userId: 'u1',
  name: 'いつもの晩酌',
  items: [
    { category: 'beer',    volumeMl: 500, alcoholPercent: 5  },
    { category: 'whiskey', volumeMl: 60,  alcoholPercent: 40 },
  ],
}

describe('applyTemplate', () => {
  it('テンプレートのアイテムに純アルコール量を付与して返す', () => {
    const result = applyTemplate(mockTemplate)
    expect(result[0].pureAlcoholG).toBeCloseTo(20, 1)
    expect(result[1].pureAlcoholG).toBeCloseTo(19.2, 1)
  })

  it('アイテム数が保持される', () => {
    expect(applyTemplate(mockTemplate)).toHaveLength(2)
  })
})

describe('validateTemplate', () => {
  it('名前が空だとエラーを返す', () => {
    const result = validateTemplate({ name: '', items: mockTemplate.items })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/名前/)
  })

  it('アイテムが0件だとエラーを返す', () => {
    const result = validateTemplate({ name: 'test', items: [] })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/1件/)
  })

  it('有効な入力はokを返す', () => {
    const result = validateTemplate({ name: 'test', items: mockTemplate.items })
    expect(result.ok).toBe(true)
  })
})
