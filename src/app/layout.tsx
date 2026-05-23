import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Allo Inventory | Reserve & Checkout',
  description: 'Multi-warehouse inventory reservation system by Allo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <nav className="border-b px-6 py-4" style={{ borderColor: 'var(--card-border)', background: 'var(--card-bg)' }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
              allo
            </a>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              Inventory Reservation System
            </span>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
