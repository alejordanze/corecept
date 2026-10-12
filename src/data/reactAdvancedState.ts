import type { Concept } from './types'

export const reactAdvancedState: readonly Concept[] = [
  {
    slug: 'transitions-deferred-values', level: 'Advanced', title: 'Concurrent rendering & transitions',
    summary: 'Mark nonurgent updates so urgent interactions stay responsive.',
    explanation: `Modern React can prepare some renders in interruptible work and discard an obsolete render before commit. This does not make arbitrary JavaScript asynchronous: a long synchronous calculation still blocks the main thread. A transition marks an update as nonurgent, while useDeferredValue lets a slower part of the UI lag behind a rapidly changing value.

Keep the input's own value update urgent, then transition the expensive results. Transitions do not replace debouncing, data caching, or worker threads when those are the actual bottleneck.`,
    example: { language: 'jsx', code: `const [isPending, startTransition] = useTransition();
function handleChange(event) {
  const next = event.target.value;
  setInput(next); // urgent: keep typing responsive
  startTransition(() => setFilter(next));
}` },
    reviewQuestions: ['Can React interrupt your long-running event handler?', 'Which update in the example should stay urgent?'],
    references: [{ label: 'React: useTransition', url: 'https://react.dev/reference/react/useTransition' }],
  },
  {
    slug: 'suspense-code-splitting', level: 'Advanced', title: 'Suspense & code splitting',
    summary: 'Show a fallback while a supported child is not ready.',
    explanation: `React.lazy loads component code when that component is first rendered. A nearby Suspense boundary can show fallback UI while it loads. Suspense also coordinates other supported suspending data sources, usually supplied by a framework or cache. A fetch started inside useEffect does not suspend merely because it returns a Promise.

Place boundaries around meaningful parts of the page, and pair them with error boundaries for rejected loads. Loading a component on demand reduces initial JavaScript but may introduce a request waterfall if the route cannot preload its code and data.`,
    example: { language: 'jsx', code: `import { lazy, Suspense } from 'react';
const Chart = lazy(() => import('./Chart'));

function Dashboard() {
  return <Suspense fallback={<p>Loading chart…</p>}>
    <Chart />
  </Suspense>;
}` },
    reviewQuestions: ['Does fetching in useEffect trigger Suspense?', 'Where would you place a boundary for a slow chart?'],
    references: [{ label: 'React: Suspense', url: 'https://react.dev/reference/react/Suspense' }],
  },
  {
    slug: 'external-stores', level: 'Advanced', title: 'External stores & useSyncExternalStore',
    summary: 'Subscribe safely to mutable state that lives outside React.',
    explanation: `An external store may change without a React setter. useSyncExternalStore accepts a subscribe function and a getSnapshot function so React can read a consistent value and re-render when it changes. The snapshot should be immutable and cached while the underlying data is unchanged. Server rendering may also need getServerSnapshot.

This API is mainly for integrating existing stores or browser APIs. For ordinary component data, useState or useReducer is simpler. External stores must define ownership, subscription cleanup, and update semantics.`,
    example: { language: 'jsx', code: `function subscribe(onChange) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}
function getSnapshot() { return navigator.onLine; }
function getServerSnapshot() { return true; }

function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}` },
    reviewQuestions: ['Why must getSnapshot return a stable value while data is unchanged?', 'What is the third argument for?'],
    references: [{ label: 'React: useSyncExternalStore', url: 'https://react.dev/reference/react/useSyncExternalStore' }],
  },
  {
    slug: 'state-management-strategy', level: 'Advanced', title: 'Choosing state management',
    summary: 'Pick the smallest tool that matches ownership, sharing, and update needs.',
    explanation: `Start with local state. Lift it when siblings need to coordinate. A reducer makes complicated transitions explicit. Context distributes a value to distant descendants. An external store can help when unrelated areas need frequent shared updates or the state already lives outside React. Server data needs a cache with freshness and request handling rather than only a global client store.

Libraries such as Redux Toolkit, Zustand, Jotai, or XState solve different problems. Compare update frequency, debugging needs, persistence, team familiarity, and bundle cost with a concrete feature before choosing one. Avoid copying every server response and every local field into one global store.`,
    keyPoints: ['Local UI state, shared client state, and server data have different lifecycles.', 'Context transports a value; reducers define transitions.', 'Choose libraries by requirements and measured pain.'],
    reviewQuestions: ['Where should a modal-open flag live?', 'Where would you keep cached paginated API results?', 'When is a state machine useful?'],
    references: [{ label: 'React: Managing state', url: 'https://react.dev/learn/managing-state' }],
  },
  {
    slug: 'redux-toolkit', level: 'Advanced', title: 'Redux Toolkit data flow',
    summary: 'Understand actions, reducers, selectors, middleware, and server-data queries.',
    explanation: `Redux stores shared application state outside components. An action describes an event; a reducer calculates the next state; a selector reads a useful slice. Redux Toolkit's createSlice groups action creators and reducers and uses Immer so reducer code can express an immutable update with mutation-like syntax. Middleware handles cross-cutting dispatch behavior; RTK Query adds API request and cache management.

Reducer logic should remain predictable. A memoized selector helps when deriving an expensive value from unchanged inputs, but unnecessary selectors and global state add complexity. Use Redux when its observable data flow and tooling solve a real application need.`,
    reviewQuestions: ['What is the action → reducer → state → selector flow?', 'Does Immer allow you to mutate state outside reducers?'],
    references: [{ label: 'Redux Toolkit: createSlice', url: 'https://redux-toolkit.js.org/api/createSlice' }, { label: 'Redux Toolkit: RTK Query overview', url: 'https://redux-toolkit.js.org/rtk-query/overview' }],
  },
]
