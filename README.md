# Corecept

A hands-on refresher for JavaScript, TypeScript, and the ideas used to design
maintainable software. The project began as a personal way to review core and
advanced topics without jumping between many sources; it is shared here as a
compact learning resource for other developers too.

Each topic combines a plain-language explanation with an editable exercise, so
you can read an idea, change the example, and see what the code does. Further
reading links are included where available.

## What you can review

The app currently includes 50 topics across five sections:

- **Basic JavaScript (12):** hoisting, scope, closures, references and mutation,
  pure functions, callbacks, IIFEs, higher-order functions, `this`, prototypes,
  destructuring, and coercion.
- **Advanced JavaScript and TypeScript (12):** the event loop, promises,
  `async`/`await`, cancellation, generators, currying, debounce and throttle,
  memoization, proxies, and TypeScript types.
- **Principles (10):** SOLID, separation of concerns, DRY, KISS, YAGNI, and
  composition over inheritance.
- **Design patterns (10):** Factory, Builder, Observer, Strategy, Decorator,
  Adapter, Facade, Command, Proxy, and Singleton.
- **Architecture patterns (6):** MVC, layered, hexagonal, clean, event-driven,
  and micro-frontends.

Topic pages can include key points, use cases, common mistakes, follow-up ideas,
and references in addition to the explanation and exercise.

## How to use it

1. Choose a section and open a topic.
2. Read the explanation and note the key points or common mistakes.
3. Edit the JavaScript or TypeScript exercise and select **Run** to inspect its
   output. Use **Reset** to restore the original example.
4. Follow the references when you want a deeper treatment.

## Run locally

Requirements: Node.js and npm.

```sh
npm ci
npm run dev
```

Vite prints the local development URL in the terminal.

Available commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run typecheck` | Check TypeScript types. |
| `npm run build` | Typecheck and create the production build in `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run deploy` | Build and deploy to Firebase Hosting using the Firebase CLI. |

## How the exercises run

The editor uses Monaco. JavaScript examples run in the browser, and TypeScript
examples are transpiled with Sucrase before running. Output and errors appear
below each editor. The runner is for short learning examples; it is **not a
secure sandbox** for arbitrary or untrusted code.

## Content and project structure

Concept content is stored as typed data in `src/data/`, with its shape defined
in `src/data/types.ts`. Each section exports a list of topics that the router
uses to build its section and detail pages.

To add or improve a topic, edit the relevant data file. A topic has a slug,
title, summary, and explanation; optional fields provide key points, use cases,
common mistakes, follow-up suggestions, a JavaScript or TypeScript exercise,
and further-reading links. Run the app locally to review how the content reads
and how its exercise behaves.

The app is built with React, TypeScript, Vite, React Router, Tailwind CSS, and
Monaco Editor.

## Deploy to Firebase Hosting

This is a static single-page app. `firebase.json` serves the Vite build from
`dist/` and rewrites app routes to `index.html`, so refreshing a topic URL works.

### Deploy from your computer

Install and sign in to the Firebase CLI, then select the Firebase project for
this checkout if one is not already selected:

```sh
npm install -g firebase-tools
firebase login
firebase use --add
npm run deploy
```

The deploy command builds the app before publishing it. For a temporary hosted
preview, run `firebase hosting:channel:deploy preview`.

### Deploy from GitHub Actions

`.github/workflows/deploy-firebase.yml` builds and deploys the live site on each
push to `main`. To create its deploy credentials, run this from the repository
root after Firebase Hosting is set up:

```sh
firebase init hosting:github
```

Select this GitHub repository and the build script `npm ci && npm run build`.
The Firebase CLI creates a deploy service account and uploads its key to GitHub
Actions Secrets. This workflow expects the secret
`FIREBASE_SERVICE_ACCOUNT_CORECEPT_3D216` for Firebase project
`corecept-3d216`.

The CLI also offers to create its own live-deploy workflow. Decline that option
because this repository already has one; otherwise, pushes to `main` would
trigger two production deployments. The CLI's pull request preview workflow is
optional. Commit the workflow and Firebase configuration, then push to `main`.

## Technologies

- React and TypeScript
- Vite and React Router
- Tailwind CSS
- Monaco Editor
- Sucrase for TypeScript exercise transpilation
