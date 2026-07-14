import type { Concept } from './types'

export const principles: readonly Concept[] = [
  {
    slug: 'srp',
    title: 'Single Responsibility Principle (SRP)',
    summary: 'A class or module should have only one reason to change.',
    explanation: `The **S** in SOLID. Each unit of code should own **one** responsibility. If two unrelated stakeholders would ask you to change the same file for different reasons, you probably have two things fused together.

The reward: smaller changes, fewer merge conflicts, easier testing.`,
    keyPoints: [
      'One reason to change → one responsibility.',
      'Extract side effects (I/O, logging, formatting) away from business logic.',
      'Reads well: each unit fits in your head.',
    ],
    useCases: [
      'Splitting calculation, persistence, notifications, and formatting into testable units.',
      'Reviewing files that keep growing because unrelated workflows were added to the same module.',
      'Finding natural boundaries before extracting shared utilities.',
    ],
    commonMistakes: [
      'Interpreting SRP as "one function does one tiny thing" instead of one reason to change.',
      'Moving code into a new file without separating the responsibility.',
      'Letting side effects hide inside functions that look like plain calculations.',
    ],
    tryIt: [
      'Write a unit test for `calculateTotal` without constructing `OrderRepo` or `Mailer`.',
      'Add tax calculation as a separate pure helper instead of adding it to `BadOrderService`.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Notice how the pure calculator is trivial to test without touching the DB or email.',
      code: `// ❌ God class — invoice calculation, persistence, and email all in one
class BadOrderService {
  process(order: { items: { price: number; qty: number }[] }) {
    const total = order.items.reduce((s, it) => s + it.price * it.qty, 0);
    // pretend DB call:
    console.log("save order total to DB:", total);
    // pretend email:
    console.log("email receipt for total:", total);
  }
}

// ✅ Separated responsibilities
const calculateTotal = (order: { items: { price: number; qty: number }[] }) =>
  order.items.reduce((s, it) => s + it.price * it.qty, 0);

class OrderRepo { save(total: number) { console.log("saved:", total); } }
class Mailer { sendReceipt(total: number) { console.log("emailed:", total); } }

const order = { items: [{ price: 10, qty: 2 }, { price: 5, qty: 3 }] };
const total = calculateTotal(order);
new OrderRepo().save(total);
new Mailer().sendReceipt(total);`,
    },
  },
  {
    slug: 'separation-of-concerns',
    title: 'Separation of concerns',
    summary: 'Keep different reasons for complexity in different places.',
    explanation: `Separation of concerns is the broader habit behind many design principles. A concern is a responsibility such as business rules, rendering, persistence, validation, authorization, or logging.

When concerns are mixed together, a small change in one area can break another. When they are separated, each piece can be tested, replaced, and understood on its own.`,
    keyPoints: [
      'Business rules should not depend on UI, database, or logging details.',
      'A module boundary should make the reason for change obvious.',
      'Separate concerns by behavior and ownership, not by arbitrary file count.',
      'Good separation makes tests smaller and failures easier to locate.',
    ],
    useCases: [
      'Keeping React components focused on rendering while helpers calculate domain results.',
      'Separating request validation, authorization, use-case logic, and persistence in API handlers.',
      'Moving formatting concerns away from core calculations.',
    ],
    commonMistakes: [
      'Creating folders named `utils` and `helpers` without a clear concern.',
      'Putting database calls inside functions that should only calculate a result.',
      'Splitting one coherent workflow into too many tiny files with no ownership boundary.',
    ],
    tryIt: [
      'Add tax or discount rules by changing calculation code only.',
      'Swap the repository adapter with a failing fake and keep receipt formatting unchanged.',
    ],
    exercise: {
      language: 'typescript',
      title: 'Separate calculation, persistence, and presentation',
      hint: 'Change `formatReceipt` without touching the checkout calculation.',
      code: `interface CartItem { sku: string; price: number; qty: number }
interface Order { id: string; items: CartItem[]; total: number }
interface OrderRepo { save(order: Order): Promise<void> }

function calculateSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function formatReceipt(order: Order) {
  return \`Receipt \${order.id}: $\${order.total.toFixed(2)}\`;
}

async function checkout(items: CartItem[], repo: OrderRepo) {
  const order = {
    id: "order_1",
    items,
    total: calculateSubtotal(items),
  };

  await repo.save(order);
  return formatReceipt(order);
}

const memoryRepo: OrderRepo = {
  async save(order) {
    console.log("saved order:", order.id);
  },
};

const receipt = await checkout(
  [
    { sku: "BOOK", price: 24, qty: 1 },
    { sku: "PEN", price: 3, qty: 4 },
  ],
  memoryRepo
);

console.log(receipt);`,
    },
  },
  {
    slug: 'ocp',
    title: 'Open/Closed Principle (OCP)',
    summary: 'Open for extension, closed for modification.',
    explanation: `The **O** in SOLID. You should be able to add new behavior without rewriting the existing code that already works. The classic tool is polymorphism: define an interface, add new implementations.

The alternative — endless switch/if trees — grows unbounded and touches the same file every time.`,
    keyPoints: [
      'Add new behavior by adding code, not by editing old code.',
      'Polymorphism > sprawling switch statements.',
      'Trade-off: some upfront design cost. Not every switch needs an interface.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Add a `wire` payment method — you should only need to add a class, not edit the processor.',
      code: `// ❌ Closed for extension — every new payment type touches this switch
function payBad(kind: string, amount: number) {
  switch (kind) {
    case "card":   return console.log("charge card",   amount);
    case "paypal": return console.log("charge paypal", amount);
    default: throw new Error("Unknown kind");
  }
}
payBad("card", 100);

// ✅ Open for extension — add a class, don't edit the caller
interface PaymentMethod { pay(amount: number): void }
class Card   implements PaymentMethod { pay(a: number) { console.log("charge card",   a); } }
class PayPal implements PaymentMethod { pay(a: number) { console.log("charge paypal", a); } }

function payGood(method: PaymentMethod, amount: number) {
  method.pay(amount);
}
payGood(new Card(),   100);
payGood(new PayPal(), 100);`,
    },
  },
  {
    slug: 'lsp',
    title: 'Liskov Substitution Principle (LSP)',
    summary: 'Subtypes must be usable in place of their parents without surprises.',
    explanation: `The **L** in SOLID. If \`B\` extends \`A\`, code that uses \`A\` should keep working when handed a \`B\`. Overriding a method to throw, or to weaken guarantees, breaks LSP.

The famous smell: \`Square extends Rectangle\` seems tidy but breaks callers who assume width and height are independent.`,
    keyPoints: [
      'Subclasses may extend behavior, not remove it.',
      'A subclass method should accept the same inputs and produce compatible outputs.',
      '"Refused bequest" (a subclass that throws on inherited methods) is an LSP violation.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Notice why the Rectangle→Square is a classic trap. Prefer composition.',
      code: `class Rectangle {
  constructor(public w: number, public h: number) {}
  area() { return this.w * this.h; }
}

class Square extends Rectangle {
  // Overriding setters to keep w === h — breaks anyone who sets them independently.
  setW(w: number) { this.w = w; this.h = w; }
  setH(h: number) { this.h = h; this.w = h; }
}

function double(rect: Rectangle) {
  rect.w = 4;
  rect.h = 5;
  return rect.area();
}

const r = new Rectangle(2, 2);
console.log("Rectangle area (expect 20):", double(r));
const s = new Square(2, 2);
console.log("Square    area (expect 20, but…):", double(s));

// ✅ Prefer composition or a shared interface
interface Shape { area(): number }
class Rect2 implements Shape { constructor(public w: number, public h: number) {} area() { return this.w * this.h; } }
class Sqr2  implements Shape { constructor(public side: number) {} area() { return this.side ** 2; } }
console.log([new Rect2(3, 4), new Sqr2(5)].map((s) => s.area()));`,
    },
  },
  {
    slug: 'isp',
    title: 'Interface Segregation Principle (ISP)',
    summary: 'Do not force clients to depend on methods they do not use.',
    explanation: `The **I** in SOLID. Many small, focused interfaces beat one giant one. If a class implements only half of a big interface, split the interface.

In TypeScript this is often about typing function parameters to just the shape they actually need, rather than the entire domain object.`,
    keyPoints: [
      'Prefer small, role-based interfaces.',
      'Type parameters to the narrowest useful shape.',
      'Reduces coupling and clarifies intent at each call site.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'The renderer only reads `name` — do not make it depend on the whole User.',
      code: `interface User { id: string; name: string; email: string; token: string }

// ❌ Depends on the whole User just to greet
function greetBad(u: User) { return "Hello " + u.name; }

// ✅ Depends only on what it uses
interface HasName { name: string }
function greetGood(u: HasName) { return "Hello " + u.name; }

const u: User = { id: "1", name: "Ada", email: "a@x", token: "t" };
console.log(greetGood(u));                        // works with User
console.log(greetGood({ name: "Just a name" })); // works with the minimal shape`,
    },
  },
  {
    slug: 'dip',
    title: 'Dependency Inversion Principle (DIP)',
    summary: 'Depend on abstractions, not concretions.',
    explanation: `The **D** in SOLID. High-level policies (business logic) should not directly depend on low-level details (DB drivers, HTTP libraries). Both should depend on an abstraction owned by the high-level module.

Practically: define an interface at the level of your domain, and inject an implementation. Swap it for a test double without touching the domain code.`,
    keyPoints: [
      'Business logic defines the interfaces it needs.',
      'Infrastructure adapts to those interfaces, not the other way around.',
      'Makes unit tests trivial — no mocking heroics needed.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Swap RealClock for FakeClock without changing Greeter.',
      code: `interface Clock { now(): Date }

class RealClock implements Clock { now() { return new Date(); } }
class FakeClock implements Clock { constructor(private d: Date) {} now() { return this.d; } }

class Greeter {
  constructor(private clock: Clock) {}
  greet(name: string) {
    const h = this.clock.now().getHours();
    const part = h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
    return \`Good \${part}, \${name}\`;
  }
}

console.log(new Greeter(new RealClock()).greet("Ada"));
console.log(new Greeter(new FakeClock(new Date("2020-01-01T07:00:00Z"))).greet("Ada"));
console.log(new Greeter(new FakeClock(new Date("2020-01-01T21:00:00Z"))).greet("Ada"));`,
    },
  },
  {
    slug: 'dry',
    title: 'DRY — Don\'t Repeat Yourself',
    summary: 'Every piece of knowledge should have a single, unambiguous representation.',
    explanation: `Duplication of *knowledge* is the enemy — not duplication of code that happens to look alike. If the same business rule appears in three places, changing it means finding all three.

The dual mistake: over-DRYing incidental similarity into a leaky abstraction. Rule of thumb: wait for the third occurrence before extracting.`,
    keyPoints: [
      'DRY targets duplicated knowledge, not visually similar code.',
      'Wait for the third occurrence — premature abstraction hurts more than duplication.',
      'Constants, config, and business rules are prime DRY candidates.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Change TAX_RATE in the second version — one edit updates everywhere.',
      code: `// ❌ Same rule scattered
function priceWithTaxA(p: number) { return p * 1.19; }
function priceWithTaxB(p: number) { return p + p * 0.19; }
console.log(priceWithTaxA(100), priceWithTaxB(100));

// ✅ One source of truth
const TAX_RATE = 0.19;
const applyTax = (p: number) => p * (1 + TAX_RATE);
console.log(applyTax(100));
console.log(applyTax(250));`,
    },
  },
  {
    slug: 'kiss',
    title: 'KISS — Keep It Simple',
    summary: 'Prefer the simplest thing that could possibly work.',
    explanation: `Every abstraction has a cost: someone has to understand it, someone has to maintain it, and it can hide bugs. When in doubt, use the boring solution.

Simple ≠ short. It means low cognitive load: obvious control flow, few moving parts, minimal indirection.`,
    keyPoints: [
      'Optimize for reading, not writing.',
      'Delete before you extract — sometimes the abstraction was never needed.',
      'Complexity is a debt you pay in every code review afterwards.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'A one-liner is not always simpler; readability wins.',
      code: `const users = [
  { name: "Ada",   active: true  },
  { name: "Linus", active: false },
  { name: "Grace", active: true  },
];

// ❌ Terse but harder to scan
const namesBad = users.reduce<string[]>(
  (acc, u) => (u.active ? [...acc, u.name] : acc),
  [],
);

// ✅ Simple, obvious
const namesGood = users.filter((u) => u.active).map((u) => u.name);

console.log(namesBad);
console.log(namesGood);`,
    },
  },
  {
    slug: 'yagni',
    title: 'YAGNI — You Aren\'t Gonna Need It',
    summary: 'Do not build for hypothetical futures. Build for what you need now.',
    explanation: `Every feature you add "just in case" has a real cost today (writing, testing, reviewing, maintaining) and a speculative benefit later. YAGNI says: don't pay now for benefits you may never collect.

You can always add it when the need is real — and then you actually know the shape it should take.`,
    keyPoints: [
      'Design for the requirements you have, not the ones you imagine.',
      'Speculative flexibility is expensive and often wrong.',
      'Deleting code is cheaper than maintaining unused code.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Prefer the simple version until a second use case appears.',
      code: `// ❌ Over-engineered: options for scenarios that do not exist yet
interface FormatterOptions {
  locale?: string;
  currency?: string;
  precision?: number;
  useThousandsSeparator?: boolean;
  fallback?: string;
  transform?: (n: number) => number;
}
function overFormat(n: number, opts: FormatterOptions = {}): string {
  const value = opts.transform ? opts.transform(n) : n;
  return value.toLocaleString(opts.locale ?? "en-US", {
    style: "currency",
    currency: opts.currency ?? "USD",
    maximumFractionDigits: opts.precision ?? 2,
    useGrouping: opts.useThousandsSeparator ?? true,
  }) || (opts.fallback ?? "");
}
console.log(overFormat(1234.5));

// ✅ Only what today needs
const formatUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
console.log(formatUSD(1234.5));`,
    },
  },
  {
    slug: 'composition-over-inheritance',
    title: 'Composition over inheritance',
    summary: 'Assemble behavior from small pieces instead of inheriting a giant one.',
    explanation: `Inheritance couples subclasses to the parent's internals. Change the parent and every child feels it. Composition — plugging small, independent pieces together — keeps the coupling loose.

Rule of thumb: use inheritance only for a true "is-a" relationship where substitution is safe (see LSP). Otherwise compose.`,
    keyPoints: [
      'Inheritance = "is a". Composition = "has a" or "can do".',
      'Composition avoids fragile base-class problems.',
      'Mixins and higher-order functions are lightweight composition tools in JS.',
    ],
    exercise: {
      language: 'typescript',
      hint: 'Add a new capability by writing another mixin — no class hierarchy touched.',
      code: `// Small, focused behaviors
const canFly = { fly() { return \`\${this.name} flies\`; } };
const canSwim = { swim() { return \`\${this.name} swims\`; } };
const canWalk = { walk() { return \`\${this.name} walks\`; } };

function makeAnimal(name: string, ...traits: object[]) {
  return Object.assign({ name }, ...traits);
}

const duck    = makeAnimal("Duck",    canFly, canSwim, canWalk);
const fish    = makeAnimal("Fish",    canSwim);
const sparrow = makeAnimal("Sparrow", canFly,  canWalk);

console.log(duck.fly(),    duck.swim(), duck.walk());
console.log(fish.swim());
console.log(sparrow.fly(), sparrow.walk());`,
    },
  },
]
