import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { ConceptListPage } from './pages/ConceptListPage'
import { ConceptDetailPage } from './pages/ConceptDetailPage'
import { basicConcepts } from './data/basic'
import { advancedConcepts } from './data/advanced'
import { principles } from './data/principles'
import { designPatterns } from './data/designPatterns'
import { architecturePatterns } from './data/architecturePatterns'

export const sections = [
  {
    slug: 'basic',
    title: 'Basic Concepts',
    tagline: 'JavaScript fundamentals every developer should know.',
    concepts: basicConcepts,
  },
  {
    slug: 'advanced',
    title: 'Advanced Concepts',
    tagline: 'Deeper JS/TS topics you meet in real production code.',
    concepts: advancedConcepts,
  },
  {
    slug: 'principles',
    title: 'Principles',
    tagline: 'SOLID, DRY, KISS, YAGNI — the rules behind maintainable code.',
    concepts: principles,
  },
  {
    slug: 'design-patterns',
    title: 'Design Patterns',
    tagline: 'Classic reusable solutions to common design problems.',
    concepts: designPatterns,
  },
  {
    slug: 'architecture-patterns',
    title: 'Architecture Patterns',
    tagline: 'How the whole system fits together — from Clean to Hexagonal.',
    concepts: architecturePatterns,
  },
] as const

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      ...sections.map((s) => ({
        path: s.slug,
        children: [
          {
            index: true,
            element: (
              <ConceptListPage
                sectionSlug={s.slug}
                title={s.title}
                tagline={s.tagline}
                concepts={s.concepts}
              />
            ),
          },
          {
            path: ':conceptSlug',
            element: (
              <ConceptDetailPage sectionSlug={s.slug} concepts={s.concepts} />
            ),
          },
        ],
      })),
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
