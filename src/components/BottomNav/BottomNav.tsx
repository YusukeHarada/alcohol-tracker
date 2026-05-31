'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/',          label: 'ホーム',       icon: '🏠' },
  { href: '/calendar',  label: 'カレンダー',   icon: '📅' },
  { href: '/stats',     label: '統計',         icon: '📊' },
  { href: '/templates', label: 'テンプレート', icon: '⚡' },
  { href: '/settings',  label: '設定',         icon: '⚙️' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
    className="
      fixed
      bottom-3
      left-3
      right-3
      max-w-md
      mx-auto
      bg-white
      rounded-2xl
      shadow-lg
      border
      z-40
      "
    >
      <div className="max-w-md mx-auto flex">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex-1 flex flex-col items-center py-2 text-xs gap-0.5
                ${isActive ? 'text-blue-600' : 'text-gray-400'}
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
