import type { Metadata } from 'next'
import './globals.css'
import { ThemeToggle } from '@/components/theme-toggle'
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs'

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen">
        <ClerkProvider>
          <nav className="border-b px-6 py-4" style={{ borderColor: 'var(--card-border)', background: 'var(--card-bg)' }}>
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <a href="/" className="flex items-center gap-3 group">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] group-hover:scale-110 transition-all duration-300">
                  <svg className="w-6 h-6 text-white group-hover:-translate-y-1 transition-transform duration-300 ease-in-out" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-sm">
                  allo inventory
                </span>
              </a>
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline-block text-sm font-medium px-3 py-1 rounded-full border shadow-inner" style={{ color: 'var(--primary)', borderColor: 'var(--card-border)', background: 'var(--muted-bg)' }}>
                  Reservation System
                </span>
                
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 rounded-md bg-white border border-gray-200 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-100 dark:hover:bg-zinc-800 transition-colors">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-4 py-2 rounded-md bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
                      Sign up
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton afterSignOutUrl="/" />
                </Show>
                
                <ThemeToggle />
              </div>
            </div>
          </nav>
          <main className="max-w-6xl mx-auto px-6 py-8">
            {children}
          </main>
        </ClerkProvider>
      </body>
    </html>
  )
}
