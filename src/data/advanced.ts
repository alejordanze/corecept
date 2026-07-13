import type { Concept } from './types'

export const advancedConcepts: readonly Concept[] = [
  {
    slug: 'event-loop',
    title: 'Event loop, microtasks & macrotasks',
    summary:
      'How JS runs async code on a single thread — and why Promises resolve before setTimeout.',
    explanation: `JavaScript is single-threaded. The runtime keeps a call stack, a **task queue** (macrotasks: setTimeout, setInterval, I/O, UI events), and a **microtask queue** (Promises, queueMicrotask, MutationObserver).

After each task, the engine drains **all** pending microtasks before picking the next macrotask. That is why a resolved Promise callback runs before a \`setTimeout(fn, 0)\` scheduled at the same time.

Understanding this is the difference between "it works most of the time" and "I know exactly why the log order is what it is."`,
    keyPoints: [
      'One call stack, one main thread.',
      'Microtasks (Promises, queueMicrotask) run before the next macrotask.',
      'setTimeout(fn, 0) does not mean "run now" — it means "queue as a macrotask".',
      'Blocking the stack blocks everything, including UI updates.',
    ],
    useCases: [
      'Understanding why UI state updates, Promise callbacks, and timers appear in surprising order.',
      'Debugging race conditions between event handlers, fetch callbacks, and rendering work.',
      'Knowing why CPU-heavy loops freeze the page even when async code is scheduled.',
    ],
    commonMistakes: [
      'Assuming `setTimeout(fn, 0)` runs before already-settled Promise callbacks.',
      'Creating endless microtasks and starving rendering or timers.',
      'Calling expensive synchronous work "async" just because it starts inside a callback.',
    ],
    tryIt: [
      'Add another `queueMicrotask` inside the first `.then()` and predict the order.',
      'Insert a CPU-heavy loop before `script end` and watch every async log get delayed.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'Predict the exact log order before hitting Run.',
      code: `console.log("1: script start");

setTimeout(() => console.log("2: setTimeout (macrotask)"), 0);

Promise.resolve()
  .then(() => console.log("3: promise then #1 (microtask)"))
  .then(() => console.log("4: promise then #2 (microtask)"));

queueMicrotask(() => console.log("5: queueMicrotask"));

console.log("6: script end");`,
    },
  },
  {
    slug: 'promises',
    title: 'Promises',
    summary: 'A placeholder for a value that will exist later — with success and failure branches.',
    explanation: `A Promise represents an eventual value. It is in one of three states: **pending**, **fulfilled**, or **rejected**. Once settled, it cannot change.

Promises compose with \`.then\`, \`.catch\`, \`.finally\`. Static helpers \`Promise.all\`, \`Promise.race\`, \`Promise.allSettled\`, and \`Promise.any\` combine multiple promises with different semantics.

Rules of thumb: always return the promise inside .then, always handle rejections.`,
    keyPoints: [
      'Promise.all: rejects fast on the first failure.',
      'Promise.allSettled: waits for all, returns { status, value | reason }.',
      'Promise.race: first to settle wins (success or failure).',
      'Promise.any: first fulfilled wins; rejects only if all reject.',
    ],
    useCases: [
      'Coordinating API calls that can run independently.',
      'Building fallbacks: fastest mirror wins, first successful provider wins, or all results are reported.',
      'Normalizing callback-based async APIs into composable values.',
    ],
    commonMistakes: [
      'Forgetting to return a Promise from inside `.then()`, causing the next step to run too early.',
      'Using `Promise.all` when partial success should still be displayed.',
      'Handling success but leaving rejection paths unobserved.',
    ],
    tryIt: [
      'Add one failing promise to `Promise.all` and compare it with `Promise.allSettled`.',
      'Change the delays in `Promise.race` so the slow task wins.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'Switch Promise.all → Promise.allSettled to see how errors are handled differently.',
      code: `const wait = (ms, value) => new Promise((r) => setTimeout(() => r(value), ms));
const fail = (ms, reason) => new Promise((_, rej) => setTimeout(() => rej(new Error(reason)), ms));

try {
  const [a, b, c] = await Promise.all([wait(10, "A"), wait(20, "B"), wait(15, "C")]);
  console.log("all:", a, b, c);
} catch (e) {
  console.log("all rejected:", e.message);
}

const settled = await Promise.allSettled([wait(10, "ok"), fail(20, "boom")]);
console.log("allSettled:", settled.map((s) => \`\${s.status}:\${s.value ?? s.reason.message}\`).join(" | "));

const winner = await Promise.race([wait(30, "slow"), wait(10, "fast")]);
console.log("race winner:", winner);

// Promise.any — first *fulfilled* wins; failures are ignored unless ALL fail
const anyOk = await Promise.any([fail(10, "x"), wait(20, "backup"), fail(5, "y")]);
console.log("any (some succeed):", anyOk);

// If every promise rejects, Promise.any throws an AggregateError
try {
  await Promise.any([fail(10, "db down"), fail(20, "cache down"), fail(15, "cdn down")]);
} catch (e) {
  console.log("any (all rejected):", e.name, "-", e.errors.map((x) => x.message).join(", "));
}`,
    },
  },
  {
    slug: 'async-await',
    title: 'async / await',
    summary: 'Syntactic sugar over promises that reads like synchronous code.',
    explanation: `An \`async\` function always returns a Promise. Inside it, \`await\` pauses execution until the awaited value settles, then resumes. Errors propagate through \`throw\` and can be caught with try/catch.

Under the hood there is no thread and nothing is "blocking" — the async function is suspended and the event loop keeps running.

Sequential awaits are easy to read but slow when the operations are independent — parallelize with \`Promise.all\`.`,
    keyPoints: [
      'async fn always returns a Promise.',
      'await unwraps a Promise into its value (or throws its rejection).',
      'Sequential awaits = slow when things could run in parallel.',
      'Use Promise.all for independent work.',
    ],
    useCases: [
      'Loading data before rendering a screen or responding to a request.',
      'Keeping failure handling close to the async operation with `try` / `catch`.',
      'Making dependent async workflows readable without deeply nested callbacks.',
    ],
    commonMistakes: [
      'Awaiting independent requests one-by-one instead of starting them together.',
      'Using `await` inside `forEach`; use `for...of` for sequence or `Promise.all` for parallel work.',
      'Catching an error and then silently continuing with invalid state.',
    ],
    tryIt: [
      'Add a third independent wait and include it in the `Promise.all` version.',
      'Rewrite a small `forEach(async ...)` example using `for...of` and compare the order.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'Compare the reported times — parallel is ~half the sequential total.',
      code: `const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));

// Slow: sequential awaits
const t1 = performance.now();
const a1 = await wait(80, "one");
const b1 = await wait(80, "two");
console.log("sequential:", a1, b1, "in", (performance.now() - t1).toFixed(0), "ms");

// Fast: parallel with Promise.all
const t2 = performance.now();
const [a2, b2] = await Promise.all([wait(80, "one"), wait(80, "two")]);
console.log("parallel:  ", a2, b2, "in", (performance.now() - t2).toFixed(0), "ms");

// Error handling with try/catch
async function risky() { throw new Error("nope"); }
try { await risky(); } catch (e) { console.log("caught:", e.message); }`,
    },
  },
  {
    slug: 'abort-controller-cancellation',
    title: 'AbortController & cancellation',
    summary: 'Cancel async work that is no longer needed before it updates stale state.',
    explanation: `Promises do not have built-in cancellation. The common web-platform pattern is \`AbortController\`: create a controller, pass its \`signal\` into the operation, and call \`abort()\` when the result is no longer useful.

This matters in real apps. A user can type a new search query before the old request finishes, navigate away before a fetch resolves, or close a component while timers are still pending. Cancellation makes those stale operations explicit.`,
    keyPoints: [
      '`AbortController` creates a `signal` that async APIs can observe.',
      'Calling `abort()` does not magically stop any Promise; the async operation must listen to the signal.',
      'Treat aborts differently from real failures when showing errors to users.',
      'Clean up abort listeners after the operation settles.',
    ],
    useCases: [
      'Canceling stale search requests when the user keeps typing.',
      'Cleaning up fetches inside component unmount handlers.',
      'Adding timeouts or manual cancel buttons around long-running work.',
    ],
    commonMistakes: [
      'Creating a controller but forgetting to pass `controller.signal` to the async operation.',
      'Showing an error toast for an intentional abort.',
      'Assuming every Promise-based library supports `AbortSignal` automatically.',
    ],
    tryIt: [
      'Change the abort delay from 30ms to 120ms and watch the request succeed.',
      'Start two requests and abort only one of their controllers.',
    ],
    exercise: {
      language: 'typescript',
      title: 'Cancel a stale request',
      hint: 'Move `controller.abort()` later than 80ms and the same request succeeds.',
      code: `type User = { id: string; name: string };

function fetchUser(id: string, options: { signal?: AbortSignal } = {}): Promise<User> {
  const { signal } = options;

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Already aborted", "AbortError"));
      return;
    }

    const timer = setTimeout(() => {
      resolve({ id, name: "Ada" });
    }, 80);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Request canceled", "AbortError"));
      },
      { once: true }
    );
  });
}

const controller = new AbortController();
const request = fetchUser("42", { signal: controller.signal });

setTimeout(() => controller.abort(), 30);

try {
  console.log("user:", await request);
} catch (e) {
  if (e instanceof DOMException && e.name === "AbortError") {
    console.log("ignored stale request:", e.message);
  } else {
    console.log("real failure:", e);
  }
}

console.log("fresh request:", await fetchUser("7"));`,
    },
  },
  {
    slug: 'generators-iterators',
    title: 'Generators & iterators',
    summary: 'Pausable functions that produce a sequence of values on demand.',
    explanation: `An **iterator** is any object with a \`next()\` method returning \`{ value, done }\`. An **iterable** implements \`Symbol.iterator\`. Arrays, Strings, Maps, Sets and DOM node lists are iterable.

A **generator function** (\`function*\`) creates iterators without the boilerplate. \`yield\` pauses the function and returns the next value. This is how you build lazy sequences, infinite streams, or custom iteration.`,
    keyPoints: [
      'function* + yield defines a generator.',
      'Generators are lazy — nothing runs until you call .next() or use for..of.',
      'yield* delegates to another iterable.',
      'Great for infinite sequences and pull-based streams.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'Replace `take(5)` with `take(20)` in the Fibonacci example.',
      code: `function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) yield i;
}

console.log([...range(0, 5)]);
for (const n of range(10, 20, 3)) console.log("n =", n);

// Infinite generator + take helper
function* fib() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

function take(iter, n) {
  const out = [];
  for (const v of iter) {
    if (out.length >= n) break;
    out.push(v);
  }
  return out;
}

console.log("first 10 fibs:", take(fib(), 10));`,
    },
  },
  {
    slug: 'currying',
    title: 'Currying & partial application',
    summary: 'Transform an n-argument function into a chain of single-argument functions.',
    explanation: `**Currying** turns \`f(a, b, c)\` into \`f(a)(b)(c)\`. **Partial application** fixes some arguments now and returns a function expecting the rest.

Both patterns exploit closures. They shine when composing pipelines, building configurable helpers, and adapting functions to fit callback shapes.`,
    keyPoints: [
      'Currying: one argument per call, always returns a function until all are supplied.',
      'Partial application: pre-fill some arguments, return a function for the rest.',
      'Useful for building specialized helpers from generic ones.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'Build `add5 = curry(add)(5)` and reuse it multiple times.',
      code: `// Generic curry
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...next) => curried.apply(this, [...args, ...next]);
  };
}

const add = (a, b, c) => a + b + c;
const cAdd = curry(add);

console.log(cAdd(1, 2, 3));
console.log(cAdd(1)(2)(3));
console.log(cAdd(1, 2)(3));

// Partial application (bind is one way to do it)
const greet = (greeting, name) => \`\${greeting}, \${name}!\`;
const sayHello = greet.bind(null, "Hello");
console.log(sayHello("Ada"));
console.log(sayHello("Linus"));`,
    },
  },
  {
    slug: 'debounce-throttle',
    title: 'Debounce & throttle',
    summary: 'Two ways to rate-limit function calls — with very different semantics.',
    explanation: `**Debounce**: wait until the calls stop coming for N ms, then fire once. Perfect for "on stop typing" scenarios like search-as-you-type.

**Throttle**: fire at most once every N ms. Perfect for scroll/resize/mousemove where you want steady updates but not one per event.

Both are built on closures + timers. Getting them right (leading vs trailing edge, cancelation) is a classic interview question.`,
    keyPoints: [
      'Debounce = "fire when quiet".',
      'Throttle = "fire at most every N ms".',
      'Beware of memory leaks: clear timers when the component unmounts.',
    ],
    useCases: [
      'Debounce search inputs, autosave, resize-final calculations, and validation after typing.',
      'Throttle scroll, resize, pointer movement, and progress updates.',
      'Protecting expensive UI work from firing on every high-frequency event.',
    ],
    commonMistakes: [
      'Using debounce for scroll tracking when steady updates are required.',
      'Forgetting to cancel pending debounced work when a component unmounts.',
      'Creating a new debounced function on every render, which resets its timer every time.',
    ],
    tryIt: [
      'Change the simulated calls from 10ms apart to 60ms apart and compare the logs.',
      'Add a `.cancel()` method to the debounce helper.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'Increase the interval or delay values and observe the timing.',
      code: `function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function throttle(fn, interval) {
  let last = 0;
  return (...args) => {
    const now = performance.now();
    if (now - last >= interval) {
      last = now;
      fn(...args);
    }
  };
}

const logD = debounce((v) => console.log("debounced:", v), 40);
const logT = throttle((v) => console.log("throttled:", v), 40);

// Simulate 6 rapid calls
for (let i = 0; i < 6; i++) {
  setTimeout(() => { logD(i); logT(i); }, i * 10);
}

// Give the debounce a chance to fire
await new Promise((r) => setTimeout(r, 120));`,
    },
  },
  {
    slug: 'memoization',
    title: 'Memoization',
    summary: 'Cache the result of a function so repeated calls with the same input are free.',
    explanation: `Memoization is a specific form of caching: store the output of a **pure** function keyed by its inputs, and short-circuit future calls.

React's \`useMemo\`, \`memo\`, and \`useCallback\` are the same idea applied to components and callbacks. Memoization is only safe on pure functions — otherwise you cache side effects.`,
    keyPoints: [
      'Only safe on pure functions.',
      'Key by all inputs — for object/array inputs use a stable serialization or WeakMap.',
      'Beware unbounded caches — consider an LRU for long-running apps.',
    ],
    useCases: [
      'Caching expensive pure calculations, derived data, selectors, and parser results.',
      'Avoiding repeated work when the same inputs appear many times.',
      'Understanding React `useMemo`, `useCallback`, and `memo` trade-offs.',
    ],
    commonMistakes: [
      'Memoizing impure functions that read time, random values, globals, or mutate inputs.',
      'Using `JSON.stringify(args)` for keys when argument order, functions, Dates, or cyclic objects matter.',
      'Keeping a cache forever in a long-running app.',
    ],
    tryIt: [
      'Log cache hits and misses inside `memoize`.',
      'Call `fastFib(30)` twice and compare the second runtime.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'Remove the memoization and re-run — the naive Fibonacci becomes exponentially slower.',
      code: `function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Slow naive Fibonacci
function slowFib(n) {
  if (n < 2) return n;
  return slowFib(n - 1) + slowFib(n - 2);
}

// Memoized version
const fastFib = memoize(function f(n) {
  if (n < 2) return n;
  return fastFib(n - 1) + fastFib(n - 2);
});

const t1 = performance.now();
slowFib(30);
console.log("slow  fib(30) in", (performance.now() - t1).toFixed(1), "ms");

const t2 = performance.now();
fastFib(30);
console.log("fast  fib(30) in", (performance.now() - t2).toFixed(1), "ms");`,
    },
  },
  {
    slug: 'proxy-reflect',
    title: 'Proxy & Reflect',
    summary: 'Intercept and customize fundamental operations on an object.',
    explanation: `A **Proxy** wraps a target object and lets you define "traps" for operations like reading a property, setting a property, iterating keys, calling as a function, etc.

**Reflect** is the standard set of default operations you can call from inside a trap to keep behavior consistent.

Frameworks like Vue's reactivity system and MobX use Proxies to know when your data changes.`,
    keyPoints: [
      'Traps: get, set, has, deleteProperty, apply, construct, ownKeys, and more.',
      'Reflect.<op>() performs the default operation — pair with a Proxy trap.',
      'Great for logging, validation, reactive systems, virtual objects.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'Add a trap for `has` and test it with the `in` operator.',
      code: `const user = { name: "Ada", age: 36 };

const logged = new Proxy(user, {
  get(target, prop, receiver) {
    console.log(\`  READ  \${String(prop)}\`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(\`  WRITE \${String(prop)} = \${value}\`);
    return Reflect.set(target, prop, value, receiver);
  },
});

console.log("name:", logged.name);
logged.age = 37;
console.log("age:", logged.age);

// Validation proxy
const positive = new Proxy({}, {
  set(t, k, v) {
    if (typeof v !== "number" || v < 0) {
      throw new TypeError(\`\${String(k)} must be a positive number\`);
    }
    return Reflect.set(t, k, v);
  },
});

positive.x = 10;
try { positive.y = -1; } catch (e) { console.log("blocked:", e.message); }`,
    },
  },
  {
    slug: 'ts-generics',
    title: 'TypeScript: generics',
    summary: 'Types with parameters — reusable and precise.',
    explanation: `Generics let you write functions and types that work with many types without losing information. The generic parameter is like a variable in the type system.

Constraints (\`T extends ...\`) narrow what \`T\` can be. Default type parameters (\`T = string\`) give sensible fallbacks.`,
    keyPoints: [
      '<T> is a type parameter. Prefer meaningful names when there is more than one.',
      'Use extends to constrain: <T extends { id: string }>.',
      'Generics are erased at runtime — they only exist for type checking.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Change the return type of `first` to see the inference update.',
      code: `function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const n = first([1, 2, 3]);       // number | undefined
const s = first(["a", "b"]);      // string | undefined
console.log(n, s);

// Constraint
interface WithId { id: string }
function byId<T extends WithId>(items: T[], id: string): T | undefined {
  return items.find((x) => x.id === id);
}
const users = [{ id: "1", name: "Ada" }, { id: "2", name: "Linus" }];
console.log(byId(users, "2"));

// Multiple generics
function zip<A, B>(a: A[], b: B[]): [A, B][] {
  const len = Math.min(a.length, b.length);
  const out: [A, B][] = [];
  for (let i = 0; i < len; i++) out.push([a[i], b[i]]);
  return out;
}
console.log(zip([1, 2, 3], ["a", "b", "c"]));`,
    },
  },
  {
    slug: 'ts-utility-types',
    title: 'TypeScript: utility types',
    summary: 'Built-in generics that transform other types.',
    explanation: `TypeScript ships a set of type-level helpers you should know by heart: \`Partial\`, \`Required\`, \`Readonly\`, \`Pick\`, \`Omit\`, \`Record\`, \`Exclude\`, \`Extract\`, \`ReturnType\`, \`Parameters\`, \`Awaited\`, and \`NonNullable\`.

Learn what they mean and you rarely need to write custom mapped types.`,
    keyPoints: [
      'Partial<T>: all keys optional. Required<T>: all keys required.',
      'Pick<T, K>: keep listed keys. Omit<T, K>: drop listed keys.',
      'Record<K, V>: object with keys of K and values of V.',
      'ReturnType<F> / Parameters<F> / Awaited<P>: introspect functions and promises.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Sucrase only strips types — the log statements verify runtime behavior.',
      code: `interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
}

type NewUser = Omit<User, "id">;
type UserPreview = Pick<User, "id" | "name">;
type UserPatch = Partial<User>;
type UserMap = Record<string, User>;

const patch: UserPatch = { name: "Ada updated" };
console.log("patch:", patch);

const preview: UserPreview = { id: "1", name: "Ada" };
console.log("preview:", preview);

const map: UserMap = {
  "1": { id: "1", name: "Ada", email: "ada@x.io" },
};
console.log("map:", map);

// ReturnType and Parameters
function makeUser(name: string, age: number) {
  return { id: crypto.randomUUID(), name, age };
}
type Made = ReturnType<typeof makeUser>;
type Args = Parameters<typeof makeUser>;
const args: Args = ["Grace", 40];
const made: Made = makeUser(...args);
console.log("made:", made);`,
    },
  },
  {
    slug: 'ts-conditional-mapped-types',
    title: 'TypeScript: conditional & mapped types',
    summary: 'The building blocks behind most utility types.',
    explanation: `A **mapped type** iterates over the keys of another type: \`{ [K in keyof T]: ... }\`. A **conditional type** picks a branch based on assignability: \`T extends U ? X : Y\`.

Combined with \`infer\` you can extract nested types (arguments, return values, awaited types, tuple elements, etc.).`,
    keyPoints: [
      '{ [K in keyof T]: ... } is a mapped type.',
      'T extends U ? X : Y is a conditional type.',
      '`infer` inside a conditional captures a nested type.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Try adding a "MyRequired<T>" that flips optional to required.',
      code: `// Roll our own Partial
type MyPartial<T> = { [K in keyof T]?: T[K] };

// Roll our own ReturnType using infer
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;

interface Point { x: number; y: number }
const p: MyPartial<Point> = { x: 3 };
console.log("partial point:", p);

function makePoint(x: number, y: number) { return { x, y }; }
type Made = MyReturnType<typeof makePoint>;
const point: Made = makePoint(1, 2);
console.log("made point:", point);

// Distributive conditional
type NonNil<T> = T extends null | undefined ? never : T;
const value: NonNil<string | null | undefined> = "hello";
console.log("value:", value);`,
    },
  },
]
