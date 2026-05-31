import type { Metadata } from 'next'
import './globals.css'
import { BottomNav } from '@/components/BottomNav/BottomNav'

export const metadata: Metadata = {
  title: '飲酒記録',
  description: '飲みすぎ防止・休肝日管理アプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-800 antialiased">
        <div className="max-w-md mx-auto min-h-screen flex flex-col">
          <div className="flex-1 pb-[calc(80px+env(safe-area-inset-bottom))]">
            {children}
          </div>
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
