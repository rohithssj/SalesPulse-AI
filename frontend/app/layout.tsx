import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Sidebar } from '@/components/layout/sidebar'
import { NotificationCenter } from '@/components/layout/notification-center-enhanced'
import { AccountProvider } from '@/context/account-context'
import { DataSourceProvider } from '@/context/DataSourceContext'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SalesPulse — AI Sales Command Center',
  description: 'AI-powered sales intelligence and deal management platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" async></script>
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <DataSourceProvider>
          <AccountProvider>
            <Sidebar />
            <main className="ml-64 min-h-screen px-8 py-8">
              {children}
            </main>
            <NotificationCenter />
            <Analytics />
          </AccountProvider>
        </DataSourceProvider>
      </body>
    </html>
  )
}
