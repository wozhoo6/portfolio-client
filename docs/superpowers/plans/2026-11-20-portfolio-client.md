# Portfolio Client Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Warren Tabora's one-page portfolio (projects first, project popup, Impressions, Gmail contact) plus a private `/admin` page, in `client/`, against the live Laravel API.

**Architecture:** Next.js App Router in TypeScript, styled with Tailwind CSS. The home page is a server component that fetches projects (refreshed every 60 seconds) and hands them to one client component, `Landing`, which owns the popup state. `/projects/[slug]` renders the same `Landing` with that popup open. Reactions, view tracking, Impressions and all admin calls run in the browser. Static copy lives in one typed data file.

**Tech Stack:** Next.js (latest, App Router), React, TypeScript (strict), Tailwind CSS (the version `create-next-app` installs), `next/font/google`, Vitest + React Testing Library + jsdom. Node v24.10.0 and npm 11.6.1 are installed.

**Spec:** `client/docs/superpowers/specs/2026-11-20-portfolio-client-design.md` (approved 2026-11-20). Read it first: every task's layout is in its section. This plan holds the decisions the spec does not.

## Testing policy (decided by Warren, 2026-11-20; overrides the test steps in the tasks below)

Automated tests only for functions that talk to the API: `src/lib/api.ts`, `src/lib/server-projects.ts` (both done) and `src/lib/admin-api.ts` (Task 10). No tests per component and none for other helper files. So for Tasks 5 to 13, **skip the "write failing tests" and "run the tests" steps**; instead verify each task with `npx tsc --noEmit`, `npm run lint`, `npm run build`, and Warren's visual review in `npm run dev`. The test lists inside those tasks stay as a checklist of behaviors to check by hand, and the Review Focus items are checked by hand as well. In Task 10 keep only the `admin-api` tests (token header on every call, 401 handling, request methods and paths); drop the session, lock screen and page tests. `toPayload` and `fromProject` in Task 12 are not tested either.

## Global Constraints

- TypeScript in strict mode; import alias `@/` = `src/`. Components are `.tsx`, everything else `.ts`. `npm run build` and `npx tsc --noEmit` must stay clean.
- All styling with Tailwind utility classes in the components. No CSS Modules. Tokens live in `src/app/globals.css`. Tailwind's default breakpoints are used: `md` = 768px, `lg` = 1024px.
- Palette tokens (Tailwind theme colors, so `bg-bg`, `text-muted`, `border-card` work): `--color-bg #0B0F1A`, `--color-surface #111827`, `--color-card #1A1F2E`, `--color-primary #8B5CF6`, `--color-link #A78BFA`, `--color-tech #60A5FA`, `--color-text #E5E7EB`, `--color-muted #9CA3AF`.
- Fonts via `next/font/google`: Plus Jakarta Sans (hero, headings) as theme font `heading`, Inter (body) as `body`, JetBrains Mono (technical labels, code) as `mono`.
- Type scale: hero 56-68px / 700; section headings 32-40px / 700; project titles 20-24px / 600; body 16-18px / 400; nav and buttons 14-16px / 500-600; technical labels 12-14px / 500; code 13-14px / 400.
- API: env `NEXT_PUBLIC_API_URL` = API root ending in `/api` (local: `http://127.0.0.1:8000/api`); optional `API_URL` overrides it on the server. Public calls use `/v1/...`, admin calls `/admin/...`. Send `Accept: application/json`; never send cookies or credentials.
- Reaction types exactly `like`, `love`, `fire`, `clap`. Impression: name required max 60; message 3 to 500 characters; hidden honeypot field named `website`. Public notes load 10 per page; admin lists 20 per page.
- Copy rules: title is "Full Stack Developer / Systems Solutions Analyst"; no logo or "WT"; no skill levels; no age; section label is "Impressions"; contact subject is "Hello Warren, I found your portfolio"; email `warrentabora3410@gmail.com`; LinkedIn and GitHub are empty strings and their links are hidden while empty; an education or certificate card shows only when all its fields are non-empty (no placeholders on the page).
- Popup address is `/projects/{slug}`. `/admin` is `noindex`, not in the nav, footer or any sitemap.
- Admin token lives only in `sessionStorage` under key `portfolio_admin_token`, never in a URL.

## Review Focus

1. **API asleep or down** (free Render sleeps): the home page and `npm run build` must not crash; show an empty-state line and retry in the browser. Pinned in Tasks 2, 5, 14.
2. **Project with null fields** (no description, role, problem, thumbnail; empty `key_features`, `links`): the popup omits those blocks, never prints "null", never shows a broken image. Task 6.
3. **Unknown slug** at `/projects/nope`: a real 404, not an empty popup. Task 6.
4. **localStorage unavailable or corrupt** (private browsing): reactions still work, just not lit across visits. Tasks 3 and 7.
5. **Admin token rejected mid-session** (rotated or expired): return to the lock screen, keep no stale token. Task 10.

## File Structure

```
client/
  .env.example                      # NEXT_PUBLIC_API_URL
  vitest.config.mts, vitest.setup.ts
  public/                           # portrait.jpg and resume.pdf go here later
  src/
    app/
      layout.tsx, globals.css       # fonts, Tailwind tokens, site metadata
      page.tsx                      # home: fetch projects, render <Landing/>
      projects/[slug]/page.tsx      # same Landing, popup open, per-project metadata
      admin/page.tsx                # noindex wrapper around <AdminApp/>
    lib/
      types.ts                      # Project, Impression, AdminProject, AdminImpression, Page<T>, Stats, ProjectPayload
      api.ts                        # public API client + ApiError
      admin-api.ts                  # admin API client
      reactions.ts                  # localStorage record of own reactions
      contact.ts                    # gmail / mailto link builders
      format.ts                     # timeAgo
      useActiveSection.ts           # scroll-spy hook
      useAdminSession.ts            # token in sessionStorage
    data/content.ts                 # all hardcoded copy
    components/
      Landing.tsx, Nav.tsx, Hero.tsx, ProjectsSection.tsx, ProjectCard.tsx,
      ProjectModal.tsx, ReactionBar.tsx, Impressions.tsx (form + list),
      AboutSkills.tsx, Experience.tsx, Education.tsx, Contact.tsx, Footer.tsx
      admin/ AdminApp.tsx, LockScreen.tsx, OverviewTab.tsx, ProjectsTab.tsx,
             ProjectForm.tsx, ImpressionsTab.tsx
```
Each component and module has a sibling test file (`*.test.tsx` for components, `*.test.ts` otherwise).

---

### Task 1: Scaffold, tooling and design tokens

**Files:** Create the Next.js app in `client/`; create `vitest.config.mts`, `vitest.setup.ts`, `.env.example`, `src/styles/tokens.test.ts`; modify `src/app/globals.css`, `src/app/layout.tsx`, `package.json`.

**Interfaces:**
- Produces: Tailwind theme colors and fonts from Global Constraints; `npm test` runs Vitest with jsdom, the `@/` alias and jest-dom matchers (imported in `vitest.setup.ts` from `@testing-library/jest-dom/vitest`). Tests import `describe, it, expect, vi` explicitly from `vitest`.

- [ ] **Step 1: Scaffold.** In `client/`, run `npx create-next-app@latest . --ts --app --src-dir --eslint --tailwind --import-alias "@/*"`. If it refuses because `docs/` exists, move `docs` to `../docs-tmp`, run it, move it back. Then `npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom`.
- [ ] **Step 2: Write the failing test** `src/styles/tokens.test.ts`: read `src/app/globals.css` with `fs` and assert it contains each of the eight `--color-name: #HEX` pairs from Global Constraints (case-insensitive).
- [ ] **Step 3: Run** `npx vitest run src/styles/tokens.test.ts`. Expected: FAIL (no tokens, or no vitest config yet).
- [ ] **Step 4: Implement.** `vitest.config.mts` (react plugin, jsdom, `setupFiles`, alias `@` to `src`); add script `"test": "vitest run"`. In `globals.css` keep Tailwind's import and add the eight colors in an `@theme` block; map the three fonts with `@theme inline` to the CSS variables `next/font` creates (name those variables `--font-jakarta`, `--font-inter`, `--font-jetbrains` so they do not clash with the theme names). If the installed Tailwind uses `tailwind.config.ts` instead of CSS config, put the same tokens in `theme.extend`. In `layout.tsx` load the three fonts and put their variable classes on `<html>`; set `body` to `bg-bg text-text font-body`. Create `.env.example` and a local `.env.local` with `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api`.
- [ ] **Step 5: Run** `npm test`, `npx tsc --noEmit`, then `npm run build`. Expected: test PASS, no type errors, build succeeds.
- [ ] **Step 6: Commit.** `git add -A && git commit -m "chore: scaffold Next.js client with Tailwind, TypeScript and Vitest"`

### Task 2: Types and public API client

**Files:** Create `src/lib/types.ts`, `src/lib/api.ts`, `src/lib/api.test.ts`.

**Interfaces (produces; later tasks import these exactly):**
```ts
// types.ts (field lists come from the spec's "API contract")
export type Project = { slug: string; title: string; summary: string; description: string | null;
  role: string | null; type: string | null; problem: string | null; solution: string | null;
  key_features: string[]; tech_stack: string[]; repo_url: string | null; live_url: string | null;
  thumbnail_url: string | null; is_featured: boolean; view_count: number; reactions_count: number;
  links: { label: string; url: string }[]; created_at: string }
export type Impression = { id: number; name: string | null; is_employer: boolean; message: string;
  project_slug: string | null; created_at: string }
export type Page<T> = { items: T[]; page: number; lastPage: number; total: number }
// api.ts
export class ApiError extends Error { status: number; errors: Record<string, string[]> | null }
export function apiBase(): string                       // API_URL ?? NEXT_PUBLIC_API_URL, no trailing slash
export function getProjects(): Promise<Project[]>       // GET /v1/projects; fetch option next:{revalidate:60}
export function getProject(slug: string): Promise<Project | null>   // null on 404
export function safeGetProjects(): Promise<{ projects: Project[]; failed: boolean }>  // never throws
export function recordView(slug: string): Promise<void>             // POST /v1/projects/{slug}/view; never throws
export type ReactionType = 'like' | 'love' | 'fire' | 'clap'
export function toggleReaction(slug: string, type: ReactionType): Promise<{ active: boolean; total: number }>
export function getImpressions(q: { scope?: 'portfolio'; project?: string; page?: number }): Promise<Page<Impression>>
export function postImpression(b: { name: string; message: string; isEmployer: boolean; projectSlug?: string }): Promise<Impression>
```
(`AdminProject`, `AdminImpression`, `Stats` and `ProjectPayload` are added to `types.ts` in Tasks 10 and 12.)

- [ ] **Step 1: Write failing tests** with a stubbed `global.fetch`: `getProjects returns data[] from GET {base}/v1/projects with Accept: application/json`; `getProject returns null on 404`; `toggleReaction posts {type} and returns {active,total}`; `getImpressions sends scope=portfolio or project=slug plus page, and maps meta to {page,lastPage,total}`; `postImpression sends name, message, is_employer, project_slug and website: ""`; `postImpression throws ApiError status 422 with errors map`; `postImpression throws ApiError status 429`; `recordView resolves when fetch rejects`; `safeGetProjects returns {projects: [], failed: true} on a rejected fetch and on a 500`.
- [ ] **Step 2: Run** `npx vitest run src/lib/api.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3: Implement** per the signatures. One private `request<T>(path, options)` that builds the URL, sets headers, parses JSON, and throws `ApiError(status, message, errors)` on non-2xx.
- [ ] **Step 4: Run** the same command and `npx tsc --noEmit`. Expected: PASS, no type errors.
- [ ] **Step 5: Manual check (Warren).** In `api/.env` set `FRONTEND_URL=http://localhost:3000`, run `php artisan serve`, then `curl.exe -i -H "Origin: http://localhost:3000" http://127.0.0.1:8000/api/v1/health`. Expected: response contains `access-control-allow-origin: http://localhost:3000`.
- [ ] **Step 6: Commit.** `git add -A && git commit -m "feat: types and public API client"`

### Task 3: Content data and small helpers

**Files:** Create `src/data/content.ts`, `src/lib/reactions.ts`, `src/lib/contact.ts`, `src/lib/format.ts` and a test file beside each.

**Interfaces (produces):**
```ts
// content.ts
export const site: { name: string; title: string; resumeAvailable: boolean }
export const navLinks: { id: string; label: string }[]   // projects, about, experience, education, contact (contact last)
export const hero, about, skills, experience, contact    // typed objects; shapes follow the spec's Content section
export const education: EducationEntry[]      // EducationEntry = { level: string; title: string; school: string; dates: string }
export const certificates: CertificateEntry[] // CertificateEntry = { issuer: string; title: string; center: string; year: string }
export function isComplete(entry: Record<string, string>): boolean   // false if any value is ""
export function visibleEntries<T extends Record<string, string>>(list: T[]): T[]
// reactions.ts
export const REACTION_TYPES: ReactionType[]            // ['like','love','fire','clap']
export function getReacted(slug: string): ReactionType[]            // never throws
export function setReacted(slug: string, type: ReactionType, active: boolean): void   // never throws
// contact.ts
export function gmailComposeUrl(a: { to: string; subject: string }): string
export function mailtoUrl(a: { to: string; subject: string }): string
export function pickEmailHref(a: { to: string; subject: string; isPhone: boolean }): string
// format.ts
export function timeAgo(iso: string, now?: Date): string   // "just now", "5 minutes ago", "2 days ago", "3 weeks ago"
```
`content.ts` holds the copy from the spec's Content section. `education` has the two colleges plus a High school entry with empty strings; `certificates` has the TESDA entry with empty strings (Warren fills these in later); `contact.linkedin` and `contact.github` are `""`.

- [ ] **Step 1: Write failing tests.** reactions: `getReacted returns [] when empty`; `setReacted adds then removes a type per slug`; `getReacted returns [] when localStorage throws`; `getReacted returns [] when stored JSON is corrupt`. contact: `gmailComposeUrl equals https://mail.google.com/mail/?view=cm&fs=1&to=...&su=... with the subject URL-encoded`; `mailtoUrl ends with ?subject=...`; `pickEmailHref returns mailto for isPhone true, Gmail otherwise`. content: `isComplete is false when any field is empty`; `visibleEntries drops the empty High school and TESDA entries`; `navLinks ids are projects, about, experience, education, contact`. format: `timeAgo returns the four phrasings above for boundary inputs`.
- [ ] **Step 2: Run** `npx vitest run src/lib src/data`. Expected: FAIL.
- [ ] **Step 3: Implement** all four modules. `reactions.ts` stores JSON under key `reactions:{slug}` and wraps every storage access in try/catch.
- [ ] **Step 4: Run** the same command and `npx tsc --noEmit`. Expected: PASS.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "feat: content data, reactions store, contact and format helpers"`

### Task 4: Page shell, Nav and Hero

**Files:** Create `Nav.tsx`, `Hero.tsx`, `Landing.tsx`, `src/lib/useActiveSection.ts` (+ tests); modify `src/app/layout.tsx` (metadata), `src/app/page.tsx`.

**Interfaces:**
- Consumes: `navLinks`, `hero`, `site` from Task 3.
- Produces: `useActiveSection(ids: string[]): string | null` (IntersectionObserver); `Nav()` and `Hero()` without props; `Landing(props: { projects?: Project[]; loadFailed?: boolean; openSlug?: string | null })`. Section element ids: `projects`, `about`, `experience`, `education`, `impressions`, `contact`. Metadata: title "Warren Tabora", plus a description and Open Graph tags.

- [ ] **Step 1: Write failing tests.** Nav: `renders Projects, About, Experience, Education, Contact in that order with Contact as the last link`; `contains no "WT" text`; `phone menu button toggles aria-expanded and the list`; `clicking a link closes the open menu`; `the link matching the active section has aria-current="true"` (mock `useActiveSection`). Hero: `renders name as the only h1, the title, the availability pill and the intro`; `portrait img has non-empty alt text`.
- [ ] **Step 2: Run** `npx vitest run src/components/Nav.test.tsx src/components/Hero.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement.** Pinned centered nav, hero two columns on desktop and portrait above the name on phones, per the spec's Nav and Hero sections. Portrait is `<img src="/portrait.jpg">` with a gray placeholder block until the file exists (`onError` swaps to the placeholder). `Landing` renders `Nav`, `Hero` and empty `<section id=...>` shells for the rest. `page.tsx` calls `safeGetProjects()` and passes `projects` and `loadFailed`.
- [ ] **Step 4: Run** the same command, `npx tsc --noEmit`, then `npm run dev` and view `http://localhost:3000` at 1280px and 390px wide. Expected: tests PASS; hero and nav match the spec at both widths.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "feat: page shell, nav and hero"`

### Task 5: Projects section

**Files:** Create `ProjectCard.tsx`, `ProjectsSection.tsx` (+ tests); modify `Landing.tsx`.

**Interfaces:**
- Consumes: `Project[]` from Task 2.
- Produces: `ProjectsSection(props: { projects: Project[]; onOpen: (slug: string) => void })` and `ProjectCard(props: { project: Project; size: 'large' | 'small'; onOpen: (slug: string) => void })`. Landing, when `loadFailed` is true, calls `getProjects()` in an effect and renders what it returns. The first project always takes the large card.

- [ ] **Step 1: Write failing tests.** `puts the first project in the large card with its stack chips and the next two in small cards`; `projects after the third render in a grid below`; `shows the reactions total only when reactions_count is above 0, and shows views`; `clicking a card calls onOpen with its slug` (card is a button, keyboard-activatable); `renders a quiet empty line when projects is []`; `a card with thumbnail_url null shows a placeholder block, not an img`; Landing: `fetches projects in the browser when loadFailed is true and renders them`.
- [ ] **Step 2: Run** `npx vitest run src/components`. Expected: FAIL for the new tests.
- [ ] **Step 3: Implement** per the spec's Projects section (large left about 60%, two stacked right; single column on phones).
- [ ] **Step 4: Run** the same command and `npx tsc --noEmit`. Expected: PASS. Then stop the API, reload the dev page, confirm the empty line shows and the page does not error.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "feat: projects section with featured layout"`

### Task 6: Project popup and its route

**Files:** Create `ProjectModal.tsx` (+ test), `src/app/projects/[slug]/page.tsx` (+ test); modify `Landing.tsx`.

**Interfaces:**
- Consumes: `recordView`, `safeGetProjects`, `Project`.
- Produces: `ProjectModal(props: { project: Project; onClose: () => void })` with slots for `ReactionBar` and `Impressions` added in Tasks 7 and 8; `generateMetadata({ params })` and the page default export in `projects/[slug]/page.tsx`. `Landing` keeps `openSlug` state initialised from its prop; opening calls `window.history.pushState(null, '', '/projects/' + slug)`; a `popstate` listener sets `openSlug` from `location.pathname`; closing restores `/` through `history.back()` when the popup was opened by a click, else `pushState` to `/`.

- [ ] **Step 1: Write failing tests.** Modal: `renders title, type tag, role, Problem, Solution, Key features and stack chips`; `omits any block whose data is null or empty and never prints "null"`; `Live demo and GitHub buttons render only when their URLs exist, and each entry in links renders as a link`; `calls recordView(slug) once on open`; `Escape, the close button and a backdrop click each call onClose`; `locks body scroll while open and restores it on unmount`; `has role="dialog", aria-modal="true", labelled by the title, and focus moves inside`. Landing: `clicking a card pushes /projects/{slug}; a popstate to / closes the popup`. Route: `generateMetadata returns the project title and summary`; `an unknown slug calls notFound when the fetch succeeded`; `renders Landing with loadFailed when the fetch failed` (mock `safeGetProjects` and `notFound`).
- [ ] **Step 2: Run** `npx vitest run src/components src/app`. Expected: FAIL.
- [ ] **Step 3: Implement** the wide two-column layout (about 960px, max 90% height, scrolls inside, close button pinned, single column on phones) per the spec's Project popup section.
- [ ] **Step 4: Run** the same command and `npx tsc --noEmit`. Expected: PASS. Then in the dev server open a card, press Back, then load `/projects/<real-slug>` directly. Expected: popup opens on direct load; Back closes it.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "feat: project popup with shareable route"`

### Task 7: Reaction bar

**Files:** Create `ReactionBar.tsx` (+ test); modify `ProjectModal.tsx`.

**Interfaces:**
- Consumes: `toggleReaction`, `getReacted`, `setReacted`, `REACTION_TYPES`.
- Produces: `ReactionBar(props: { slug: string; initialTotal: number })`.

- [ ] **Step 1: Write failing tests.** `renders four buttons named Like, Love, Fire and Clap with no counts on them`; `shows "N reactions" and hides it at 0`; `buttons recorded in localStorage start with aria-pressed="true"`; `clicking calls toggleReaction(slug, type), sets the total from the response and aria-pressed from response.active, and persists via setReacted`; `a rejected call (429 or network) keeps the previous state and shows a short message`; `works when localStorage throws`; `a second click while a request is pending is ignored`.
- [ ] **Step 2: Run** `npx vitest run src/components/ReactionBar.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** raised button styling per the spec (border, thicker bottom edge, shadow; lifts on hover; solid `bg-primary` when pressed). Place it in the modal's left column.
- [ ] **Step 4: Run** the same command and `npx tsc --noEmit`. Expected: PASS.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "feat: reaction buttons"`

### Task 8: Impressions (page and popup)

**Files:** Create `Impressions.tsx` (form and list in one file with two small inner components) and its test; modify `Landing.tsx`, `ProjectModal.tsx`.

**Interfaces:**
- Consumes: `getImpressions`, `postImpression`, `ApiError`, `timeAgo`.
- Produces: `Impressions(props: { projectSlug?: string; heading: string; onTotal?: (total: number) => void })`. With `projectSlug` it lists `?project=slug` and posts with that slug; without it, `?scope=portfolio` and no slug. `onTotal` fires after the first load. The modal shows "Impressions · {total}" and a left-column jump link that scrolls to it.

- [ ] **Step 1: Write failing tests.** List: `loads page 1 and shows name, an Employer badge only when is_employer, message and relative date`; `Load more appends the next page and disappears on the last page`; `shows "No notes yet. Yours could be the first." when empty`; `project mode requests {project: slug}`; `calls onTotal with the total`. Form: `shows a 0/500 counter and blocks input past 500`; `a whitespace-only message shows an error and sends nothing`; `the Send button is disabled while a request is pending`; `success puts the new note at the top and clears the form`; `a 422 shows the field errors under the fields`; `a 429 shows "You've sent a few notes already. Try again later."`; `a hidden input named website exists, is empty, has tabIndex -1 and aria-hidden`. Modal: `the jump link text is "Impressions · N" and clicking it scrolls the section into view`.
- [ ] **Step 2: Run** `npx vitest run src/components`. Expected: FAIL for the new tests.
- [ ] **Step 3: Implement** the two-column form and wall per the spec (form left, notes right, stacked on phones). Add the page-level section to `Landing` after Education with id `impressions`.
- [ ] **Step 4: Run** the same command and `npx tsc --noEmit`. Expected: PASS. Then post a note from the page and from a popup against the local API. Expected: each appears only in its own list.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "feat: impressions for page and projects"`

### Task 9: About, Experience, Education, Contact, Footer

**Files:** Create `AboutSkills.tsx`, `Experience.tsx`, `Education.tsx`, `Contact.tsx`, `Footer.tsx` (+ tests); modify `Landing.tsx`.

**Interfaces:**
- Consumes: `about, skills, experience, education, certificates, contact, site, navLinks, visibleEntries, pickEmailHref`.
- Produces: components without props; `Landing` renders sections in this order: projects, about, experience, education, impressions, contact, then Footer.

- [ ] **Step 1: Write failing tests.** About: `renders the two paragraphs, the facts card and the four skill groups as chips`; `contains no level words (advanced, intermediate, beginner)`; `the Resume button is absent while site.resumeAvailable is false`. Experience: `lists NetGlobal, Streamsoft, ExaWeb in that order and marks the first two as current`. Education: `shows only the two colleges while High school and TESDA are empty`; `shows a certificate card once its fields are filled` (mock the content module). Contact: `Email me links to Gmail compose on desktop and mailto when matchMedia says phone`; `Copy email writes the address and shows "Copied"`; `when the clipboard call rejects it shows the address as selectable text instead`; `LinkedIn and GitHub links are absent while empty and present when set`. Footer: `shows "© 2026 Warren Tabora" and the same links as the nav`. Landing: `section ids appear in the spec order`.
- [ ] **Step 2: Run** `npx vitest run src/components`. Expected: FAIL.
- [ ] **Step 3: Implement** per the spec's About and Skills, Experience, Education and Certificates, Contact and Footer sections, desktop and phone.
- [ ] **Step 4: Run** the same command and `npx tsc --noEmit`. Expected: PASS. View at 1280px and 390px against the spec.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "feat: about, experience, education, contact and footer"`

### Task 10: Admin client and lock screen

**Files:** Create `src/lib/admin-api.ts`, `src/lib/useAdminSession.ts`, `src/app/admin/page.tsx`, `src/components/admin/AdminApp.tsx`, `LockScreen.tsx` (+ tests); add to `types.ts`.

**Interfaces (produces; Tasks 11 to 13 use these exactly):**
```ts
// types.ts additions
export type Stats = { totals: { projects: number; views: number; impressions: number; hidden_impressions: number; reactions: number };
  top_projects: { slug: string; title: string; view_count: number; reactions_count: number }[];
  daily: { stat_date: string; views: number; unique_visitors: number }[] }
export type AdminProject = Project & { id: number; is_published: boolean; updated_at: string }
export type AdminImpression = Impression & { is_visible: boolean }
// admin-api.ts
export type AdminApi = {
  stats(): Promise<Stats>
  runRollup(): Promise<{ ok: boolean; output: string }>
  listProjects(q: { status?: 'active' | 'inactive'; featured?: boolean; search?: string; page?: number }): Promise<Page<AdminProject>>
  createProject(body: ProjectPayload): Promise<AdminProject>
  updateProject(id: number, body: Partial<ProjectPayload>): Promise<AdminProject>
  activateProject(id: number): Promise<AdminProject>
  deactivateProject(id: number): Promise<AdminProject>
  listImpressions(page: number): Promise<Page<AdminImpression>>
  hideImpression(id: number): Promise<AdminImpression>
  showImpression(id: number): Promise<AdminImpression>
  deleteImpression(id: number): Promise<void>
}
export function createAdminApi(token: string, onUnauthorized: () => void): AdminApi
// every call sends X-Admin-Token; any 401 calls onUnauthorized() then throws ApiError(401)
// useAdminSession.ts
export function useAdminSession(): { status: 'checking' | 'locked' | 'unlocked'; api: AdminApi | null; unlock(token: string): Promise<void>; lock(): void }
```
`ProjectPayload` (the snake_case create/update body) is defined in `types.ts` in Task 12. `AdminApp` shows `LockScreen` until unlocked, then a tab bar (Overview, Projects, Impressions) and a Lock button; the three tab components take `{ api: AdminApi }`.

- [ ] **Step 1: Write failing tests.** api: `every call sends X-Admin-Token to {base}/admin/...`; `a 401 calls onUnauthorized and throws ApiError 401`; `create is a JSON POST, update a PATCH, activate and deactivate PATCH their paths, hide and show PATCH, delete is DELETE`. Session: `unlock calls stats, then stores the token in sessionStorage`; `a rejected unlock stores nothing`; `lock clears storage and returns to locked`; `on load a stored token is revalidated and cleared if rejected`; `a 401 from any later call returns status to locked`. LockScreen: `the field is type password`; `shows "Wrong token" after a 401`. Page: `exports metadata with robots index false and follow false`.
- [ ] **Step 2: Run** `npx vitest run src/lib/admin-api.test.ts src/lib/useAdminSession.test.ts src/components/admin src/app/admin`. Expected: FAIL.
- [ ] **Step 3: Implement.** `src/app/admin/page.tsx` is a server component exporting the metadata and rendering `<AdminApp/>` (a `"use client"` component).
- [ ] **Step 4: Run** the same command and `npx tsc --noEmit`. Expected: PASS. Then open `/admin` with the API running, enter a wrong then the right token. Expected: "Wrong token", then the tab bar.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "feat: admin lock screen and session"`

### Task 11: Admin Overview

**Files:** Create `OverviewTab.tsx` (+ test).

**Interfaces:** Consumes `api.stats()` and `api.runRollup()`. Produces `OverviewTab(props: { api: AdminApi })` and an inner `DailyBars(props: { daily: Stats['daily'] })`.

- [ ] **Step 1: Write failing tests.** `shows the five totals`; `lists the top projects with views and reactions`; `DailyBars renders one bar per day, each with an accessible label "date: N views, M visitors"`; `DailyBars renders an empty message when daily is []`; `Run rollup calls runRollup, disables the button while running, then shows the returned output`; `a rollup failure shows an error and re-enables the button`.
- [ ] **Step 2: Run** `npx vitest run src/components/admin/OverviewTab.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** with Tailwind and inline SVG or div bars, no chart library.
- [ ] **Step 4: Run** the same command and `npx tsc --noEmit`. Expected: PASS.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "feat: admin overview"`

### Task 12: Admin Projects (list and form)

**Files:** Create `ProjectsTab.tsx`, `ProjectForm.tsx` (+ tests); add `ProjectPayload` to `types.ts`.

**Interfaces:**
```ts
// types.ts
export type ProjectPayload = { title: string; summary: string; description: string | null; role: string | null;
  type: string | null; problem: string | null; solution: string | null; key_features: string[]; tech_stack: string[];
  repo_url: string | null; live_url: string | null; thumbnail_url: string | null;
  links: { label: string; url: string }[]; is_featured: boolean; is_published?: boolean }   // is_published only on create
// ProjectForm.tsx
export type ProjectFormValues = { title: string; summary: string; description: string; role: string; type: string;
  problem: string; solution: string; keyFeatures: string; techStack: string;   // one item per line
  repoUrl: string; liveUrl: string; thumbnailUrl: string;
  links: { label: string; url: string }[]; isFeatured: boolean; isPublished: boolean }
export function toPayload(values: ProjectFormValues): ProjectPayload   // lines split, trimmed, blanks dropped; blank link rows dropped; empty strings become null
export function fromProject(project: AdminProject | null): ProjectFormValues
export function ProjectForm(props: { api: AdminApi; project: AdminProject | null; onSaved: (p: AdminProject) => void; onCancel: () => void })
export function ProjectsTab(props: { api: AdminApi })
```

- [ ] **Step 1: Write failing tests.** `toPayload splits key features and tech stack by line and drops blanks`; `toPayload drops empty link rows and nulls empty URLs`; `fromProject round-trips toPayload`. Tab: `lists projects with title, type, status, featured, views and reactions`; `changing a filter or the search box reloads with those params`; `Next and Previous pages call listProjects with the page`; `Activate and Deactivate call the API and update the row`. Form: `create submits toPayload(values) to createProject`; `edit submits to updateProject(id, ...)`; `a 422 shows each field's error under that field`; `changing the title of an existing project shows the slug-change warning`; `the thumbnail field shows an image preview when it holds a URL`.
- [ ] **Step 2: Run** `npx vitest run src/components/admin/ProjectsTab.test.tsx src/components/admin/ProjectForm.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement** per the spec's Projects tab field list.
- [ ] **Step 4: Run** the same command and `npx tsc --noEmit`. Expected: PASS. Then create a real project from `/admin` and check it on the public page.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "feat: admin projects"`

### Task 13: Admin Impressions

**Files:** Create `ImpressionsTab.tsx` (+ test).

**Interfaces:** Consumes `api.listImpressions`, `hideImpression`, `showImpression`, `deleteImpression`. Produces `ImpressionsTab(props: { api: AdminApi })`.

- [ ] **Step 1: Write failing tests.** `lists notes newest first with name, an Employer badge, message, project slug or "page", and visible or hidden`; `Hide and Show call the API and update that row`; `Delete asks for confirmation and removes the row only after confirming`; `cancelling the confirmation sends nothing`; `paging calls listImpressions with the page`.
- [ ] **Step 2: Run** `npx vitest run src/components/admin/ImpressionsTab.test.tsx`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the same command and `npx tsc --noEmit`. Expected: PASS.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "feat: admin impressions moderation"`

### Task 14: Production readiness

**Files:** Create `client/README.md`; modify `.env.example`.

- [ ] **Step 1: Verify the build survives a dead API.** Run `API_URL=http://127.0.0.1:9 npm run build` (PowerShell: set `$env:API_URL` first). Expected: build succeeds; the generated home page shows the empty-projects line.
- [ ] **Step 2: Run everything.** `npm test`, `npx tsc --noEmit` and `npm run lint`. Expected: all pass.
- [ ] **Step 3: Write `README.md`:** local setup, env vars, `npm test`, and the deploy checklist from Step 4.
- [ ] **Step 4 (Warren): Deploy.** Push `client/` to a private GitHub repo; import it in Vercel; set `NEXT_PUBLIC_API_URL` to the Render URL plus `/api`; on Render set `FRONTEND_URL` to the Vercel URL, comma, `http://localhost:3000`; redeploy the API.
- [ ] **Step 5 (Warren): Smoke test live.** Open the Vercel URL: projects load, a popup opens, a reaction toggles, a note posts, Email me opens Gmail, `/admin` locks and unlocks, `/projects/<slug>` opens directly.
- [ ] **Step 6: Commit.** `git add -A && git commit -m "docs: readme and deploy checklist"`

---

## Self-review notes
- Coverage: Nav and Hero (4), Projects (5), popup, deep link, metadata (6), reactions (7), Impressions page and popup (8), About, Experience, Education and Certificates, Contact, Footer (9), Admin (10 to 13), data fallback (2, 5, 14), env and CORS (2, 14).
- Names and types used across tasks (`Landing` props, `onOpen`, `onTotal`, `AdminApi`, `createAdminApi`, `visibleEntries`, `pickEmailHref`, `ProjectPayload`) match their Interfaces blocks.
- Left to the implementer: spacing, animation, focus styling, exact copy of error messages not quoted above.
