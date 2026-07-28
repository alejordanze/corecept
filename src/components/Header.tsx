import { NavLink } from 'react-router-dom'

const links = [
  { to: '/basic', label: 'Basic' },
  { to: '/advanced', label: 'Advanced' },
  { to: '/principles', label: 'Principles' },
  { to: '/design-patterns', label: 'Design Patterns' },
  { to: '/architecture-patterns', label: 'Architecture' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <NavLink to="/" className="group flex items-center gap-2">
          <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-sky-500 text-slate-950 font-bold">
            {'{}'}
          </span>
          <span className="text-sm font-semibold text-slate-100 group-hover:text-white">
            Concepts Review
          </span>
        </NavLink>

        <nav aria-label="Main navigation" className="flex max-w-[70%] flex-wrap justify-end gap-1 text-sm">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-1.5 transition-colors',
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
                ].join(' ')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
