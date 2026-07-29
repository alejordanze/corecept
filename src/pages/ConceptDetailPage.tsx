import { Fragment, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Concept } from '../data/types'
import { CodePlayground } from '../components/CodePlayground'

interface Props {
  sectionSlug: string
  concepts: readonly Concept[]
}

type ExplanationBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] }

function renderInline(text: string): ReactNode[] {
  return text
    .split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[0.9em] text-emerald-200"
          >
            {part.slice(1, -1)}
          </code>
        )
      }

      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        )
      }

      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={index} className="text-slate-100">
            {part.slice(1, -1)}
          </em>
        )
      }

      return <Fragment key={index}>{part}</Fragment>
    })
}

function getExplanationBlocks(text: string): ExplanationBlock[] {
  const blocks: ExplanationBlock[] = []

  for (const rawBlock of text.trim().split(/\n\n+/)) {
    const paragraphLines: string[] = []
    const listItems: string[] = []

    const flushParagraph = () => {
      if (paragraphLines.length === 0) return
      blocks.push({ kind: 'paragraph', text: paragraphLines.join(' ') })
      paragraphLines.length = 0
    }

    const flushList = () => {
      if (listItems.length === 0) return
      blocks.push({ kind: 'list', items: [...listItems] })
      listItems.length = 0
    }

    for (const line of rawBlock.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed) continue

      if (trimmed.startsWith('- ')) {
        flushParagraph()
        listItems.push(trimmed.slice(2))
      } else {
        flushList()
        paragraphLines.push(trimmed)
      }
    }

    flushParagraph()
    flushList()
  }

  return blocks
}

function StudyList({
  title,
  items,
  accentClass,
}: {
  title: string
  items?: readonly string[]
  accentClass: string
}) {
  if (!items || items.length === 0) return null

  return (
    <section className={`rounded-lg border bg-slate-900/50 p-4 ${accentClass}`}>
      <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ConceptDetailPage({ sectionSlug, concepts }: Props) {
  const { conceptSlug } = useParams()
  const idx = concepts.findIndex((c) => c.slug === conceptSlug)
  const concept = idx >= 0 ? concepts[idx] : undefined

  if (!concept) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-slate-300">
        <p role="status">Concept not found.</p>
        <Link
          to={`/${sectionSlug}`}
          className="mt-3 inline-block text-sm text-emerald-400 hover:underline"
        >
          ← Back to section
        </Link>
      </div>
    )
  }

  const prev = idx > 0 ? concepts[idx - 1] : undefined
  const next = idx < concepts.length - 1 ? concepts[idx + 1] : undefined

  return (
    <article className="space-y-8">
      <nav aria-label="Concept breadcrumb" className="text-sm">
        <Link to={`/${sectionSlug}`} className="text-emerald-400 hover:underline">
          ← All concepts
        </Link>
      </nav>

      <header>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{concept.title}</h1>
        <p className="mt-2 max-w-2xl text-slate-300">{concept.summary}</p>
      </header>

      <section className="max-w-none space-y-4 leading-relaxed text-slate-200">
        {getExplanationBlocks(concept.explanation).map((block, i) =>
          block.kind === 'paragraph' ? (
            <p key={i}>{renderInline(block.text)}</p>
          ) : (
            <ul key={i} className="list-disc space-y-2 pl-5 marker:text-emerald-400">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          ),
        )}
      </section>

      {concept.keyPoints && concept.keyPoints.length > 0 && (
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-sm font-semibold uppercase text-slate-400">
            Key points
          </h2>
          <ul className="mt-3 space-y-2 text-slate-200">
            {concept.keyPoints.map((kp, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-emerald-400">▸</span>
                <span>{renderInline(kp)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(concept.useCases || concept.commonMistakes || concept.tryIt) && (
        <div className="grid gap-3 lg:grid-cols-3">
          <StudyList
            title="Where this shows up"
            items={concept.useCases}
            accentClass="border-sky-900/70"
          />
          <StudyList
            title="Common mistakes"
            items={concept.commonMistakes}
            accentClass="border-amber-900/70"
          />
          <StudyList
            title="Try next"
            items={concept.tryIt}
            accentClass="border-emerald-900/70"
          />
        </div>
      )}

      {concept.exercise && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            {concept.exercise.title ?? 'Practical exercise'}
          </h2>
          <CodePlayground
            key={concept.slug}
            initialCode={concept.exercise.code}
            language={concept.exercise.language}
            hint={concept.exercise.hint}
          />
        </section>
      )}

      {concept.references && concept.references.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase text-slate-400">
            Further reading
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {concept.references.map((r) => (
              <li key={r.url}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  {r.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="Concept pagination" className="flex items-center justify-between gap-3 border-t border-slate-800 pt-6">
        {prev ? (
          <Link
            to={`/${sectionSlug}/${prev.slug}`}
            className="flex-1 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-sm hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <span className="block text-xs text-slate-500">← Previous</span>
            <span className="mt-0.5 block font-medium text-slate-100">{prev.title}</span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link
            to={`/${sectionSlug}/${next.slug}`}
            className="flex-1 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-right text-sm hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <span className="block text-xs text-slate-500">Next →</span>
            <span className="mt-0.5 block font-medium text-slate-100">{next.title}</span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </article>
  )
}
