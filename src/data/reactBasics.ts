import type { Concept } from './types'

export const reactBasics: readonly Concept[] = [
  {
    slug: 'declarative-react', level: 'Basics', title: 'What React does',
    summary: 'Describe the UI for a given state; React updates the screen.',
    explanation: `React is a library for building user interfaces from components. Instead of manually finding and changing DOM nodes after every event, a component describes what the UI should look like for its current props and state. React renders that description and commits the necessary changes to the host environment.

Declarative code still needs clear ownership of data and side effects. React does not replace the browser, a router, a data cache, or application decisions about accessibility and security.`,
    keyPoints: ['A component maps inputs to UI.', 'Events request state changes; a later render describes the next UI.', 'React rendering and browser painting are separate steps.'],
    reviewQuestions: ['What work does React handle after state changes?', 'What still belongs to your application or the browser?'],
    references: [{ label: 'React: Describing the UI', url: 'https://react.dev/learn/describing-the-ui' }],
  },
  {
    slug: 'jsx-components-elements', level: 'Basics', title: 'JSX, components & elements',
    summary: 'JSX describes elements; components are functions that return UI.',
    explanation: `JSX is syntax transformed by a build tool into JavaScript calls that create React elements. Browsers do not parse JSX directly. An element is a description of what to render, while a component is a function (or legacy class) that produces elements. A component name starts with a capital letter so JSX can distinguish it from a host tag such as div.

Render logic should be pure: the same props, state, and context should produce the same result. Keep subscriptions, network calls, and DOM changes outside render.`,
    example: { language: 'jsx', code: `function Greeting({ name }) {
  return <h2>Hello, {name}</h2>;
}

export default function App() {
  return <Greeting name="Ada" />;
}` },
    commonMistakes: ['Calling a component as a regular function when React should render it.', 'Performing side effects while rendering.'],
    reviewQuestions: ['How is a component different from an element?', 'Why does JSX need a build step?'],
    references: [{ label: 'React: Your first component', url: 'https://react.dev/learn/your-first-component' }],
  },
  {
    slug: 'props-composition', level: 'Basics', title: 'Props, children & composition',
    summary: 'Pass data into components and assemble behavior through nesting.',
    explanation: `Props are read-only inputs supplied by a parent. The children prop lets a wrapper accept nested UI without knowing its details. Composition makes small components reusable by combining them, rather than relying on component inheritance.

Data normally flows down. If a child needs to change something owned by a parent, the parent passes a callback. Do not mutate a prop object to make the screen update.`,
    example: { language: 'jsx', code: `function Panel({ title, children }) {
  return <section><h2>{title}</h2>{children}</section>;
}

function Profile() {
  return <Panel title="Profile"><p>Ada Lovelace</p></Panel>;
}` },
    reviewQuestions: ['Who owns a prop?', 'When is children more useful than a dedicated data prop?'],
    references: [{ label: 'React: Passing props to a component', url: 'https://react.dev/learn/passing-props-to-a-component' }],
  },
  {
    slug: 'conditional-lists-keys', level: 'Basics', title: 'Conditional UI, lists & keys',
    summary: 'Render collections with stable identities and choose UI branches explicitly.',
    explanation: `Use JavaScript conditions to choose what a component returns. Render arrays with map and give sibling elements stable keys from the data. Keys help React match old and new children when items are inserted, removed, or reordered.

An array index is only safe when the list's order and membership never change. With editable or stateful rows, an unstable key can make state appear to move to another item. Keys are local to siblings; they are not passed as an ordinary prop.`,
    example: { language: 'jsx', code: `function Tasks({ tasks }) {
  if (tasks.length === 0) return <p>No tasks yet.</p>;
  return <ul>{tasks.map(task =>
    <li key={task.id}>{task.title}</li>
  )}</ul>;
}` },
    commonMistakes: ['Using Math.random() as a key.', 'Using an array index for a sortable or editable list.'],
    reviewQuestions: ['Why can an index key break an editable list?', 'Where must a key be placed?'],
    references: [{ label: 'React: Rendering lists', url: 'https://react.dev/learn/rendering-lists' }],
  },
  {
    slug: 'events-and-state', level: 'Basics', title: 'Events & useState',
    summary: 'Event handlers request state changes that produce a new render.',
    explanation: `useState gives a component a value and a setter. An event handler can call the setter to request a new render; assigning a local variable or mutating a state object does not notify React. Pass a handler function to an event prop instead of calling it during render.

State is local to a component instance. Prefer the smallest state that represents what users can change; compute derived values during render when possible.`,
    example: { language: 'jsx', code: `import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>
    Count: {count}
  </button>;
}` },
    reviewQuestions: ['Why does assigning to a local variable not update the screen?', 'What happens if you write onClick={setCount(1)}?'],
    references: [{ label: 'React: State, a component’s memory', url: 'https://react.dev/learn/state-a-components-memory' }],
  },
  {
    slug: 'state-snapshots-batching', level: 'Basics', title: 'State snapshots & batching',
    summary: 'Each render sees a snapshot; queued updates may be batched.',
    explanation: `A render captures its own state values and event handlers. Calling a setter does not change the variable in the currently running handler. React queues updates and generally batches updates from the same event before rendering again. If the next value depends on the previous value, pass an updater function.

An old timeout or subscription callback can retain an older render's values. This is a JavaScript closure effect, not a special mutable state variable inside React.`,
    example: { language: 'jsx', code: `function AddThree() {
  const [count, setCount] = useState(0);
  return <button onClick={() => {
    setCount(c => c + 1);
    setCount(c => c + 1);
    setCount(c => c + 1);
  }}>{count}</button>;
}` },
    commonMistakes: ['Expecting a setter to synchronously change a local state variable.', 'Using setCount(count + 1) three times when three increments are intended.'],
    reviewQuestions: ['Why does the example increment by three?', 'What value does a handler log immediately after calling its setter?'],
    references: [{ label: 'React: Queueing a series of state updates', url: 'https://react.dev/learn/queueing-a-series-of-state-updates' }],
  },
  {
    slug: 'immutable-state', level: 'Basics', title: 'Updating objects & arrays in state',
    summary: 'Replace changed values instead of mutating existing state.',
    explanation: `Treat state objects and arrays as immutable snapshots. Create a new object or array for each changed path so React and memoized children can observe the new identity. A spread copy is shallow: nested objects still share references until copied too.

For complex updates, a reducer can centralize the logic. Avoid keeping redundant data in state when it can be calculated from existing state and props.`,
    example: { language: 'jsx', code: `setTasks(tasks => tasks.map(task =>
  task.id === editedId
    ? { ...task, title: newTitle }
    : task
));` },
    reviewQuestions: ['Why is tasks[0].title = newTitle unsafe?', 'What must be copied for a nested update?'],
    references: [{ label: 'React: Updating arrays in state', url: 'https://react.dev/learn/updating-arrays-in-state' }],
  },
  {
    slug: 'controlled-forms', level: 'Basics', title: 'Controlled & uncontrolled inputs',
    summary: 'Choose whether React state or the DOM owns a field’s current value.',
    explanation: `A controlled input receives value (or checked) from React state and updates that state in onChange. This makes validation and dependent UI straightforward. An uncontrolled input keeps its live value in the DOM; use defaultValue or defaultChecked for its initial value and a ref or form submission to read it.

Keep the input's control mode consistent throughout its lifetime. Form correctness also includes labels, validation, submission status, and keyboard behavior.`,
    example: { language: 'jsx', code: `function NameField() {
  const [name, setName] = useState('');
  return <label>Name
    <input value={name} onChange={e => setName(e.target.value)} />
  </label>;
}` },
    reviewQuestions: ['Who owns the current value in a controlled input?', 'When might an uncontrolled input be simpler?'],
    references: [{ label: 'React: input', url: 'https://react.dev/reference/react-dom/components/input' }],
  },
]
