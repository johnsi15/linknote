import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Linknote',
  description:
    'Linknote is the ultimate tool for developers to save, organize, and quickly access coding resources, code snippets, and technical links.',
  keywords: [
    'Linknote',
    'Tags',
    'Coding resources',
    'Code snippets',
    'Developer tools',
    'Productivity for developers',
    'Organize code',
    'AI coding assistant',
    'Save programming links',
    'Code notes',
    'Personal developer workspace',
    'Context-aware autocomplete',
    'Code organization app',
    'John Serrano',
  ],
  applicationName: 'Linknote',
  authors: [
    {
      name: 'John Serrano',
      url: 'https://johnserrano.co/',
    },
  ],
  creator: 'John Serrano',
  icons: {
    icon: '/favicon/icon.svg',
    apple: '/favicon/apple-touch-icon.png',
  },
  category: 'technology',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='es' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
        style={{ colorScheme: 'dark' }}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
