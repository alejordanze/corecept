import { Link } from 'react-router-dom'
import type { Concept } from '../data/types'

interface Props {
  sectionSlug: string
  title: string
  tagline: string
  concepts: readonly Concept[]
}

export function ConceptListPage({ sectionSlug, title, tagline, concepts }: Props) {
  const conceptCount = `${concepts.length} ${concepts.length === 1 ? 'concept' : 'concepts'}`

  return (
    <div className="space-y-6">
      <header aria-labelledby="section-title">
        <p className="text-xs font-semibold uppercase text-emerald-400">Section</p>
        <h1 id="section-title" className="mt-1 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="max-w-2xl text-slate-300">{tagline}</p>
            <span aria-label={conceptCount} className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-400">
            {conceptCount}
          </span>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {concepts.map((c) => (
          <Link
            key={c.slug}
            to={`/${sectionSlug}/${c.slug}`}
            className="group rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-slate-600 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">{c.title}</h3>
              <span className="text-slate-500 group-hover:text-slate-200">→</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">{c.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
