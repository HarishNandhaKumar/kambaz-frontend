# Kambaz Frontend

Next.js 15 + TypeScript frontend for the Kambaz LMS — an LMS clone with courses, modules, assignments, and a full quiz authoring + taking experience. Talks to the [Kambaz backend](https://github.com/HarishNandhaKumar/kambaz-backend) via session-based auth.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **State**: Redux Toolkit — feature slices for accounts, courses, modules, assignments, enrollments, quizzes
- **HTTP**: axios with `withCredentials: true` for session cookies
- **UI**: React 19 + react-bootstrap + react-icons
- **Linting**: ESLint with `next/core-web-vitals` + `next/typescript`

## Architecture

### App Router layout

The app uses Next.js's file-based routing under `src/app/`. The main app lives in the `(Kambaz)` route group; lab/demo pages live under `Labs/`.

```
src/app/
├── layout.tsx                 root layout
├── page.tsx                   landing page
├── (Kambaz)/                  main app (route group, doesn't add URL segment)
│   ├── layout.tsx             session-aware layout
│   ├── store.ts               Redux store (combineReducers across features)
│   ├── Database/index.ts      shared client-side data (courses, etc.)
│   ├── Account/
│   │   ├── reducer.ts         account slice
│   │   ├── client.ts          axios calls for signin/signup/profile
│   │   ├── Session.tsx        session-rehydration component
│   │   └── Signin/, Signup/, ...
│   ├── Courses/
│   │   ├── reducer.ts         courses slice
│   │   ├── client.ts          axios calls
│   │   └── [cid]/             dynamic course routes
│   │       ├── Modules/
│   │       ├── Assignments/
│   │       └── Quizzes/
│   │           ├── [qid]/
│   │           │   ├── edit/      faculty quiz editor
│   │           │   ├── take/      student quiz-taking UI
│   │           │   ├── preview/   faculty preview
│   │           │   └── results/   post-attempt results
│   └── Dashboard/
└── Labs/                      separate lab/demo pages
```

### Redux structure

Six feature slices, all using `createSlice` with synchronous reducers. API calls happen in `client.ts` files per feature; components dispatch actions after the axios call resolves.

| Slice | Stores |
|---|---|
| `account` | current logged-in user |
| `courses` | course list and selection |
| `modules` | modules per course |
| `assignments` | assignments per course |
| `enrollments` | enrollments for the dashboard |
| `quizzes` | quizzes, questions, and attempts |

### Auth flow

Session-based — the backend sets an HTTP-only session cookie on signin. The axios client is configured with `withCredentials: true` so the cookie is sent on every request.

```
1. User signs in → POST /api/users/signin
2. Backend sets session cookie
3. App calls /api/users/profile to hydrate `account.currentUser`
4. Subsequent API calls include the cookie automatically
```

The session-rehydration on first load lives in `Account/Session.tsx`.

## Getting started

### Prerequisites

- Node.js 20+
- A running [Kambaz backend](https://github.com/HarishNandhaKumar/kambaz-backend) (defaults to `http://localhost:4000`)

### Setup

```bash
git clone https://github.com/HarishNandhaKumar/kambaz-next-js.git
cd kambaz-next-js
npm install
```

### Environment variables

Create a `.env.local` in the repo root:

```env
NEXT_PUBLIC_HTTP_SERVER=http://localhost:4000
```

`NEXT_PUBLIC_*` env vars are exposed to the browser at build time — required for axios to know where the API is.

### Run

```bash
npm run dev      # http://localhost:3000 (development with HMR)
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```

## Connecting to the backend

The backend's CORS is configured to accept requests from `process.env.CLIENT_URL` (default `http://localhost:3000`). If you run the frontend on a different port or origin, update `CLIENT_URL` on the backend.

For local development, **both servers must be running**:

- backend on `http://localhost:4000`
- frontend on `http://localhost:3000`

For session cookies to work locally, the backend must be started with `SERVER_ENV=development` so it doesn't set the `Secure: true` flag on cookies (which requires HTTPS).

## Tooling notes

- **Tailwind is installed but not actively used** — Bootstrap is the active UI system. Removing Tailwind from `devDependencies` is on the cleanup list.
- **`react-router-dom` is in dependencies but unused** — Next's App Router handles routing. Same cleanup note applies.

## See also

- [Kambaz backend](https://github.com/HarishNandhaKumar/kambaz-backend) — Express + Mongoose API with bcrypt, zod validation, role-based authorization, server-side quiz grading, rate limiting, helmet, and a 36-test Jest + Supertest suite.
