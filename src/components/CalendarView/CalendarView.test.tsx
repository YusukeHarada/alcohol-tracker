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

    await user.click(screen.getByRole('button', { name: '記録する' }))

    await waitFor(() => expect(bulkAddMock).toHaveBeenCalledTimes(1))
    const [dates, entries] = bulkAddMock.mock.calls[0]
    expect(dates).toEqual(['2026-10-03', '2026-10-05'])
    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({ count: 1 })

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
