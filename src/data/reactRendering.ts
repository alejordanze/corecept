import type { Concept } from './types'

export const reactRendering: readonly Concept[] = [
  {
    slug: 'render-commit-reconciliation', level: 'Intermediate', title: 'Render, commit & reconciliation',
    summary: 'React computes the next tree, matches it with the previous one, then commits changes.',
    explanation: `A trigger such as a state update asks React to render. During render, React calls components to calculate a proposed UI. Reconciliation matches that result against previous children using position, type, and keys. During commit, React applies the required changes to the host tree; the browser later paints.

A component render does not imply that every DOM node changes. Render work must stay pure because React may repeat, pause, or discard it before a commit.`,
    keyPoints: ['Render computes; commit changes the host environment.', 'Type and key help determine which component instance is reused.', 'Browser layout and paint are separate from React render.'],
    reviewQuestions: ['Can a component render without a DOM mutation?', 'Why must render logic be pure?'],
    references: [{ label: 'React: Render and commit', url: 'https://react.dev/learn/render-and-commit' }],
  },
  {
    slug: 'virtual-dom-fiber', level: 'Intermediate', title: 'Virtual DOM & Fiber',
    summary: 'Understand the UI description and the internal work structure without relying on internals.',
    explanation: `Virtual DOM is an informal name for the in-memory descriptions React compares when producing an update. It is not a second browser DOM, and its existence alone does not guarantee speed. React still spends time rendering components, reconciling children, committing DOM operations, and letting the browser lay out and paint.

Fiber is React's internal representation of work and component identity. It helps React organize updates and, where supported, prioritize and interrupt render work. Application code should rely on public behavior such as pure rendering, keys, and transitions rather than Fiber fields or exact scheduling details.`,
    commonMistakes: ['Claiming React always updates faster because it has a virtual DOM.', 'Depending on internal Fiber properties in app code.'],
    reviewQuestions: ['Which phases can be expensive even if few DOM nodes change?', 'What does Fiber help schedule?'],
    references: [{ label: 'React: Render and commit', url: 'https://react.dev/learn/render-and-commit' }],
  },
  {
    slug: 'identity-and-reset', level: 'Intermediate', title: 'Component identity & resetting state',
    summary: 'State belongs to a position and component type in the render tree.',
    explanation: `React preserves state when the same component type stays in the same tree position with the same key. Changing a key intentionally gives React a new identity and resets that subtree's state. Hiding an element with CSS still leaves it mounted; removing it from the tree normally discards its state.

Defining a component inside another component creates a new component function on every parent render, which can unexpectedly reset nested state. Define component types at module scope.`,
    example: { language: 'jsx', code: `function EditorPage({ documentId }) {
  return <Editor key={documentId} documentId={documentId} />;
  // Switching documents remounts Editor and clears its local draft.
}` },
    reviewQuestions: ['When should a key force a reset?', 'Why can a nested component definition lose state?'],
    references: [{ label: 'React: Preserving and resetting state', url: 'https://react.dev/learn/preserving-and-resetting-state' }],
  },
  {
    slug: 'hooks-rules-custom-hooks', level: 'Intermediate', title: 'Hooks & custom hooks',
    summary: 'Call hooks consistently and extract reusable stateful behavior.',
    explanation: `Hooks let function components use React capabilities such as state, effects, context, and refs. Call them at the top level of a React component or another hook, in the same order on every render. Do not call them inside conditions, loops, event handlers, or ordinary helper functions.

A custom hook packages a pattern that uses hooks. Each call gets its own state unless it reads a shared source such as context or an external store; sharing a hook function does not itself create global state.`,
    example: { language: 'jsx', code: `function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  return [on, () => setOn(value => !value)];
}` },
    reviewQuestions: ['Why must hook calls remain in the same order?', 'Do two calls to useToggle share state?'],
    references: [{ label: 'React: Rules of Hooks', url: 'https://react.dev/reference/rules/rules-of-hooks' }],
  },
  {
    slug: 'effects-cleanup', level: 'Intermediate', title: 'Effects, dependencies & cleanup',
    summary: 'Synchronize with external systems and undo that synchronization.',
    explanation: `An effect connects a component to something outside React, such as a subscription, timer, or browser API. Its dependency list names reactive values used inside it. React runs cleanup before re-running an effect with changed dependencies and when the component unmounts. In development Strict Mode, an extra setup and cleanup cycle helps expose missing cleanup.

Do not use an effect merely to derive data from props or state; calculate it during render. For fetching, account for stale responses or use a data layer that handles caching and races.`,
    example: { language: 'jsx', code: `useEffect(() => {
  const connection = connect(roomId);
  connection.open();
  return () => connection.close();
}, [roomId]);` },
    commonMistakes: ['Omitting a changing dependency to silence a loop.', 'Starting a subscription without cleanup.', 'Copying derived data into state through an effect.'],
    reviewQuestions: ['When does cleanup run?', 'What does an empty dependency array mean?'],
    references: [{ label: 'React: Synchronizing with effects', url: 'https://react.dev/learn/synchronizing-with-effects' }],
  },
  {
    slug: 'refs-imperative-apis', level: 'Intermediate', title: 'Refs & imperative APIs',
    summary: 'Keep mutable values that do not drive rendering and access host nodes when needed.',
    explanation: `useRef returns a stable object whose current property can change without triggering a render. It is useful for a DOM node, timer ID, or other mutable value that should not appear directly in the UI. State is the right choice for values that affect rendered output.

Use a ref for a small imperative escape hatch such as focus or measurement. Reading or writing a ref during render usually breaks the model of pure rendering; use handlers or effects for that work.`,
    example: { language: 'jsx', code: `function Search() {
  const inputRef = useRef(null);
  return <>
    <input ref={inputRef} aria-label="Search" />
    <button onClick={() => inputRef.current?.focus()}>Focus</button>
  </>;
}` },
    reviewQuestions: ['Why does changing ref.current not re-render?', 'When should the value be state instead?'],
    references: [{ label: 'React: Referencing values with refs', url: 'https://react.dev/learn/referencing-values-with-refs' }],
  },
]
