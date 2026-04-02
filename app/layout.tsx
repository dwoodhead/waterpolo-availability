import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Training Availability',
  description: 'Sign up for upcoming water polo training sessions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f2f2f2] text-[#111111] antialiased">{children}</body>
    </html>
  )
}
