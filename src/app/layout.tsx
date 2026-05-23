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
      <body className="min-h-screen flex flex-col">
        <ClerkProvider>
          <nav className="border-b px-6 py-4" style={{ borderColor: 'var(--card-border)', background: 'var(--card-bg)' }}>
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <a href="/" className="flex items-center gap-3 group">
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-300 drop-shadow-sm">
                  {/* Box Top */}
                  <path d="M17 8 L 22 11 L 17 14 L 12 11 Z" fill="#fb923c" />
                  {/* Box Left */}
                  <path d="M12 11 L 17 14 L 17 20 L 12 17 Z" fill="#fdba74" />
                  {/* Box Right */}
                  <path d="M17 14 L 22 11 L 22 17 L 17 20 Z" fill="#f97316" />
                  
                  {/* Clipboard */}
                  <rect x="2" y="5" width="11" height="15" rx="1.5" fill="#ffffff" stroke="#4b5563" strokeWidth="1.5" />
                  
                  {/* Clip */}
                  <path d="M5 3h5v2.5H5V3z" fill="#f97316" />
                  <circle cx="7.5" cy="4.25" r="0.75" fill="#ffffff" />
                  
                  {/* Checklist lines */}
                  <line x1="8" y1="9" x2="11" y2="9" stroke="#4b5563" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="8" y1="12" x2="11" y2="12" stroke="#4b5563" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="8" y1="15" x2="11" y2="15" stroke="#4b5563" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="8" y1="18" x2="11" y2="18" stroke="#4b5563" strokeWidth="1.2" strokeLinecap="round" />
                  
                  {/* Checks and Crosses */}
                  <path d="M4 8.5l1 1 1.5-1.5" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 11.5l1 1 1.5-1.5" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 14.25l2.5 2.5m0-2.5L4 16.75" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M4 17.25l2.5 2.5m0-2.5L4 19.75" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
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
                  <UserButton />
                </Show>
                
                <ThemeToggle />
              </div>
            </div>
          </nav>
          <main className="max-w-6xl mx-auto px-6 py-8 flex-grow">
            {children}
          </main>
          
          <footer className="border-t py-6 mt-auto" style={{ borderColor: 'var(--card-border)' }}>
            <div className="max-w-6xl mx-auto px-6 flex justify-center items-center">
              <p className="text-sm font-medium" style={{ color: 'var(--muted-text)' }}>
                Built by <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">Jayesh Muley</span>
              </p>
            </div>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  )
}
