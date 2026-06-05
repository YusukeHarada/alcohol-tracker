import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NavWrapper } from '@/components/NavWrapper/NavWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '飲酒記録',
  description: '飲みすぎ防止・休肝日管理アプリ',
  icons: {
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <div className="max-w-md mx-auto min-h-screen flex flex-col">
          <div className="flex-1 pb-[calc(80px+env(safe-area-inset-bottom))]">
            {children}
          </div>
          <NavWrapper />
        </div>
      </body>
    </html>
  )
}
