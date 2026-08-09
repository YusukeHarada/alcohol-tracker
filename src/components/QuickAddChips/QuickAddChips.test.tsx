import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuickAddChips } from './QuickAddChips'
import { addDrinkRecord } from '@/actions/drinkActions'
import { QUICK_ADD_MAX_TAP_COUNT } from '@/constants/alcohol'
import type { QuickAddCandidate } from '@/domain/quickAdd'

vi.mock('@/actions/drinkActions', () => ({
  addDrinkRecord: vi.fn(),
}))

const addMock = vi.mocked(addDrinkRecord)

const candidates: QuickAddCandidate[] = [
  {
    key: 't-hi|500|7', category: 't-hi', label: '宝ハイボール',
    volumeMl: 500, alcoholPercent: 7, pureAlcoholG: 28, source: 'history',
  },
  {
    key: 'beer|500|5', category: 'beer', label: 'ビール',
    volumeMl: 500, alcoholPercent: 5, pureAlcoholG: 20, source: 'default',
  },
]

beforeEach(() => {
  addMock.mockReset()
  addMock.mockResolvedValue(undefined)
})

describe('QuickAddChips', () => {
  it('候補がチップとして描画される', () => {
    render(<QuickAddChips date="2026-08-09" candidates={candidates} />)

    expect(screen.getByRole('button', { name: /宝ハイボール 500ml/ })).toBeInTheDocument()
    expect(screen.getByText('28.0g')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ビール 500ml/ })).toBeInTheDocument()
    expect(screen.getByText('20.0g')).toBeInTheDocument()
  })

  it('候補が空なら何も描画しない', () => {
    const { container } = render(<QuickAddChips date="2026-08-09" candidates={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('タップすると addDrinkRecord が正しい引数で1回呼ばれる', async () => {
    const user = userEvent.setup()
    render(<QuickAddChips date="2026-08-09" candidates={candidates} />)

    await user.click(screen.getByRole('button', { name: /宝ハイボール 500ml/ }))

    await waitFor(() => expect(addMock).toHaveBeenCalledTimes(1))
    expect(addMock).toHaveBeenCalledWith({
      date:           '2026-08-09',
      category:       't-hi',
      volumeMl:       500,
      alcoholPercent: 7,
      pureAlcoholG:   28,
      memo:           '',
      count:          1,
    })
  })

  it('「+」で本数を増やすと1回の呼び出しにまとまる', async () => {
    const user = userEvent.setup()
    render(<QuickAddChips date="2026-08-09" candidates={candidates} />)

    const plus = screen.getByRole('button', { name: '宝ハイボールの本数を増やす' })
    await user.click(plus)
    await user.click(plus)

    // 増やしただけでは保存されない
    expect(addMock).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /宝ハイボール 500ml/ }))

    await waitFor(() => expect(addMock).toHaveBeenCalledTimes(1))
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ count: 3 }))
  })

  it('本数を増やすと合計の純アルコール量が表示に反映される', async () => {
    const user = userEvent.setup()
    render(<QuickAddChips date="2026-08-09" candidates={candidates} />)

    expect(screen.getByText('28.0g')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '宝ハイボールの本数を増やす' }))

    expect(screen.getByText('2本 · 56.0g')).toBeInTheDocument()
  })

  it('上限を超えると1本に戻る（減らす操作を兼ねる）', async () => {
    const user = userEvent.setup()
    render(<QuickAddChips date="2026-08-09" candidates={candidates} />)

    const plus = screen.getByRole('button', { name: 'ビールの本数を増やす' })
    for (let i = 0; i < QUICK_ADD_MAX_TAP_COUNT - 1; i++) {
      await user.click(plus)
    }
    expect(plus).toHaveTextContent(`×${QUICK_ADD_MAX_TAP_COUNT}`)

    await user.click(plus) // 上限の次で1本に戻る
    expect(plus).toHaveTextContent('+')

    await user.click(screen.getByRole('button', { name: /ビール 500ml/ }))

    await waitFor(() => expect(addMock).toHaveBeenCalledTimes(1))
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ count: 1 }))
  })

  it('保存に成功すると本数が1本に戻る', async () => {
    const user = userEvent.setup()
    render(<QuickAddChips date="2026-08-09" candidates={candidates} />)

    await user.click(screen.getByRole('button', { name: '宝ハイボールの本数を増やす' }))
    await user.click(screen.getByRole('button', { name: /宝ハイボール 500ml/ }))

    await waitFor(() => expect(screen.getByText('28.0g')).toBeInTheDocument())
  })

  it('保存が終わるまでの連打は無視される', async () => {
    let resolveAdd: () => void = () => {}
    addMock.mockImplementation(
      () => new Promise<void>(resolve => { resolveAdd = resolve })
    )

    const user = userEvent.setup()
    render(<QuickAddChips date="2026-08-09" candidates={candidates} />)

    const takara = screen.getByRole('button', { name: /宝ハイボール 500ml/ })
    await user.click(takara)
    await waitFor(() => expect(takara).toBeDisabled())

    // 同じチップ・別のチップのどちらを押しても追加で発火しない
    await user.click(takara)
    await user.click(screen.getByRole('button', { name: /ビール 500ml/ }))

    expect(addMock).toHaveBeenCalledTimes(1)

    resolveAdd()
    await waitFor(() => expect(takara).not.toBeDisabled())
  })
})
