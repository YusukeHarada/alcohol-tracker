import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CalendarView } from './CalendarView'
import { addDrinkRecordsToDates } from '@/actions/drinkActions'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClientSideClient: vi.fn(),
}))

vi.mock('@/actions/drinkActions', () => ({
  addDrinkRecord:         vi.fn(),
  addDrinkRecordsToDates: vi.fn(),
  updateDrinkRecord:      vi.fn(),
  deleteDrinkRecord:      vi.fn(),
}))

const bulkAddMock = vi.mocked(addDrinkRecordsToDates)

beforeEach(() => {
  bulkAddMock.mockReset()
  bulkAddMock.mockResolvedValue(undefined)
})

describe('CalendarView 複数日選択', () => {
  it('選んだ日すべてに同じ内容をまとめて記録する', async () => {
    const user = userEvent.setup()
    render(<CalendarView year={2026} month={10} summaries={[]} />)

    await user.click(screen.getByRole('button', { name: '複数日を選択してまとめて追加' }))
    await user.click(screen.getByTestId('day-2026-10-05'))
    await user.click(screen.getByTestId('day-2026-10-03'))

    expect(screen.getByTestId('day-2026-10-05')).toHaveAttribute('data-selected', 'true')
    expect(screen.getByText(/2日選択中/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '2日にまとめて追加' }))
    expect(screen.getByText('10/3')).toBeInTheDocument()
    expect(screen.getByText('10/5')).toBeInTheDocument()

    // 飲み物を積むまでは保存できない
    expect(screen.getByRole('button', { name: '飲み物を追加してください' })).toBeDisabled()

    // 1杯目：初期値（宝ハイボール 500ml 7%）を1本
    await user.click(screen.getByRole('button', { name: '追加する' }))
    // 2杯目：ビールを2本
    await user.selectOptions(screen.getByLabelText('種類'), 'beer')
    await user.clear(screen.getByLabelText('本数'))
    await user.type(screen.getByLabelText('本数'), '2')
    await user.click(screen.getByRole('button', { name: '2本を追加する' }))
    // 3杯目：日本酒を追加してから削除
    await user.selectOptions(screen.getByLabelText('種類'), 'sake')
    await user.click(screen.getByRole('button', { name: '追加する' }))
    await user.click(screen.getByRole('button', { name: '日本酒を削除' }))

    expect(screen.getAllByTestId('bulk-entry')).toHaveLength(2)
    // 追加後はフォームが初期値に戻る
    expect(screen.getByLabelText('種類')).toHaveValue('t-hi')

    await user.click(screen.getByRole('button', { name: /2日に2件を記録する（1日あたり68\.0g）/ }))

    await waitFor(() => expect(bulkAddMock).toHaveBeenCalledTimes(1))
    const [dates, entries] = bulkAddMock.mock.calls[0]
    expect(dates).toEqual(['2026-10-03', '2026-10-05'])
    expect(entries).toHaveLength(2)
    expect(entries[0]).toMatchObject({ category: 't-hi', count: 1 })
    expect(entries[1]).toMatchObject({ category: 'beer', count: 2 })

    // 記録後は選択モードを抜ける
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '複数日を選択してまとめて追加' })).toBeInTheDocument()
    )
  })

  it('同じ日をもう一度タップすると選択が外れる', async () => {
    const user = userEvent.setup()
    render(<CalendarView year={2026} month={10} summaries={[]} />)

    await user.click(screen.getByRole('button', { name: '複数日を選択してまとめて追加' }))
    await user.click(screen.getByTestId('day-2026-10-05'))
    await user.click(screen.getByTestId('day-2026-10-05'))

    expect(screen.getByTestId('day-2026-10-05')).not.toHaveAttribute('data-selected')
    expect(screen.getByRole('button', { name: '0日にまとめて追加' })).toBeDisabled()
  })
})
