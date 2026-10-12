import type { Concept } from './types'

export const reactAdvancedArchitecture: readonly Concept[] = [
  {
    slug: 'server-rendering-hydration', level: 'Advanced', title: 'CSR, SSR, hydration & Server Components',
    summary: 'Choose where HTML is produced and how the client becomes interactive.',
    explanation: `Client-side rendering starts with a browser bundle that builds the UI. Server-side rendering sends HTML for an initial view; hydration attaches React behavior to that HTML in the browser. The first client render must agree with the server output, or hydration can fail or replace content. Streaming can send ready HTML in pieces around Suspense boundaries.

React Server Components run in a supported server framework and send a component payload; they are distinct from ordinary SSR and from client components. They cannot use client-only hooks such as useState. Framework configuration determines the exact boundary and data transport, so do not assume a client-only Vite app has Server Components.`,
    reviewQuestions: ['Why does reading window during server render fail?', 'What causes a hydration mismatch?', 'How are Server Components different from SSR HTML?'],
    references: [{ label: 'React: hydrateRoot', url: 'https://react.dev/reference/react-dom/client/hydrateRoot' }, { label: 'React: Server Components', url: 'https://react.dev/reference/rsc/server-components' }],
  },
  {
    slug: 'react-19-actions', level: 'Advanced', title: 'React 19 Actions & version awareness',
    summary: 'Learn newer form and async APIs while checking the version in your project.',
    explanation: `React 19 adds Action-oriented APIs for async updates. useActionState tracks the result and pending status of an Action. useFormStatus reads the pending state of a parent form, and useOptimistic represents a temporary prediction while an Action completes. These APIs can simplify forms, but they do not remove the need for error handling, validation, and server authority.

This guide app currently uses React 18, so these APIs are study material rather than runnable examples here. Check a project's installed React and react-dom versions before copying examples from current documentation. A framework may add its own conventions for server functions and form submission.`,
    reviewQuestions: ['Which Hook reads the pending state of a parent form?', 'Why should you check installed package versions before using a modern API?'],
    references: [{ label: 'React: useActionState', url: 'https://react.dev/reference/react/useActionState' }, { label: 'React DOM: useFormStatus', url: 'https://react.dev/reference/react-dom/hooks/useFormStatus' }],
  },
  {
    slug: 'optimistic-updates', level: 'Advanced', title: 'Server data & optimistic updates',
    summary: 'Show a predicted result immediately, then reconcile it with the server.',
    explanation: `An optimistic update displays the expected success state before a request finishes. It can make a slow mutation feel immediate, but the operation needs a rollback or correction path for failure. Concurrent edits, duplicate submissions, and server-generated IDs complicate the reconciliation.

Keep the authoritative server result separate from temporary UI intent. A query cache or framework action can help coordinate invalidation and retries. Use optimistic behavior only when users can understand and recover from a failed prediction.`,
    reviewQuestions: ['What should happen if an optimistic save fails?', 'How could two concurrent saves conflict?'],
    references: [{ label: 'React: useOptimistic', url: 'https://react.dev/reference/react/useOptimistic' }],
  },
  {
    slug: 'typescript-with-react', level: 'Advanced', title: 'TypeScript with React',
    summary: 'Model props and UI states so invalid combinations are harder to express.',
    explanation: `TypeScript checks assumptions at build time, but it does not validate network data at runtime. Type component props, event handlers, and refs at their boundaries. Discriminated unions are useful for UI states such as idle, loading, success, and error because each branch can carry only the fields it needs.

Prefer explicit component APIs over broad any types. For generic components, preserve the relationship between input and output types rather than forcing every value through unknown or a single union.`,
    example: { language: 'tsx', code: `type LoadState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

function Results({ state }: { state: LoadState<string[]> }) {
  if (state.status === 'loading') return <p>Loading…</p>;
  if (state.status === 'error') return <p>{state.message}</p>;
  return <ul>{state.data.map(item => <li key={item}>{item}</li>)}</ul>;
}` },
    reviewQuestions: ['What does a discriminated union prevent?', 'Why does TypeScript not prove an API response is valid?'],
    references: [{ label: 'React: Using TypeScript', url: 'https://react.dev/learn/typescript' }],
  },
  {
    slug: 'accessibility-security', level: 'Advanced', title: 'Accessibility & security in React',
    summary: 'Build semantic interactions and treat external content as untrusted.',
    explanation: `React does not make a UI accessible automatically. Prefer native buttons, labels, links, and form controls; manage focus for dialogs and route changes; and test with keyboard and assistive technology. A portal changes DOM placement but does not supply modal behavior.

React escapes text content by default. Rendering raw HTML through dangerouslySetInnerHTML bypasses that protection and needs trusted, sanitized input. Authentication identifies a user; authorization checks what that user may do, and enforcement belongs on the server.`,
    reviewQuestions: ['What must a portal-based dialog add for keyboard users?', 'Why is rendering an untrusted HTML string dangerous?'],
    references: [{ label: 'React: dangerouslySetInnerHTML', url: 'https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html' }, { label: 'WAI-ARIA Authoring Practices: Dialog', url: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/' }],
  },
  {
    slug: 'routing-url-state', level: 'Advanced', title: 'Routing & URL state',
    summary: 'Use the URL for shareable navigation state and local state for transient UI.',
    explanation: `A router maps a URL to a screen and handles navigation without forcing a full page load in a client-side app. Path segments and query parameters are useful for state that should survive refresh, support back/forward navigation, or be shareable: a selected record, search term, filter, or page number.

Transient details such as a hover state or unsaved field value often belong in local state. On navigation, decide whether state should be preserved, reset, or restored from the URL. A server still needs an appropriate fallback or rewrite for direct requests to client-side routes.`,
    reviewQuestions: ['Should a shareable search filter live only in component state?', 'What happens when someone directly opens a nested client-side URL without a server fallback?'],
    references: [{ label: 'React Router: URL Values', url: 'https://reactrouter.com/start/declarative/url-values' }],
  },
  {
    slug: 'class-lifecycle', level: 'Advanced', title: 'Class lifecycle & legacy React',
    summary: 'Read class components and map their synchronization behavior to modern React.',
    explanation: `Class components use props, this.state, and this.setState. componentDidMount runs after mounting, componentDidUpdate after updates, and componentWillUnmount before removal. A subscription often needs all three so it starts, responds to changed props, and cleans up. PureComponent performs a shallow comparison to skip some renders; it does not make impure rendering safe.

Function components usually express synchronization with effects and cleanup, but lifecycle methods and effects are not a one-to-one translation. Error boundaries still commonly use a class because componentDidCatch has no direct function-component equivalent in React 18.`,
    reviewQuestions: ['Which lifecycle method should release a subscription?', 'Why is a direct line-by-line conversion from lifecycle methods to effects risky?'],
    references: [{ label: 'React: Component', url: 'https://react.dev/reference/react/Component' }],
  },
  {
    slug: 'testing-debugging-architecture', level: 'Advanced', title: 'Testing, debugging & architecture',
    summary: 'Test observable behavior and place boundaries around real product responsibilities.',
    explanation: `A useful component test checks what a user can see and do: input, loading, success, failure, and keyboard interactions. Test request races, error paths, and state resets where they matter. Use React DevTools and browser profiling to distinguish component render cost from network, layout, and paint cost.

As an app grows, organize by feature boundaries and data ownership. Keep presentation, server access, and domain decisions understandable without creating abstractions for hypothetical reuse. When an issue appears in production, start with evidence from logs, traces, and a reproducible interaction before changing architecture.`,
    reviewQuestions: ['How would you test that an old search result cannot overwrite a new one?', 'Which tool tells you whether layout or React rendering is slow?'],
    references: [{ label: 'React: act', url: 'https://react.dev/reference/react/act' }],
  },
]
