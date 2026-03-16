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
      <body className={`${inter.className} antialiased bg-background text-foreground min-h-screen`}>
        <DataSourceProvider>
          <AccountProvider>
            <Sidebar />
            <main className="md:ml-20 lg:ml-64 min-h-screen px-4 sm:px-8 py-20 lg:py-8 transition-all duration-300">
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
