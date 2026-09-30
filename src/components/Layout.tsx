import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'

export function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-emerald-400 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800 bg-slate-950/60 px-4 py-6 text-xs text-slate-400 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between">
          <p>
            Made with <span role="img" aria-label="love" className="text-emerald-400">♥</span> by{' '}
            <a
              href="https://alejordan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-200 underline decoration-slate-600 underline-offset-4 hover:text-emerald-400 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              Alejandro Jordan
            </a>
          </p>
          <nav aria-label="Social links" className="flex items-center gap-5">
            <a
              href="https://github.com/alejordanze"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/alejordanze/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              LinkedIn
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
