import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CondoShield - Protect Your Property Rights',
  description: 'Understand, track, and challenge special assessments and unexpected charges from condo associations and HOAs worldwide.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/shield.svg" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}