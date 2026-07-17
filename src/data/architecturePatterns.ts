import type { Concept } from './types'

export const architecturePatterns: readonly Concept[] = [
  {
    slug: 'mvc',
    title: 'MVC — Model / View / Controller',
    summary: 'Split the app into what it knows (Model), what it shows (View), and what it does (Controller).',
    explanation: `MVC separates three concerns:
- **Model**: the data and the rules for changing it.
- **View**: how the data is displayed.
- **Controller**: reacts to user input and coordinates the other two.

The classic web-era MVC (Rails, ASP.NET MVC) has the controller handle a request, prepare a model, and render a view. In frontend land, this contract has evolved into variants like MVVM and MVI.`,
    keyPoints: [
      'Clear boundaries: data / display / behavior.',
      'Multiple views can share one model.',
      'On the modern web the boundaries blur — libraries push components to be all three at once.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'The View reacts through the Model’s subscribe callback. Change the model and both view and controller adapt.',
      code: `// Model
type Listener = () => void;
class CounterModel {
  private value = 0;
  private listeners = new Set<Listener>();
  get() { return this.value; }
  increment() { this.value++; this.notify(); }
  decrement() { this.value--; this.notify(); }
  subscribe(l: Listener) { this.listeners.add(l); return () => this.listeners.delete(l); }
  private notify() { for (const l of this.listeners) l(); }
}

// View
class CounterView {
  constructor(private model: CounterModel) {
    model.subscribe(() => this.render());
  }
  render() { console.log("View  ->  Count:", this.model.get()); }
}

// Controller
class CounterController {
  constructor(private model: CounterModel) {}
  onClickPlus()  { console.log("Ctrl  ->  +"); this.model.increment(); }
  onClickMinus() { console.log("Ctrl  ->  -"); this.model.decrement(); }
}

const model = new CounterModel();
new CounterView(model).render();
const ctrl = new CounterController(model);

ctrl.onClickPlus();
ctrl.onClickPlus();
ctrl.onClickMinus();`,
    },
  },
  {
    slug: 'layered',
    title: 'Layered (n-tier) architecture',
    summary: 'Stack the code in layers, each depending only on the layer below.',
    explanation: `A typical stack:
- **Presentation** (controllers, UI)
- **Application / Service** (use cases, orchestration)
- **Domain** (entities and business rules)
- **Infrastructure / Persistence** (DB, external services)

Rules of the game: upper layers may call lower ones; lower layers must not know upper ones. Cross a layer boundary through explicit interfaces, not internal calls.

It is the most common architecture in enterprise codebases because it is easy to explain — the trade-off is that changes often ripple through multiple layers.`,
    keyPoints: [
      'One-way dependency: upper depends on lower, never the reverse.',
      'Each layer owns a specific concern.',
      'Fits well with DIP: the domain defines interfaces, infrastructure implements them.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Notice how the controller does not know about the DB — only about the service.',
      code: `// Domain
interface User { id: string; name: string }

// Infrastructure
class UserRepository {
  private data = new Map<string, User>([
    ["1", { id: "1", name: "Ada" }],
    ["2", { id: "2", name: "Linus" }],
  ]);
  async findById(id: string) { return this.data.get(id); }
}

// Application
class UserService {
  constructor(private repo = new UserRepository()) {}
  async greet(id: string) {
    const u = await this.repo.findById(id);
    if (!u) throw new Error("Not found");
    return \`Hello, \${u.name}\`;
  }
}

// Presentation
class UserController {
  constructor(private service = new UserService()) {}
  async handle(id: string) {
    try { console.log(await this.service.greet(id)); }
    catch (e) { console.log("HTTP 404:", (e as Error).message); }
  }
}

const controller = new UserController();
await controller.handle("1");
await controller.handle("999");`,
    },
  },
  {
    slug: 'hexagonal',
    title: 'Hexagonal (Ports & Adapters)',
    summary: 'Isolate the domain in a hexagon; talk to the outside world through explicit ports.',
    explanation: `Coined by Alistair Cockburn. The core (domain + use cases) lives in the middle. **Ports** are interfaces the domain defines to talk to the outside world (DB, message bus, HTTP, UI). **Adapters** implement those ports.

Everything the domain needs is expressed as a port; anything technology-specific is an adapter. This lets you test the domain in isolation, swap infrastructure without touching business rules, and drive the app from any input.`,
    keyPoints: [
      'Domain defines the interfaces (ports); infrastructure implements them (adapters).',
      'Left-side adapters drive the app (HTTP, CLI, tests). Right-side adapters are driven by it (DB, email).',
      'Dependencies point inward — infrastructure knows the domain, not the other way around.',
    ],
    useCases: [
      'Business rules that must be tested without a database, HTTP server, message broker, or UI.',
      'Systems that need multiple delivery mechanisms, such as HTTP, CLI, jobs, and tests.',
      'Replacing infrastructure vendors while keeping use cases stable.',
    ],
    commonMistakes: [
      'Putting framework types into domain interfaces, which points dependencies outward.',
      'Creating ports for every tiny helper before there is a real boundary.',
      'Treating folders as architecture while imports still point the wrong direction.',
    ],
    tryIt: [
      'Add a second `OrderRepo` adapter that logs instead of storing in memory.',
      'Move validation into `payOrder` and keep the adapter unchanged.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Swap the in-memory adapter for a `FakeApiOrderRepo` — the use case is unchanged.',
      code: `// Domain
interface Order { id: string; total: number; status: "new" | "paid" }

// Port defined by the domain
interface OrderRepo {
  save(o: Order): Promise<void>;
  find(id: string): Promise<Order | undefined>;
}

// Use case in the core
async function payOrder(id: string, repo: OrderRepo) {
  const order = await repo.find(id);
  if (!order) throw new Error("no such order");
  order.status = "paid";
  await repo.save(order);
  return order;
}

// Adapter: in-memory implementation
class InMemoryOrderRepo implements OrderRepo {
  private db = new Map<string, Order>();
  async save(o: Order) { this.db.set(o.id, o); }
  async find(id: string) { return this.db.get(id); }
}

const repo = new InMemoryOrderRepo();
await repo.save({ id: "42", total: 100, status: "new" });
const paid = await payOrder("42", repo);
console.log(paid);`,
    },
  },
  {
    slug: 'clean-architecture',
    title: 'Clean Architecture',
    summary: 'Concentric rings; source-code dependencies point inward toward business rules.',
    explanation: `Popularized by Robert C. Martin. Draws the same idea as Hexagonal as concentric rings:
- **Entities** (enterprise-wide rules)
- **Use cases** (application-specific rules)
- **Interface adapters** (controllers, presenters, gateways)
- **Frameworks & drivers** (web, DB, UI)

The **Dependency Rule**: source-code dependencies can only point inward. Inner rings know nothing about the outer rings. Frameworks are details you plug in at the edges.`,
    keyPoints: [
      'Dependencies point inward. Never the reverse.',
      'Business rules do not import React, Express, or SQL drivers.',
      'The framework is a delivery mechanism — swap it without rewriting the core.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'The use case depends on interfaces only. The outer adapter wires them together.',
      code: `// --- Entity (innermost)
class Money {
  constructor(public amount: number, public currency: "USD" | "EUR") {}
  toString() { return \`\${this.amount.toFixed(2)} \${this.currency}\`; }
}

// --- Ports the use case needs
interface WalletRepo { getBalance(userId: string): Promise<Money> }
interface Presenter  { show(msg: string): void }

// --- Use case
async function checkBalance(userId: string, repo: WalletRepo, view: Presenter) {
  const balance = await repo.getBalance(userId);
  view.show(\`Your balance is \${balance.toString()}\`);
}

// --- Outer ring: adapters
const repoAdapter: WalletRepo = {
  async getBalance() { return new Money(1234.56, "USD"); },
};
const consolePresenter: Presenter = { show: (m) => console.log("VIEW:", m) };

await checkBalance("user-1", repoAdapter, consolePresenter);`,
    },
  },
  {
    slug: 'event-driven',
    title: 'Event-driven architecture',
    summary: 'Modules communicate by emitting and listening to events.',
    explanation: `Instead of module A calling module B directly, A publishes an event and B (and C and D…) can listen. The publisher does not know who — if anyone — is listening.

This keeps modules loosely coupled and makes it easy to add new reactions to existing events. The trade-off: harder to trace what happens in response to a single event, and eventual consistency between subscribers.`,
    keyPoints: [
      'Publishers do not know the subscribers.',
      'Great for extensibility: add new listeners without touching the publisher.',
      'Downside: debugging becomes "who listens to this event?".',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Add another listener for "user.registered" and see all of them fire in order.',
      code: `type Handler<T> = (payload: T) => void;

class EventBus {
  private map = new Map<string, Set<Handler<any>>>();
  on<T>(evt: string, fn: Handler<T>) {
    if (!this.map.has(evt)) this.map.set(evt, new Set());
    this.map.get(evt)!.add(fn);
    return () => this.map.get(evt)!.delete(fn);
  }
  emit<T>(evt: string, payload: T) {
    for (const fn of this.map.get(evt) ?? []) fn(payload);
  }
}

interface UserRegistered { id: string; email: string }

const bus = new EventBus();
bus.on<UserRegistered>("user.registered", (u) => console.log("send welcome email to", u.email));
bus.on<UserRegistered>("user.registered", (u) => console.log("record analytics for", u.id));
bus.on<UserRegistered>("user.registered", (u) => console.log("provision workspace for", u.id));

// Producer — knows nothing about the consumers
function register(email: string) {
  const user = { id: crypto.randomUUID(), email };
  console.log("created user", user.id);
  bus.emit("user.registered", user);
}

register("ada@example.com");`,
    },
  },
  {
    slug: 'micro-frontends',
    title: 'Micro-frontends',
    summary: 'Break a big frontend into independently deployable pieces, each owned by a team.',
    explanation: `Micro-frontends apply the microservices philosophy to the UI: each part of the app is built, tested and deployed by a different team, then composed at runtime (or build time) into a single experience.

Approaches: iframes, Web Components, Module Federation (webpack/rspack/Vite), server-side inclusion. The hard problems are shared state, routing, styling coherence, and versioning shared dependencies.`,
    keyPoints: [
      'Team-scale autonomy: independent deploys, independent stacks.',
      'Composition happens in the browser, at the edge, or at build.',
      'Not free — you inherit distributed-system pain in your UI.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'This is a conceptual sketch — the "remotes" are just functions here.',
      code: `// Each remote is owned by a different team and exposes a mount function.
interface Remote { mount(root: string): void; unmount(root: string): void }

const headerRemote: Remote = {
  mount:   (r) => console.log(\`[header]   mounted at \${r}\`),
  unmount: (r) => console.log(\`[header]   unmounted at \${r}\`),
};

const catalogRemote: Remote = {
  mount:   (r) => console.log(\`[catalog]  mounted at \${r}\`),
  unmount: (r) => console.log(\`[catalog]  unmounted at \${r}\`),
};

const cartRemote: Remote = {
  mount:   (r) => console.log(\`[cart]     mounted at \${r}\`),
  unmount: (r) => console.log(\`[cart]     unmounted at \${r}\`),
};

// Shell composes them together
function bootShell(remotes: Record<string, Remote>) {
  for (const [slot, remote] of Object.entries(remotes)) remote.mount(slot);
  return () => {
    for (const [slot, remote] of Object.entries(remotes)) remote.unmount(slot);
  };
}

const teardown = bootShell({
  "#header":  headerRemote,
  "#catalog": catalogRemote,
  "#cart":    cartRemote,
});

teardown();`,
    },
  },
]
