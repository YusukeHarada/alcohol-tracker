'use client'

import { usePathname } from 'next/navigation'
import { BottomNav } from '@/components/BottomNav/BottomNav'

export function NavWrapper() {
  const pathname = usePathname()
  if (pathname === '/login') return null
  return <BottomNav />
}
