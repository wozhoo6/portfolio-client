# Portfolio Client

The public site and admin page for Warren Tabora's portfolio. It is a one-page Next.js app that reads projects, reactions and visitor impressions from the [portfolio API](../api).

## Features

- One scrolling page: Projects, About and Skills, Experience, Education and Certificates, Contact.
- Project cards open in a popup with the full case study, links, reactions and visitor impressions. Each project also has a direct link at `/projects/<slug>`.
- Reactions and impressions update the UI instantly and roll back if the request fails.
- Scroll-driven motion (CSS plus the `motion` library) that respects reduced-motion settings.
- Admin page at `/admin`, locked by an admin token: overview stats, project create/edit/activate, and impression moderation.
- If the API is down, the site still builds and shows an empty projects section.

## Tech stack

- Next.js 16 (App Router) and React 19
- TypeScript
- Tailwind CSS 4
- `motion` and `lucide-react`
- Vitest and Testing Library

## Getting started

You need Node.js and a running copy of the API (see [`../api`](../api)).

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Required | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the API including `/api`, for example `http://127.0.0.1:8000/api`. Used in the browser. |
| `API_URL` | No | Same value, used only on the server (build and server rendering). It takes priority over `NEXT_PUBLIC_API_URL` there. |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | Lint with ESLint |
| `npm test` | Run the tests |

The tests cover the code that talks to the API (`src/lib/api`, `admin-api` and `server-projects`).

## Editing content

All the static text lives in [`src/data/content.ts`](src/data/content.ts): name and title, bio, skills, experience, education, certificates and contact links. Components only render it. Projects come from the API, not from this file.

Static files go in `public/`: `portrait.jpg` for the hero portrait and `Warren_Tabora_Resume.pdf` for the Resume button.

## Project structure

```
src/
  app/          pages: home, /projects/[slug], /admin
  components/   page sections, project popup, reactions, admin/ tabs
  data/         content.ts (all site copy)
  lib/          API clients, types, hooks, helpers, tests
public/         portrait and resume
```

## Deploying

The client is built for Vercel.

1. Push this folder to GitHub and import it in Vercel.
2. Set `NEXT_PUBLIC_API_URL` to your API URL plus `/api`.
3. On the API host, set `FRONTEND_URL` to your Vercel URL so CORS allows it (comma-separate several origins).
4. Redeploy, then check that projects load, a reaction toggles, a note posts and `/admin` unlocks.
