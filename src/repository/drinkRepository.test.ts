import { describe, it, expect } from 'vitest'
import type { IDrinkRepository, NewDrinkInput } from './drinkRepository'
import type { DrinkRecord } from '@/lib/types'

class InMemoryDrinkRepository implements IDrinkRepository {
  private records: DrinkRecord[] = []

  async add(input: NewDrinkInput): Promise<DrinkRecord> {
    const record: DrinkRecord = {
      ...input,
      id: crypto.randomUUID(),
      userId: 'test-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.records.push(record)
    return record
  }

  async addMany(inputs: NewDrinkInput[]): Promise<DrinkRecord[]> {
    return Promise.all(inputs.map(input => this.add(input)))
  }

  async listByDate(date: string): Promise<DrinkRecord[]> {
    return this.records.filter(r => r.date === date)
  }

  async listByRange(from: string, to: string): Promise<DrinkRecord[]> {
    // yyyy-MM-dd は辞書順比較で日付順比較と一致する
    return this.records.filter(r => r.date >= from && r.date <= to)
  }

  async update(id: string, patch: Partial<NewDrinkInput>): Promise<DrinkRecord> {
    const i = this.records.findIndex(r => r.id === id)
    if (i === -1) throw new Error('not found')
    this.records[i] = { ...this.records[i], ...patch, updatedAt: new Date().toISOString() }
    return this.records[i]
  }

  async delete(id: string): Promise<void> {
    this.records = this.records.filter(r => r.id !== id)
  }
}

const base: NewDrinkInput = {
  userId: 'test-user',
  date: '2025-05-25',
  category: 'beer',
  volumeMl: 500,
  alcoholPercent: 5,
  pureAlcoholG: 20,
  memo: null,
}

describe('InMemoryDrinkRepository', () => {
  it('追加したレコードを日付で取得できる', async () => {
    const repo = new InMemoryDrinkRepository()
    await repo.add(base)
    const records = await repo.listByDate('2025-05-25')
    expect(records).toHaveLength(1)
    expect(records[0].pureAlcoholG).toBe(20)
  })

  it('メモを更新できる', async () => {
    const repo = new InMemoryDrinkRepository()
    const added = await repo.add(base)
    const updated = await repo.update(added.id, { memo: '飲み会' })
    expect(updated.memo).toBe('飲み会')
  })

  it('削除後はリストから消える', async () => {
    const repo = new InMemoryDrinkRepository()
    const added = await repo.add(base)
    await repo.delete(added.id)
    const records = await repo.listByDate('2025-05-25')
    expect(records).toHaveLength(0)
  })

  it('期間内のレコードだけを取得できる', async () => {
    const repo = new InMemoryDrinkRepository()
    await repo.add({ ...base, date: '2025-05-20' })
    await repo.add({ ...base, date: '2025-05-25' })
    await repo.add({ ...base, date: '2025-06-01' })

    const records = await repo.listByRange('2025-05-24', '2025-05-31')
    expect(records).toHaveLength(1)
    expect(records[0].date).toBe('2025-05-25')
  })

  it('期間の境界日を含む', async () => {
    const repo = new InMemoryDrinkRepository()
    await repo.add({ ...base, date: '2025-05-20' })
    await repo.add({ ...base, date: '2025-05-25' })

    const records = await repo.listByRange('2025-05-20', '2025-05-25')
    expect(records).toHaveLength(2)
  })

  it('存在しないidの更新は例外を投げる', async () => {
    const repo = new InMemoryDrinkRepository()
    await expect(repo.update('no-such-id', { memo: 'x' })).rejects.toThrow()
  })
})