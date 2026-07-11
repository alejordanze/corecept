import type { Concept } from './types'

export const basicConcepts: readonly Concept[] = [
  {
    slug: 'hoisting',
    title: 'Hoisting',
    summary:
      'The JS engine "moves" declarations to the top of their scope before running the code.',
    explanation: `Before executing a scope, JavaScript scans it for declarations and sets them up in memory. Function declarations are fully hoisted (name + body). \`var\` variables are hoisted but initialized to \`undefined\`. \`let\` and \`const\` are hoisted but stay in the "Temporal Dead Zone" — you get a ReferenceError if you touch them before their declaration line.

Understanding hoisting explains why some code works even when it looks out of order, and why other code throws.`,
    keyPoints: [
      'Function declarations: hoisted with body. You can call them before the declaration line.',
      'var: hoisted, initialized to undefined.',
      'let / const: hoisted but in the TDZ until the declaration is evaluated.',
      'Function expressions and arrow functions follow the variable rules of the binding they are assigned to.',
    ],
    useCases: [
      'Debugging code that works with `function foo() {}` but fails after converting it to `const foo = () => {}`.',
      'Understanding why bundlers and modules feel stricter than old script tags.',
    ],
    commonMistakes: [
      'Saying JavaScript literally moves source lines. It does not; declarations are registered before execution.',
      'Expecting `let` and `const` to behave like `var` before their declaration line.',
    ],
    tryIt: [
      'Move each declaration below every call site and predict which lines still run.',
      'Convert the function declaration to a function expression assigned to `var`, then to `const`.',
    ],
    exercise: {
      language: 'javascript',
      title: 'See hoisting in action',
      hint: 'Try converting `var x` to `let x` and re-run — the second log throws.',
      code: `// 1. Function declarations are fully hoisted
sayHi();
function sayHi() {
  console.log("Hello from a hoisted function!");
}

// 2. \`var\` is hoisted but initialized to undefined
console.log("x before declaration:", x);
var x = 10;
console.log("x after declaration:", x);

// 3. \`let\` / \`const\` are in the TDZ
try {
  console.log(y); // ReferenceError
  let y = 5;
} catch (e) {
  console.log("TDZ error:", e.message);
}`,
    },
  },
  {
    slug: 'scope',
    title: 'Scope: global, function, block',
    summary: 'Which parts of the code can see a given identifier.',
    explanation: `JavaScript has three scopes: **global**, **function**, and **block** (introduced with \`let\`/\`const\`).

\`var\` is function-scoped, so it leaks out of \`if\`/\`for\` blocks. \`let\` and \`const\` are block-scoped and behave the way most developers expect.

Inner scopes can read from outer scopes (lexical scoping), but not vice versa. When you look up a name, JS walks outward until it finds the binding or reaches global.`,
    keyPoints: [
      'var is function-scoped; let/const are block-scoped.',
      'Prefer const by default, let when you must reassign, avoid var.',
      'Lookup is lexical: determined by where you write the code, not how it is called.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'Replace `var i` with `let i` and see the difference in the second loop.',
      code: `function scopeDemo() {
  if (true) {
    var a = "var - function scoped";
    let b = "let - block scoped";
    const c = "const - block scoped";
    console.log(a, b, c);
  }
  console.log("outside block, a =", a);
  try { console.log("b =", b); } catch (e) { console.log("b error:", e.message); }
}
scopeDemo();

// var leaks in loops
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var i =", i), 0);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let j =", j), 0);
}`,
    },
  },
  {
    slug: 'closures',
    title: 'Closures',
    summary: 'A function remembers the variables from the scope where it was created.',
    explanation: `A closure is created every time a function is defined. That function keeps a reference to the surrounding variables even after the outer function has returned.

Closures power module patterns, memoization, event handlers with private state, and currying.`,
    keyPoints: [
      'A closure = function + the lexical environment where it was declared.',
      'Great for encapsulating private state without classes.',
      'Watch out for accidental sharing: every closure over `var i` in a loop sees the final value.',
    ],
    useCases: [
      'Event handlers that need access to state from the setup phase.',
      'Factory functions that create specialized helpers, validators, counters, or memoized functions.',
      'Module-level privacy before or alongside class private fields.',
    ],
    commonMistakes: [
      'Thinking a closure copies values. It keeps access to bindings, so later mutations are visible.',
      'Closing over one shared loop variable when each callback needs its own value.',
    ],
    tryIt: [
      'Create two counters from `createCounter` and prove their state is independent.',
      'Replace `let count` with an object and observe how mutating object properties behaves.',
    ],
    exercise: {
      language: 'javascript',
      title: 'Build a private counter',
      hint: 'Notice that `count` cannot be read from outside — only `increment` and `get` can.',
      code: `function createCounter(start = 0) {
  let count = start;
  return {
    increment: () => ++count,
    decrement: () => --count,
    get: () => count,
  };
}

const c = createCounter(10);
c.increment();
c.increment();
c.decrement();
console.log("count is", c.get());
console.log("cannot access count directly:", c.count);`,
    },
  },
  {
    slug: 'objects-references-mutation',
    title: 'Objects, references & mutation',
    summary: 'Objects and arrays are shared by reference; copying them is usually shallow.',
    explanation: `Primitive values such as numbers, strings, booleans, null, and undefined are copied by value. Objects, arrays, functions, Maps, and Sets are handled through references to the same underlying value.

That difference is why one function can accidentally change state owned by another part of the program. It is also why object spread and array spread are useful but not magic: they create shallow copies, so nested objects can still be shared.`,
    keyPoints: [
      'Assigning an object to another variable copies the reference, not the object.',
      'Spread (`{ ...obj }`, `[...arr]`) copies only one level deep.',
      'Immutable updates copy every level along the path being changed.',
      'Mutation is not always wrong; hidden mutation is the real problem.',
    ],
    useCases: [
      'React state updates, Redux reducers, cache updates, and undo/redo history.',
      'Avoiding surprising side effects when passing objects into helper functions.',
      'Understanding why `const` prevents reassignment but not object mutation.',
    ],
    commonMistakes: [
      'Using `{ ...obj }` and assuming nested objects are deeply cloned.',
      'Mutating inputs inside utility functions that callers expect to be safe.',
      'Equating `const user = {}` with an immutable user object.',
    ],
    tryIt: [
      'Change `shallowCopy.owner.name` and explain why the original changes too.',
      'Update the `promoteUser` function to also change a nested `profile.title` safely.',
    ],
    exercise: {
      language: 'javascript',
      title: 'Track shared references',
      hint: 'The first copy shares everything. The immutable update only replaces the changed user.',
      code: `const account = {
  id: "acct_1",
  owner: { name: "Ada" },
  flags: ["beta"],
};

const alias = account;
alias.owner.name = "Grace";
console.log("same object?", alias === account);
console.log("account owner after alias mutation:", account.owner.name);

const shallowCopy = { ...account, flags: [...account.flags] };
shallowCopy.flags.push("admin");
shallowCopy.owner.name = "Linus";
console.log("flags copied?", account.flags, shallowCopy.flags);
console.log("owner still shared?", account.owner.name);

const state = {
  users: [
    { id: "1", name: "Ada", role: "reader" },
    { id: "2", name: "Grace", role: "reader" },
  ],
};

function promoteUser(current, userId) {
  return {
    ...current,
    users: current.users.map((user) =>
      user.id === userId ? { ...user, role: "admin" } : user
    ),
  };
}

const next = promoteUser(state, "1");
console.log("state unchanged:", state.users[0]);
console.log("next state:", next.users[0]);
console.log("unchanged user reused?", state.users[1] === next.users[1]);`,
    },
  },
  {
    slug: 'pure-functions',
    title: 'Pure functions',
    summary: 'Same input → same output, no side effects.',
    explanation: `A **pure function** has two properties: given the same inputs it always returns the same output, and it does not modify anything outside itself (no writes to globals, no I/O, no DOM changes).

Pure functions are easy to test, easy to reason about, and safe to memoize or run in parallel. Impure code is fine — you just want to concentrate it in a few well-known places.`,
    keyPoints: [
      'Deterministic: same input → same output.',
      'No side effects: does not mutate arguments or outside state.',
      'Prefer new objects/arrays over mutating existing ones.',
    ],
    useCases: [
      'Unit tests that do not need a database, DOM, clock, or network.',
      'Reducers, selectors, validators, serializers, and calculations.',
      'Memoization and caching, where the same input must mean the same output.',
    ],
    commonMistakes: [
      'Returning a value but still mutating an argument.',
      'Reading hidden inputs such as `Date.now()`, `Math.random()`, or globals without passing them in.',
      'Trying to make every part of an app pure. I/O belongs at the edges.',
    ],
    tryIt: [
      'Make `addItemPure` return an object with `cart` and `count` without mutating the input.',
      'Add a `removeItemPure` helper and verify the original array is unchanged.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'The pure version returns a new array; the impure one mutates the input.',
      code: `// Impure: mutates the input
function addItemImpure(cart, item) {
  cart.push(item);
  return cart;
}

// Pure: returns a new array
function addItemPure(cart, item) {
  return [...cart, item];
}

const original = ["apple"];

const impureResult = addItemImpure(original, "banana");
console.log("original after impure call:", original);

const original2 = ["apple"];
const pureResult = addItemPure(original2, "banana");
console.log("original after pure call:", original2);
console.log("pure result:", pureResult);`,
    },
  },
  {
    slug: 'callbacks',
    title: 'Callbacks',
    summary: 'A function you pass to another function, to be called later.',
    explanation: `Callbacks are the oldest form of async control flow in JS: pass a function, and the receiver decides when (and if) to call it.

Modern JS prefers Promises and async/await for async work, but callbacks are still everywhere: array methods (\`map\`, \`filter\`), event handlers, timers, Node-style APIs.`,
    keyPoints: [
      'A callback is just a function passed as an argument.',
      'Synchronous callbacks: array methods like map/forEach.',
      'Async callbacks: setTimeout, event listeners, Node fs APIs.',
      'Nesting too many async callbacks is "callback hell" — Promises solve this.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'Change the delay values to see the order flip.',
      code: `function greet(name, callback) {
  const message = "Hello, " + name;
  callback(message);
}

greet("Ada", (msg) => console.log("Sync callback:", msg));

function delayed(ms, cb) {
  setTimeout(() => cb("Fired after " + ms + "ms"), ms);
}

delayed(30, (m) => console.log("Async 1:", m));
delayed(10, (m) => console.log("Async 2:", m));
console.log("This line runs before the async callbacks.");

// Array-method callbacks
const doubled = [1, 2, 3].map((n) => n * 2);
console.log("doubled:", doubled);`,
    },
  },
  {
    slug: 'iife',
    title: 'IIFE (Immediately Invoked Function Expression)',
    summary: 'A function you define and call in one shot to create a private scope.',
    explanation: `An IIFE runs a function right after defining it. Before \`let\`/\`const\` and ES modules existed, IIFEs were the main way to isolate variables from the global scope.

Today they are less common, but you still see them for one-off async blocks, module boundaries in scripts, and quick top-level \`await\` in older environments.`,
    keyPoints: [
      'Syntax: (function () { ... })() or (() => { ... })().',
      'Creates an isolated scope so nothing leaks out.',
      'Modern alternative: an ES module or a block with let/const.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'Try to access `secret` after the IIFE — it is not visible.',
      code: `const version = (() => {
  const major = 1;
  const minor = 4;
  const patch = 2;
  return \`\${major}.\${minor}.\${patch}\`;
})();

console.log("version:", version);

(async () => {
  const value = await Promise.resolve(42);
  console.log("async IIFE result:", value);
})();

// A classic isolation pattern
(function () {
  const secret = "not exposed";
  console.log("inside IIFE, secret =", secret);
})();
try { console.log(secret); } catch (e) { console.log("outside:", e.message); }`,
    },
  },
  {
    slug: 'higher-order-functions',
    title: 'Higher-order functions',
    summary: 'Functions that take or return other functions.',
    explanation: `A higher-order function (HOF) either takes a function as an argument, returns a function, or both. \`map\`, \`filter\`, \`reduce\`, \`debounce\`, and \`Object.keys(...).forEach\` are all higher-order.

HOFs let you extract behavior instead of duplicating code — you describe *what* should happen and pass the *how* as a function.`,
    keyPoints: [
      'Enables composition and reuse.',
      'Array.prototype.map / filter / reduce are canonical examples.',
      'Returning functions enables patterns like currying and partial application.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'Try building a `withTax(rate)` factory the same way `multiplyBy` works.',
      code: `// Function that returns a function
function multiplyBy(factor) {
  return (n) => n * factor;
}

const double = multiplyBy(2);
const triple = multiplyBy(3);
console.log(double(5), triple(5));

// Function that takes a function
function repeat(times, action) {
  for (let i = 0; i < times; i++) action(i);
}

repeat(3, (i) => console.log("iteration", i));

// Array HOFs
const nums = [1, 2, 3, 4, 5];
const sumOfSquaresOfEvens = nums
  .filter((n) => n % 2 === 0)
  .map((n) => n * n)
  .reduce((sum, n) => sum + n, 0);
console.log("result:", sumOfSquaresOfEvens);`,
    },
  },
  {
    slug: 'this',
    title: 'The `this` keyword',
    summary: 'What `this` refers to depends on how the function is called, not where it is defined.',
    explanation: `In non-strict code \`this\` is the global object; in strict mode and modules it defaults to \`undefined\`. When called as \`obj.method()\`, \`this\` is \`obj\`. With \`new\`, it is the newly created instance. With \`call\`/\`apply\`/\`bind\`, you set it explicitly.

Arrow functions are the exception: they capture \`this\` from the enclosing lexical scope and cannot be rebound.`,
    keyPoints: [
      'Regular function: `this` depends on the call site.',
      'Arrow function: `this` is inherited lexically — safe inside callbacks.',
      'Class methods lose `this` when detached — use `bind` or arrow class fields.',
    ],
    useCases: [
      'Class methods passed as callbacks to event handlers, timers, or array helpers.',
      'Object methods that are reused with `call`, `apply`, or `bind`.',
      'Framework code where callback ownership changes between declaration and execution.',
    ],
    commonMistakes: [
      'Using an arrow function as an object method and expecting `this` to be the object.',
      'Detaching a method with `const fn = obj.method` and expecting it to remember the object.',
      'Using `this` inside nested regular functions when an arrow callback would be clearer.',
    ],
    tryIt: [
      'Assign `const greet = user.greetRegular` and call it. Then fix it with `bind`.',
      'Replace the timer arrow callback with a regular function and compare the output.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'Replace the arrow with a `function () {}` inside setTimeout to see it break.',
      code: `const user = {
  name: "Grace",
  greetRegular: function () {
    return "Hi, I'm " + this.name;
  },
  greetArrow: () => "Hi, I'm " + this.name, // \`this\` is the outer scope!
};
console.log(user.greetRegular());
console.log(user.greetArrow());

// call / apply / bind
function whoAmI(prefix, punctuation) {
  return prefix + " " + this.name + punctuation;
}
// call: args passed one-by-one
console.log(whoAmI.call({ name: "Ada" }, "Hello", "!"));
// apply: args passed as an array (handy when you already have an array)
console.log(whoAmI.apply({ name: "Grace" }, ["Hi", "."]));
// bind: returns a NEW function with \`this\` (and optional args) fixed
const bound = whoAmI.bind({ name: "Linus" }, "Hey");
console.log(bound("?"));

// Arrow captures \`this\` lexically — great for setTimeout inside a method
const timer = {
  seconds: 0,
  start() {
    setTimeout(() => {
      this.seconds++;
      console.log("elapsed:", this.seconds);
    }, 0);
  },
};
timer.start();`,
    },
  },
  {
    slug: 'prototypes',
    title: 'Prototypes and inheritance',
    summary: 'Every object has a hidden link to another object it inherits from.',
    explanation: `Every JS object has an internal reference called \`[[Prototype]]\` (accessible via \`Object.getPrototypeOf\`). When you access a property that does not exist on the object itself, JS walks up the prototype chain until it finds it or reaches \`null\`.

Class syntax is a friendly wrapper: \`class Dog extends Animal\` is prototype-based inheritance under the hood.`,
    keyPoints: [
      'Property lookup walks the prototype chain.',
      'Object.create(proto) makes a new object with a specific prototype.',
      'class/extends is syntactic sugar over prototypes.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'Add a method to Animal.prototype and see Dog inherit it automatically.',
      code: `const animal = {
  eat() {
    return this.name + " is eating";
  },
};

const dog = Object.create(animal);
dog.name = "Rex";
dog.bark = function () {
  return this.name + " says woof";
};

console.log(dog.eat());
console.log(dog.bark());
console.log("dog's prototype is animal?", Object.getPrototypeOf(dog) === animal);

// Class syntax uses prototypes under the hood
class Animal {
  constructor(name) { this.name = name; }
  eat() { return this.name + " is eating"; }
}
class Cat extends Animal {
  purr() { return this.name + " purrs"; }
}
const c = new Cat("Whiskers");
console.log(c.eat(), "-", c.purr());`,
    },
  },
  {
    slug: 'destructuring-rest-spread',
    title: 'Destructuring, rest & spread',
    summary: 'Pull values out of arrays/objects, collect leftovers, and copy or merge values.',
    explanation: `Destructuring reads values from a known shape. Rest collects the remaining values into a new array or object. Spread expands an iterable or object into another call, array, or object.

These features make everyday code shorter, but they also hide important details: object spread is shallow, later properties overwrite earlier ones, and destructuring defaults only apply when the value is undefined.`,
    keyPoints: [
      'Destructuring reads from arrays and objects by position or property name.',
      'Rest (`...rest`) collects what was not already taken.',
      'Spread (`...value`) expands values into arrays, calls, or objects.',
      'In object spread, later properties win.',
    ],
    useCases: [
      'Reading API response objects without repetitive `response.data.user.name` access.',
      'Creating configuration objects from defaults plus overrides.',
      'Removing sensitive fields before returning an object from an API handler.',
    ],
    commonMistakes: [
      'Confusing rest and spread because both use `...`.',
      'Expecting default values to apply for `null`; they only apply for `undefined`.',
      'Forgetting that `{ ...defaults, ...overrides }` and `{ ...overrides, ...defaults }` produce different results.',
    ],
    tryIt: [
      'Swap the spread order in `prodConfig` and explain why `timeoutMs` changes.',
      'Set `roles` to `null` in the response and compare it with a missing `roles` property.',
    ],
    exercise: {
      language: 'javascript',
      title: 'Unpack and safely reshape data',
      hint: 'Change the spread order in `prodConfig` to see which values win.',
      code: `const response = {
  data: {
    user: {
      id: "u1",
      name: "Ada",
      roles: ["admin", "editor"],
      passwordHash: "hidden",
    },
  },
  meta: { requestId: "req_123" },
};

const {
  data: {
    user: { name, roles = [] },
  },
  meta: { requestId },
} = response;

console.log("user:", name);
console.log("roles:", roles.join(", "));
console.log("request:", requestId);

const defaults = { retries: 2, timeoutMs: 1000, cache: true };
const prodConfig = { ...defaults, timeoutMs: 3000 };
console.log("config:", prodConfig);

const {
  passwordHash,
  ...publicUser
} = response.data.user;
console.log("safe user:", publicUser);
console.log("removed sensitive value?", passwordHash !== undefined);

function labelScores(label, ...scores) {
  const total = scores.reduce((sum, score) => sum + score, 0);
  return \`\${label}: \${total}\`;
}
console.log(labelScores("week", 10, 20, 30));`,
    },
  },
  {
    slug: 'type-coercion',
    title: 'Type coercion & equality',
    summary: 'JavaScript will happily convert types. Understand it or be surprised by it.',
    explanation: `\`==\` converts operands to a common type before comparing (loose equality). \`===\` compares without conversion (strict equality). Prefer \`===\` — the rules for \`==\` are subtle and cause bugs.

Coercion also happens with \`+\` (string concat vs numeric add), truthy/falsy checks in \`if\`, and template literals.`,
    keyPoints: [
      'Use === and !== by default.',
      'Falsy values: false, 0, -0, 0n, "", null, undefined, NaN. Everything else is truthy.',
      '"5" + 1 = "51", but "5" - 1 = 4.',
      'Number(null) === 0 but Number(undefined) is NaN.',
    ],
    useCases: [
      'Parsing form values, URL params, localStorage data, and API payloads.',
      'Writing guards where `0`, empty string, and `false` are valid values.',
      'Debugging UI bugs caused by loose equality or accidental string concatenation.',
    ],
    commonMistakes: [
      'Using `if (value)` when `0` or empty string should be accepted.',
      'Mixing numbers and strings with `+` without converting explicitly.',
      'Relying on `==` except for the deliberate `value == null` null-or-undefined check.',
    ],
    tryIt: [
      'Replace `v ? "truthy" : "falsy"` with explicit checks for `null` and `undefined`.',
      'Convert each string to a number with `Number(...)` before using `+`.',
    ],
    exercise: {
      language: 'javascript',
      hint: 'Predict each result before running.',
      code: `console.log(0 == false);        // ?
console.log("" == false);       // ?
console.log(null == undefined); // ?
console.log(null == 0);         // ?
console.log(1 == "1");          // ?
console.log(1 === "1");         // ?

// The + operator
console.log("5" + 1);           // ?
console.log("5" - 1);           // ?
console.log([] + []);           // ?
console.log([] + {});           // ?

// Falsy check
for (const v of [0, "", null, undefined, NaN, false, "hi", 42, [], {}]) {
  console.log(JSON.stringify(v), "→", v ? "truthy" : "falsy");
}`,
    },
  },
]
