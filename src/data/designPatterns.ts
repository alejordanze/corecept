import type { Concept } from './types'

export const designPatterns: readonly Concept[] = [
  {
    slug: 'singleton',
    title: 'Singleton',
    summary: 'Ensure a class has only one instance and provide a global access point.',
    explanation: `The Singleton pattern guarantees one — and only one — instance of a class exists in the process. Any request for the instance returns the same object.

Handy for logger, config, or connection pool objects. Overused, it becomes a hidden global with all the testing pain that implies.`,
    keyPoints: [
      'One instance for the whole process.',
      'Prefer dependency injection over reaching for a singleton in the middle of your code.',
      'Beware in server-side rendering / multi-tenant environments — singletons can leak state.',
    ],
    useCases: [
      'Process-wide configuration, logger instances, and shared connection pools.',
      'Expensive resources that should be initialized once and reused deliberately.',
      'Legacy APIs that require global coordination, wrapped behind a small boundary.',
    ],
    commonMistakes: [
      'Using a singleton as hidden mutable global state.',
      'Making tests order-dependent because one test leaves singleton state behind.',
      'Sharing user-specific data in a server process singleton.',
    ],
    tryIt: [
      'Add a `resetForTest()` method and consider why production code should not call it.',
      'Rewrite the example so `Config` is injected into a function instead of fetched globally.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Try to create two Configs — both references point to the same instance.',
      code: `class Config {
  private static instance: Config | null = null;
  private data = new Map<string, string>();

  private constructor() {}

  static getInstance(): Config {
    if (!Config.instance) Config.instance = new Config();
    return Config.instance;
  }
  set(k: string, v: string) { this.data.set(k, v); return this; }
  get(k: string) { return this.data.get(k); }
}

const a = Config.getInstance();
a.set("apiUrl", "https://api.example.com");

const b = Config.getInstance();
console.log("same instance?", a === b);
console.log("value from b:", b.get("apiUrl"));`,
    },
  },
  {
    slug: 'factory',
    title: 'Factory',
    summary: 'Delegate object creation to a dedicated function or class.',
    explanation: `Instead of \`new SomeClass()\` sprinkled everywhere, a factory centralizes construction. Callers ask for "an X" and the factory decides which concrete type to hand back and how to configure it.

Useful when you have several variants selected at runtime, when construction is non-trivial, or when you want to hide the concrete class from callers.`,
    keyPoints: [
      'Isolates the "which class do we build" decision.',
      'Callers depend on an abstraction, not the concrete type.',
      'Simpler cousins: factory function, static factory method.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Add a new notification kind — you only touch the factory.',
      code: `interface Notification { send(msg: string): void }
class EmailNotification implements Notification { send(m: string) { console.log("email:", m); } }
class SmsNotification   implements Notification { send(m: string) { console.log("sms  :", m); } }
class PushNotification  implements Notification { send(m: string) { console.log("push :", m); } }

type Kind = "email" | "sms" | "push";

function createNotification(kind: Kind): Notification {
  switch (kind) {
    case "email": return new EmailNotification();
    case "sms":   return new SmsNotification();
    case "push":  return new PushNotification();
  }
}

for (const kind of ["email", "sms", "push"] as Kind[]) {
  createNotification(kind).send("Hi there!");
}`,
    },
  },
  {
    slug: 'builder',
    title: 'Builder',
    summary: 'Assemble a complex object step-by-step with a fluent interface.',
    explanation: `Builders are useful when constructing an object requires many optional parameters or a specific sequence of steps. Instead of a giant constructor, you chain small, named calls.

Modern alternative: a plain factory that takes an options object. Use a Builder when the construction really is stepwise (SQL query builder, test data builder, DSL).`,
    keyPoints: [
      'Fluent chaining: builder.withA(...).withB(...).build().',
      'Great for optional/complex config.',
      'Consider an options object first — builders are heavier.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Extend the builder with `.where("id", "=", 1)`.',
      code: `interface Query { table: string; columns: string[]; limit?: number; orderBy?: string }

class QueryBuilder {
  private q: Query = { table: "", columns: ["*"] };

  from(table: string)          { this.q.table = table; return this; }
  select(...cols: string[])    { this.q.columns = cols.length ? cols : ["*"]; return this; }
  limit(n: number)             { this.q.limit = n; return this; }
  orderBy(field: string)       { this.q.orderBy = field; return this; }
  build(): string {
    const cols  = this.q.columns.join(", ");
    const parts = [\`SELECT \${cols} FROM \${this.q.table}\`];
    if (this.q.orderBy) parts.push(\`ORDER BY \${this.q.orderBy}\`);
    if (this.q.limit)   parts.push(\`LIMIT \${this.q.limit}\`);
    return parts.join(" ");
  }
}

const sql = new QueryBuilder()
  .from("users")
  .select("id", "name", "email")
  .orderBy("created_at")
  .limit(10)
  .build();

console.log(sql);`,
    },
  },
  {
    slug: 'observer',
    title: 'Observer',
    summary: 'Notify many listeners when a subject changes.',
    explanation: `The Observer pattern (aka pub/sub) lets a subject broadcast changes to any number of observers, without knowing who they are or what they do.

You use it every day: DOM events, EventEmitter in Node, RxJS Subjects, Vue reactivity, Zustand/Redux stores.`,
    keyPoints: [
      'Decouples the source of events from the reactions.',
      'Return an unsubscribe function to avoid leaks.',
      'Errors in one observer should not break the others.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Call `unsubscribe()` to detach an observer.',
      code: `type Listener<T> = (value: T) => void;

class Observable<T> {
  private listeners = new Set<Listener<T>>();

  subscribe(fn: Listener<T>): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(value: T) {
    for (const l of this.listeners) {
      try { l(value); } catch (e) { console.error("listener failed:", (e as Error).message); }
    }
  }
}

const clicks = new Observable<number>();
const off1 = clicks.subscribe((n) => console.log("listener A got", n));
const off2 = clicks.subscribe((n) => console.log("listener B got", n));

clicks.emit(1);
off1();
clicks.emit(2);
off2();
clicks.emit(3);
console.log("no listeners left");`,
    },
  },
  {
    slug: 'strategy',
    title: 'Strategy',
    summary: 'Encapsulate interchangeable algorithms behind a common interface.',
    explanation: `Strategy replaces a big \`if/else\` on "how to do X" with a set of small classes/functions each implementing the same shape. The caller picks one and delegates.

It is the go-to answer for "the algorithm/rule/logic varies at runtime" (sorting rules, pricing rules, tax rules, validation rules).`,
    keyPoints: [
      'Same interface, different implementations.',
      'Selected at runtime by the caller.',
      'Often collapsible to a plain function when there is no state.',
    ],
    useCases: [
      'Pricing, discount, tax, sorting, validation, authentication, and retry rules.',
      'Replacing `if/else` branches that select one of several algorithms.',
      'Testing each algorithm independently from the code that chooses it.',
    ],
    commonMistakes: [
      'Creating classes when plain functions would express the strategy more simply.',
      'Letting each strategy return incompatible shapes.',
      'Hiding strategy selection inside the strategy itself.',
    ],
    tryIt: [
      'Replace the strategy objects with plain functions and compare the call sites.',
      'Add a minimum-order discount and write down which existing code changed.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Add an "annual member" strategy with a bigger discount.',
      code: `interface DiscountStrategy { apply(total: number): number }

const noDiscount:      DiscountStrategy = { apply: (t) => t };
const seasonal:        DiscountStrategy = { apply: (t) => t * 0.9 };
const loyalCustomer:   DiscountStrategy = { apply: (t) => t * 0.8 };

class Cart {
  constructor(private strategy: DiscountStrategy) {}
  setStrategy(s: DiscountStrategy) { this.strategy = s; }
  checkout(total: number) { return this.strategy.apply(total); }
}

const cart = new Cart(noDiscount);
console.log("no discount:", cart.checkout(100));
cart.setStrategy(seasonal);
console.log("seasonal:  ", cart.checkout(100));
cart.setStrategy(loyalCustomer);
console.log("loyal:     ", cart.checkout(100));`,
    },
  },
  {
    slug: 'decorator',
    title: 'Decorator',
    summary: 'Wrap an object to add behavior without modifying the wrapped code.',
    explanation: `A decorator adds responsibilities to an object by wrapping it in another object with the same interface. Multiple decorators can be stacked, each adding a slice of behavior.

In JS, higher-order functions are the natural way to decorate functions (logging, timing, retry, caching). Class decorators exist too, both as a language proposal and in TypeScript.`,
    keyPoints: [
      'Same interface as the wrapped object — decorators compose.',
      'Great for cross-cutting concerns: logging, timing, retry, caching.',
      'Function decorators = wrappers you already write every day.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Stack `withTiming` and `withLogging` in either order and see the layering.',
      code: `type Fn<T extends any[], R> = (...args: T) => R;

function withLogging<T extends any[], R>(fn: Fn<T, R>, label = "call"): Fn<T, R> {
  return (...args) => {
    console.log(\`[log] \${label}(\`, ...args, ")");
    const out = fn(...args);
    console.log(\`[log] \${label} →\`, out);
    return out;
  };
}

function withTiming<T extends any[], R>(fn: Fn<T, R>, label = "call"): Fn<T, R> {
  return (...args) => {
    const t = performance.now();
    const out = fn(...args);
    console.log(\`[time] \${label}: \${(performance.now() - t).toFixed(2)}ms\`);
    return out;
  };
}

const add = (a: number, b: number) => a + b;
const decorated = withTiming(withLogging(add, "add"), "add");
decorated(2, 3);`,
    },
  },
  {
    slug: 'adapter',
    title: 'Adapter',
    summary: 'Translate between two incompatible interfaces.',
    explanation: `An adapter converts the interface a client expects into the interface an existing class provides. It is glue code, but the *right kind* of glue — kept in one place with a clear name.

Common use: wrapping a legacy API to fit a modern interface, or unifying multiple SDKs behind one shape.`,
    keyPoints: [
      'One well-named place absorbs the incompatibility.',
      'Keeps callers ignorant of vendor quirks.',
      'Sometimes just a function; sometimes a class if state is involved.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Replace the adapter body with a different logger — callers do not care.',
      code: `// Third-party logger with an awkward API
const oldLogger = {
  writeLine: (level: number, text: string) => console.log(\`[\${level}] \${text}\`),
};

// The interface we want our app to depend on
interface Logger {
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
}

// Adapter
const loggerAdapter: Logger = {
  info:  (m) => oldLogger.writeLine(0, m),
  warn:  (m) => oldLogger.writeLine(1, m),
  error: (m) => oldLogger.writeLine(2, m),
};

function processOrder(id: string, log: Logger) {
  log.info(\`Processing order \${id}\`);
  log.warn(\`Payment pending for \${id}\`);
  log.error(\`Order \${id} failed\`);
}
processOrder("42", loggerAdapter);`,
    },
  },
  {
    slug: 'facade',
    title: 'Facade',
    summary: 'One friendly entry point in front of a messy subsystem.',
    explanation: `A Facade offers a simple, high-level interface over a complex set of classes or APIs. Callers use the facade; the ugly bits stay hidden behind it.

Think of it as a thin curated API for a subsystem you own but do not want to force every caller to learn.`,
    keyPoints: [
      'Simplifies usage without hiding the underlying pieces (they are still there for power users).',
      'Great for onboarding: "here is the one function 90% of use cases need".',
      'Not the same as Adapter — Facade simplifies, Adapter translates.',
    ],
    exercise: {
      language: 'typescript',
      hint: '`checkout()` orchestrates the messy multi-step subsystem.',
      code: `class Inventory { reserve(sku: string, qty: number) { console.log(\`reserved \${qty} × \${sku}\`); return true; } }
class Payments   { charge(amount: number) { console.log(\`charged $\${amount}\`); return "tx-1"; } }
class Shipping   { book(order: string) { console.log(\`booked shipping for \${order}\`); return "SHIP-1"; } }
class Notifier   { orderConfirmed(order: string) { console.log(\`emailed confirmation for \${order}\`); } }

class OrderFacade {
  constructor(
    private inv = new Inventory(),
    private pay = new Payments(),
    private ship = new Shipping(),
    private notify = new Notifier(),
  ) {}

  checkout(order: { id: string; sku: string; qty: number; amount: number }) {
    this.inv.reserve(order.sku, order.qty);
    this.pay.charge(order.amount);
    this.ship.book(order.id);
    this.notify.orderConfirmed(order.id);
    return "OK";
  }
}

new OrderFacade().checkout({ id: "42", sku: "BOOK-1", qty: 1, amount: 25 });`,
    },
  },
  {
    slug: 'command',
    title: 'Command',
    summary: 'Turn a request into a first-class object so you can queue, log, or undo it.',
    explanation: `A Command encapsulates all information needed to perform an action later: the target, the method to call, and the arguments. Because the command is an object, you can queue it, log it, retry it — and often implement undo.

Editors, task queues, macro systems and CQRS all lean on Command.`,
    keyPoints: [
      'Actions become data — queueable, loggable, undoable.',
      'Pair execute()/undo() for reversible operations.',
      'The invoker knows nothing about what the command actually does.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Try adding a `MultiplyCommand` and `undo()` for it.',
      code: `interface Command { execute(): void; undo(): void }

class Calculator {
  value = 0;
  private history: Command[] = [];

  run(cmd: Command) { cmd.execute(); this.history.push(cmd); }
  undo() { this.history.pop()?.undo(); }
}

class AddCommand implements Command {
  constructor(private calc: Calculator, private amount: number) {}
  execute() { this.calc.value += this.amount; }
  undo()    { this.calc.value -= this.amount; }
}

class SubtractCommand implements Command {
  constructor(private calc: Calculator, private amount: number) {}
  execute() { this.calc.value -= this.amount; }
  undo()    { this.calc.value += this.amount; }
}

const c = new Calculator();
c.run(new AddCommand(c, 10));
c.run(new AddCommand(c, 5));
c.run(new SubtractCommand(c, 3));
console.log("after 10+5-3 =", c.value);
c.undo();
console.log("after undo   =", c.value);
c.undo();
console.log("after undo   =", c.value);`,
    },
  },
  {
    slug: 'proxy-pattern',
    title: 'Proxy (design pattern)',
    summary: 'A stand-in that controls access to another object.',
    explanation: `A Proxy exposes the same interface as the real object but adds control: lazy initialization, access checks, caching, remote calls, logging.

Do not confuse with JavaScript's \`Proxy\` primitive — that is one implementation strategy for this pattern.`,
    keyPoints: [
      'Same interface as the real subject.',
      'Common flavors: virtual (lazy load), protection (permissions), remote (network), caching.',
      'Callers stay unaware they are talking to a proxy.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Notice how the expensive fetch runs only once — the proxy caches it.',
      code: `interface DataService { load(): Promise<string> }

class RealDataService implements DataService {
  async load() {
    console.log("(expensive network call)");
    await new Promise((r) => setTimeout(r, 20));
    return "server data";
  }
}

class CachingDataProxy implements DataService {
  private cache?: string;
  constructor(private real: DataService) {}
  async load() {
    if (this.cache !== undefined) {
      console.log("(cache hit)");
      return this.cache;
    }
    this.cache = await this.real.load();
    return this.cache;
  }
}

const service = new CachingDataProxy(new RealDataService());
console.log(await service.load());
console.log(await service.load());
console.log(await service.load());`,
    },
  },
]
