import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'
import Script from 'next/script'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Linknote – Save and Organize Resources, Snippets, and Technical Links for Developers',
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
  openGraph: {
    type: 'website',
    title: 'Linknote – Save and Organize Resources, Snippets, and Technical Links for Developers',
    description:
      'Linknote is the ultimate tool for developers to save, organize, and quickly access code snippets, technical resources, and useful development links — all in one place.',
    url: 'https://linknotejs.netlify.app',
    images: [
      {
        url: 'https://linknotejs.netlify.app/linknote-og.png',
        width: 1200,
        height: 630,
        alt: 'Linknote – Built by John Serrano',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Linknote – Save and Organize Resources, Snippets, and Technical Links for Developers',
    description:
      'Linknote is the ultimate tool for developers to save, organize, and quickly access code snippets, technical resources, and useful development links — all in one place.',
    creator: '@johnserranodev',
    images: ['https://linknotejs.netlify.app/og.png'],
  },
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
      <head>
        <Script
          src='https://analytics.ahrefs.com/analytics.js'
          data-key='oWHvWnPViKQiADQmKCGRJg'
          async
          strategy='beforeInteractive'
        />
      </head>
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
