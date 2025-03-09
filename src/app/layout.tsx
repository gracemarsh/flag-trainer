import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/mode-toggle'
import { Analytics } from '@/components/analytics'
import { SpeedInsights } from '@/components/speed-insights'

// Import the reportWebVitals function
import { reportWebVitals } from './reportWebVitals'

// Initialize web vitals reporting
if (typeof window !== 'undefined') {
  reportWebVitals()
}

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flag Trainer - Learn World Flags',
  description: 'Learn all the flags of the world with spaced repetition',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <div className='flex flex-col min-h-screen'>
            <header className='border-b'>
              <div className='container flex items-center justify-between h-16 px-4 md:px-6'>
                <Link href='/' className='flex items-center gap-2 font-bold text-xl'>
                  <span className='hidden sm:inline'>🚩</span> Flag Trainer
                </Link>
                <nav className='hidden md:flex items-center gap-6 text-sm'>
                  <Link href='/learn' className='font-medium transition-colors hover:text-primary'>
                    Learn
                  </Link>
                  <Link
                    href='/library'
                    className='font-medium transition-colors hover:text-primary'
                  >
                    Library
                  </Link>
                  <Link href='/stats' className='font-medium transition-colors hover:text-primary'>
                    Stats
                  </Link>
                </nav>
                <div className='flex items-center gap-2'>
                  <ModeToggle />
                  <Button asChild variant='outline' size='sm' className='hidden md:flex'>
                    <Link href='/login'>Login</Link>
                  </Button>
                  <Button asChild size='sm' className='hidden md:flex'>
                    <Link href='/signup'>Sign Up</Link>
                  </Button>
                  <Button variant='outline' size='icon' className='md:hidden'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='h-5 w-5'
                    >
                      <line x1='4' x2='20' y1='12' y2='12' />
                      <line x1='4' x2='20' y1='6' y2='6' />
                      <line x1='4' x2='20' y1='18' y2='18' />
                    </svg>
                    <span className='sr-only'>Toggle menu</span>
                  </Button>
                </div>
              </div>
            </header>
            <main className='flex-1'>{children}</main>
            <footer className='border-t py-6 md:py-8'>
              <div className='container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8 px-4 md:px-6'>
                <p className='text-center text-sm text-muted-foreground md:text-left'>
                  &copy; {new Date().getFullYear()} Flag Trainer. All rights reserved.
                </p>
                <nav className='flex gap-4 sm:gap-6'>
                  <Link
                    href='/about'
                    className='text-sm font-medium hover:underline underline-offset-4'
                  >
                    About
                  </Link>
                  <Link
                    href='/privacy'
                    className='text-sm font-medium hover:underline underline-offset-4'
                  >
                    Privacy
                  </Link>
                  <Link
                    href='/terms'
                    className='text-sm font-medium hover:underline underline-offset-4'
                  >
                    Terms
                  </Link>
                </nav>
              </div>
            </footer>
          </div>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
