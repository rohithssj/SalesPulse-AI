import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Sidebar } from '@/components/layout/sidebar'
import { NotificationCenter } from '@/components/layout/notification-center-enhanced'
import { AccountProvider } from '@/context/AccountContext'
import { DataSourceProvider } from '@/context/DataSourceContext'
import './globals.css'

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} antialiased bg-background text-foreground min-h-screen flex w-full overflow-x-hidden`}>
        <DataSourceProvider>
          <AccountProvider>
            <Sidebar />
            <main className="flex-1 min-w-0 min-h-screen px-4 sm:px-6 lg:px-8 pt-24 pb-12 lg:py-8 transition-all duration-300 relative overflow-x-hidden">
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
