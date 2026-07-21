import { Link } from 'react-router-dom'
import { advancedConcepts } from '../data/advanced'
import { architecturePatterns } from '../data/architecturePatterns'
import { basicConcepts } from '../data/basic'
import { designPatterns } from '../data/designPatterns'
import { principles } from '../data/principles'

const sections = [
  {
    to: '/basic',
    title: 'Basic Concepts',
    desc: 'Hoisting, closures, references, destructuring, this, prototypes, coercion.',
    concepts: basicConcepts,
    tint: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
  },
  {
    to: '/advanced',
    title: 'Advanced Concepts',
    desc: 'Event loop, promises, cancellation, generators, memoization, TypeScript types.',
    concepts: advancedConcepts,
    tint: 'from-sky-500/20 to-sky-500/5 border-sky-500/30',
  },
  {
    to: '/principles',
    title: 'Principles',
    desc: 'SOLID, separation of concerns, DRY, KISS, YAGNI, composition.',
    concepts: principles,
    tint: 'from-violet-500/20 to-violet-500/5 border-violet-500/30',
  },
  {
    to: '/design-patterns',
    title: 'Design Patterns',
    desc: 'Singleton, Factory, Observer, Strategy, Decorator, Adapter.',
    concepts: designPatterns,
    tint: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  },
  {
    to: '/architecture-patterns',
    title: 'Architecture Patterns',
    desc: 'MVC, Layered, Hexagonal, Clean, Event-driven.',
    concepts: architecturePatterns,
    tint: 'from-rose-500/20 to-rose-500/5 border-rose-500/30',
  },
]

export function Home() {
  return (
    <div className="space-y-12">
      <section className="pt-6">
        <p className="mb-3 text-sm font-medium uppercase text-emerald-400">
          Concepts Review
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
          A hands-on space to review JavaScript &amp; TypeScript concepts.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          Whether you are prepping for an interview or brushing up on ideas you use every day,
          each concept here comes with a plain-English explanation and an editable, runnable
          exercise. No setup, no distractions — just read, tweak, and run.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/basic"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Start with Basics
          </Link>
          <Link
            to="/advanced"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Jump to Advanced
          </Link>
        </div>
      </section>

      <section aria-labelledby="browse-heading">
        <h2 id="browse-heading" className="mb-4 text-sm font-semibold uppercase text-slate-400">
          Browse by area
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className={`group rounded-xl border bg-gradient-to-br p-5 transition-transform hover:-translate-y-0.5 ${s.tint}`}
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-slate-300">{s.desc}</p>
              <span className="mt-4 inline-block text-xs font-medium text-slate-200 group-hover:text-white">
                {s.concepts.length} concepts
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-semibold text-white">Recommended review path</h2>
        <ol className="mt-3 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
          <li>
            <span className="block font-semibold text-slate-100">1. Runtime basics</span>
            Start with scope, hoisting, closures, references, and{' '}
            <code className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[0.9em] text-emerald-200">
              this
            </code>
            .
          </li>
          <li>
            <span className="block font-semibold text-slate-100">2. Async behavior</span>
            Move through the event loop, promises, async/await, cancellation, and timers.
          </li>
          <li>
            <span className="block font-semibold text-slate-100">3. Design judgment</span>
            Compare principles, patterns, and architecture choices against the code examples.
          </li>
        </ol>
      </section>
    </div>
  )
}
