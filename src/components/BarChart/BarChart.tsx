import type { BarData } from '@/domain/stats'

type Props = {
  data: BarData[]
  height?: number
}

const CHART_H = 120
const BAR_W   = 28
const GAP     = 12

export function BarChart({ data, height = CHART_H }: Props) {
  if (data.length === 0) return null

  const maxVal  = Math.max(...data.map(d => d.value), 1)
  const totalW  = data.length * (BAR_W + GAP) - GAP + 20
  const limitY  = height - (40 / maxVal) * height

  return (
    <svg
      viewBox={`0 0 ${totalW} ${height + 30}`}
      className="w-full"
      aria-label="飲酒量グラフ"
    >
      {data.map((d, i) => {
        const barH = (d.value / maxVal) * height
        const x    = 10 + i * (BAR_W + GAP)
        const y    = height - barH

        return (
          <g key={d.label}>
            <rect
              data-testid={`bar-${d.label}`}
              data-over={String(d.isOver)}
              data-value={String(d.value)}
              x={x}
              y={y}
              width={BAR_W}
              height={barH}
              rx={4}
              fill={d.isOver ? '#fca5a5' : d.value === 0 ? '#bfdbfe' : '#93c5fd'}
            />
            <text
              x={x + BAR_W / 2}
              y={height + 16}
              textAnchor="middle"
              fontSize={11}
              fill="#9ca3af"
            >
              {d.label}
            </text>
            {d.value > 0 && (
              <text
                x={x + BAR_W / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize={10}
                fill={d.isOver ? '#dc2626' : '#3b82f6'}
              >
                {d.value.toFixed(0)}
              </text>
            )}
          </g>
        )
      })}

      <line
        x1={0}
        y1={limitY}
        x2={totalW}
        y2={limitY}
        stroke="#fca5a5"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
    </svg>
  )
}
