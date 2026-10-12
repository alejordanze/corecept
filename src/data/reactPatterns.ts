import type { Concept } from './types'

export const reactPatterns: readonly Concept[] = [
  {
    slug: 'reducer-context-state-ownership', level: 'Intermediate', title: 'Reducers, Context & state ownership',
    summary: 'Place state near its consumers; use reducers for complex updates and Context for reach.',
    explanation: `Lift state to the closest common ancestor when siblings need the same value. useReducer groups related transitions into a pure reducer that receives state and an action. Context passes a value to descendants without threading it through every intermediate component. Reducer plus Context can provide a shared feature state and dispatch function.

Context is a delivery mechanism, not a complete cache or state-management library. A changing provider value can re-render consumers, so split unrelated contexts and keep state local when practical.`,
    example: { language: 'jsx', code: `function reducer(state, action) {
  switch (action.type) {
    case 'added': return [...state, action.task];
    case 'removed': return state.filter(t => t.id !== action.id);
    default: return state;
  }
}` },
    reviewQuestions: ['When should state be lifted?', 'What does Context solve, and what does it leave to you?'],
    references: [{ label: 'React: Scaling up with reducer and context', url: 'https://react.dev/learn/scaling-up-with-reducer-and-context' }],
  },
  {
    slug: 'hoc-render-props-compound', level: 'Intermediate', title: 'HOCs, render props & compound components',
    summary: 'Recognize three ways to reuse behavior and coordinate related components.',
    explanation: `A higher-order component (HOC) is a function that accepts a component and returns an enhanced component. A render prop passes a function that produces UI. Compound components, such as Tabs with Tab and Panel children, coordinate through a shared parent API, often with Context. Custom hooks are often simpler for new function-component logic, but HOCs and render props remain common in existing libraries.

Keep HOC creation outside render so its returned component has stable identity. Forward relevant props and refs deliberately, choose a useful display name, and avoid prop name collisions.`,
    example: { language: 'jsx', code: `function withLoading(Wrapped) {
  function WithLoading({ isLoading, ...props }) {
    return isLoading ? <p>Loading…</p> : <Wrapped {...props} />;
  }
  WithLoading.displayName = 'WithLoading';
  return WithLoading;
}

const UserListWithLoading = withLoading(UserList);` },
    reviewQuestions: ['What is a HOC’s input and output?', 'Why create a HOC outside render?', 'When is a custom hook simpler?'],
    references: [{ label: 'React: Reusing logic with custom hooks', url: 'https://react.dev/learn/reusing-logic-with-custom-hooks' }],
  },
  {
    slug: 'portals-error-boundaries', level: 'Intermediate', title: 'Portals & error boundaries',
    summary: 'Render UI in another DOM location and contain render failures.',
    explanation: `A portal puts a child into a different DOM container while it remains part of the same React tree. Context and React event propagation still follow the React tree. Portals help with overlays, but a modal also needs focus management, an accessible name, and appropriate keyboard behavior.

An error boundary catches rendering errors in its descendant tree and shows fallback UI. It does not catch errors in event handlers or arbitrary asynchronous callbacks. A Suspense fallback handles waiting for supported asynchronous rendering; an error boundary handles failures.`,
    example: { language: 'jsx', code: `import { createPortal } from 'react-dom';

function Overlay({ children }) {
  return createPortal(children, document.body);
}` },
    reviewQuestions: ['Does a portal break Context?', 'Which errors can an error boundary catch?'],
    references: [{ label: 'React: createPortal', url: 'https://react.dev/reference/react-dom/createPortal' }, { label: 'React: Component error boundaries', url: 'https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary' }],
  },
  {
    slug: 'memoization-profiling', level: 'Intermediate', title: 'Memoization & profiling',
    summary: 'Measure slow work before adding memo, useMemo, or useCallback.',
    explanation: `React.memo can skip a child render when its props compare equal. useMemo caches a calculation result and useCallback caches a function identity between renders. These are performance tools, not correctness tools: a component still re-renders for its own state or consumed context, and new object or function props can defeat memoization.

Use React DevTools Profiler and browser performance tools to find the actual cost. For a huge list, virtualization or a better algorithm can matter more than memoizing small calculations. React Compiler can automate some memoization in supported builds; this project does not enable it.`,
    reviewQuestions: ['Why can a memoized child still re-render?', 'What evidence would justify useMemo?'],
    references: [{ label: 'React: memo', url: 'https://react.dev/reference/react/memo' }, { label: 'React: useMemo', url: 'https://react.dev/reference/react/useMemo' }],
  },
  {
    slug: 'async-data-races', level: 'Intermediate', title: 'Fetching data & avoiding races',
    summary: 'A request result should only update the view it still belongs to.',
    explanation: `A simple effect can fetch data for an ID, but an earlier request may finish after a later one. Cleanup should abort the old request or mark its result stale so it cannot overwrite the new view. Also model loading, errors, and empty data explicitly.

For larger apps, a framework or server-data cache can provide deduplication, caching, retries, and request lifecycle handling. These concerns are different from local UI state such as whether a panel is open.`,
    example: { language: 'jsx', code: `useEffect(() => {
  const controller = new AbortController();
  fetch('/api/users/' + userId, { signal: controller.signal })
    .then(r => { if (!r.ok) throw new Error('Request failed'); return r.json(); })
    .then(setUser)
    .catch(error => { if (error.name !== 'AbortError') setError(error); });
  return () => controller.abort();
}, [userId]);` },
    reviewQuestions: ['What happens if the first of two requests finishes last?', 'Which state belongs in a server-data cache?'],
    references: [{ label: 'React: Fetching data with effects', url: 'https://react.dev/reference/react/useEffect#fetching-data-with-effects' }],
  },
]
