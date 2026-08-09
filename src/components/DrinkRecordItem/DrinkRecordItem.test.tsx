import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DrinkRecordItem } from './DrinkRecordItem'
import type { DrinkRecord } from '@/lib/types'

const record: DrinkRecord = {
  id: 'r1',
  userId: 'u1',
  date: '2026-08-09',
  category: 'beer',
  volumeMl: 500,
  alcoholPercent: 5,
  pureAlcoholG: 20,
  memo: null,
  createdAt: '2026-08-09T12:00:00Z',
  updatedAt: '2026-08-09T12:00:00Z',
}

const onUpdate = vi.fn()
const onDelete = vi.fn()

beforeEach(() => {
  onUpdate.mockReset()
  onDelete.mockReset()
})

const setup = () =>
  render(<DrinkRecordItem record={record} onUpdate={onUpdate} onDelete={onDelete} />)

describe('削除の確認', () => {
  it('「削除」を押しただけでは削除しない', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: '削除' }))

    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.getByText('この記録を削除しますか？')).toBeInTheDocument()
  })

  it('確認してはじめて削除される', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: '削除' }))
    await user.click(screen.getByRole('button', { name: '削除する' }))

    expect(onDelete).toHaveBeenCalledWith('r1')
  })

  it('「やめる」で元に戻り削除されない', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: '削除' }))
    await user.click(screen.getByRole('button', { name: 'やめる' }))

    expect(onDelete).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument()
  })
})

describe('編集', () => {
  it('種類・容量・度数・メモをまとめて更新できる', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: '編集' }))

    // 押し間違いの修正: ビール → 日本酒。容量と度数は既定値に追従する
    await user.selectOptions(screen.getByLabelText('種類'), 'sake')
    await user.type(screen.getByLabelText('メモ'), '飲み会')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(onUpdate).toHaveBeenCalledWith('r1', {
      category:       'sake',
      volumeMl:       180,
      alcoholPercent: 15,
      memo:           '飲み会',
    })
  })

  it('容量を直すと純アルコール量のプレビューが追従する', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: '編集' }))

    const volume = screen.getByLabelText('容量 (ml)')
    await user.clear(volume)
    await user.type(volume, '350')

    expect(screen.getByText('純アルコール量 14.0g')).toBeInTheDocument()
  })

  it('容量が空なら保存できない', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: '編集' }))
    await user.clear(screen.getByLabelText('容量 (ml)'))

    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled()
  })

  it('キャンセルすると編集内容を持ち越さない', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: '編集' }))
    await user.selectOptions(screen.getByLabelText('種類'), 'sake')
    await user.click(screen.getByRole('button', { name: 'キャンセル' }))

    await user.click(screen.getByRole('button', { name: '編集' }))

    expect(screen.getByLabelText('種類')).toHaveValue('beer')
    expect(onUpdate).not.toHaveBeenCalled()
  })
})
