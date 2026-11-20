# Portfolio client: design draft

**Status: APPROVED by Warren on 2026-11-20 (desktop layouts chosen by Warren; all phone layouts approved by Warren as proposed by Claude). Tooling: Next.js. Warren supplies LinkedIn, GitHub, high school and TESDA details during development.**

Legend: **[decided]** = chosen or approved by Warren. Where a phone layout was originally Claude's proposal, Warren approved it as written.

## Intent
Warren Tabora's portfolio. When a recruiter or client lands, **projects come first**. One scrolling landing page; project details open in a popup.

## Constraints
- **Next.js (App Router), TypeScript and Tailwind CSS, hosted on Vercel [decided by Warren; TypeScript and Tailwind chosen 2026-11-20]**, built inside the `client/` folder (which already holds this `docs/` folder). Talks to the Laravel API (`/api/v1`) on Render.
- Fonts load through Next's built-in font support (Plus Jakarta Sans, Inter, JetBrains Mono).
- Style: minimalist and professional, dark. Palette: background `#0B0F1A`, sections `#111827`, cards `#1A1F2E`, primary button `#8B5CF6`, links/hover `#A78BFA`, technical accents `#60A5FA`, text `#E5E7EB`, supporting text `#9CA3AF`.
- Fonts: Plus Jakarta Sans (hero/headings), Inter (body), JetBrains Mono (technical labels, code). Type scale from the planning doc (hero 56-68px, section headings 32-40px, project titles 20-24px, body 16-18px).
- Title/branding: **Full Stack Developer / Systems Solutions Analyst**.
- Anti-goals: no skill levels, no contact form/backend, no age on the page.

## Page order (top to bottom)
Nav, Hero, Projects, About and Skills, Experience, Education and Certificates, Impressions, Contact, Footer. **[decided]** (Education and Certificates became its own section on 2026-11-20.)

## Section layouts

### Nav
- **No logo or "WT" mark** (removed by Warren as unnecessary) **[decided]**.
- Desktop **[decided, links centered rather than on a side]**: slim bar pinned to the top, links centered: Projects, About, Experience, Education, and Contact styled as a purple button. Smooth-scroll to sections; the current section's link gets a purple underline. Impressions is not in the nav (reached by scrolling).
- Mobile **[decided]**: pinned bar with only a menu button at the right; it opens a dropdown of the same links with Contact as a full-width button at the bottom. Tapping a link closes the menu and scrolls.

### Hero
- Desktop **[decided]**: two columns. Left: availability pill ("Open to full-time, freelance"), name as the big headline, title in purple accent under it, one-line intro. Right: 150px rounded-square portrait (placeholder until a photo exists; plain image slot). Hero stays short so the featured project shows in the first laptop screen.
- Mobile **[decided]**: single column. Smaller portrait (about 96px) above the name, then pill, name, title, intro.

### Projects ("Selected projects")
- Desktop **[decided]**: one big featured card on the left (about 60%), two smaller cards stacked on the right. Featured = the project with `is_featured` (API already sorts featured first). A 4th+ project drops into a 3-column grid under these. Cards show thumbnail, title, short summary; the big card also shows stack chips. Total reactions shown on the card only when above 0. Clicking a card opens the popup.
- Mobile **[decided]**: single column, featured card first, then the rest stacked. Same card content.

### Project popup
- Desktop **[decided]**: wide two-column, about 960px wide, max 90% of screen height, scrolls inside itself, page behind locked, close button pinned at top.
  - Left column: screenshot/demo video, stack chips, Live demo and GitHub buttons (each only if its URL exists), four reaction buttons, "N reactions · N views", purple jump link "Impressions · N down-arrow".
  - Right column: title, type tag (Freelance, Final Thesis, Part-time), role, Problem, Solution, Key features.
  - Full width at the bottom: **Impressions for this project**. Form left (name, note up to 500 chars, "I'm an employer / hiring" checkbox, "Send note"), notes right, newest first, 10 at a time with "Load more", blue "Employer" badge.
- Mobile **[decided]**: near full-screen sheet, columns stack in this order: media, title/type/role, stack and links, reactions, Problem/Solution/Features, Impressions (form, then notes). Close button stays pinned.
- Reactions **[decided]**: four raised, clearly button-looking pills (like, love, fire, clap), no labels, no per-type counts. One total shown ("26 reactions"), hidden at 0. Lit state kept in the browser (localStorage); clicking again removes the reaction.
- Notes in the popup show only for that project; the page-level wall shows only page-level notes (`?scope=portfolio` / `?project=slug`).

### About and Skills
- Desktop **[decided]**: two columns. Left: headline, two short paragraphs (condensed from the planning doc's bio and origin story), facts card (Location Rizal GMT+8, Remote yes, Open to Full-time and Freelance), "Resume (PDF)" button (hidden until the file exists). Right: skills as chips grouped Languages, Frameworks, Databases, Tools, plus a muted "how I work" row (Problem-solving, Initiative, Teamwork, Communication). No levels.
- Mobile **[decided]**: single column: About text, facts card, resume button, then Skills. Chips wrap.

### Experience
- Desktop **[decided]**: vertical timeline, newest first, current roles marked in purple, full width. Entries: Backend Developer at NetGlobal Solutions Inc. (Mar 2026 - Present); Junior Analyst (Developer) at Streamsoft Inc., part-time (2025 - Present); Technical SEO Intern at ExaWeb Corporation (Mar - Jul 2025). One or two lines each. Real job titles stay as they are.
- Mobile **[decided]**: same timeline, shorter descriptions.
- Warren rejected the first idea of a narrow Education card beside this timeline; Education is no longer part of this section.

### Education and Certificates
- New section after Experience **[decided]**. Colleges are listed separately, not merged **[decided]**: BS Computer Science, Tomas Claudio Colleges (Aug 2024 - May 2026); BS Computer Science, De La Salle University - Dasmarinas (Aug 2022 - Apr 2024). Plus a high school entry and a TESDA NC II certificate.
- Desktop **[decided]**: "education" row of three equal cards, newest first (Tomas Claudio, DLSU-D, high school), then a "certificates" row of cards underneath with room for more. Phone **[decided]**: cards stacked one per row.
- **Missing facts (do not invent):** high school name, years and strand/track; TESDA qualification wording (assumed Computer Systems Servicing NC II), training center, year, and whether Warren holds the NC II certificate (passed assessment) or only attended training.

### Impressions (page level)
- Desktop **[decided]**: label "Impressions" (kept as is), heading "Leave a note". Two columns: form left, wall right (newest first, 10 at a time, "Load more", Employer badge). States: after sending the note appears at the top; rate limit message ("a few notes already, try again later"; API allows 2 a minute and 10 a day); empty wall line.
- Mobile **[decided]**: stacked: form first, then the wall.

### Contact
- Desktop **[decided]**: centered block. "Let's work together", one line on availability, "Email me" button (opens a Gmail compose window with To and Subject filled; subject "Hello Warren, I found your portfolio"), "Copy email" button, address, LinkedIn and GitHub links (URLs still blank in the planning doc). No form, no backend.
- Mobile **[decided]**: buttons stack full width; "Email me" uses a `mailto:` link so it opens the phone's mail app.

### Footer
- Desktop: one row, copyright left, quick links right. Mobile **[decided]**: stacked, centered.

## Admin page (`/admin`) [decided, added 2026-11-20]
A simple private page inside the same Next.js app, for Warren only. Not linked from the nav or footer, hidden from search engines (noindex), not in any sitemap. Desktop first, but usable on a phone (columns stack). Same palette as the site.
- **Lock screen on load:** one "Admin token" password field and an "Unlock" button. Unlock checks the token by calling `GET /api/admin/stats` with the `X-Admin-Token` header; a 401 shows "Wrong token". On success the token is kept in the browser's session storage (cleared when the tab closes), never in the address bar. A "Lock" button clears it. If any later admin call returns 401, the page returns to the lock screen. Calls go from the browser straight to the API (its CORS already allows that header).
- **Overview tab:** tiles for projects, views, notes, hidden notes, reactions; top 5 projects (title, views, reactions); a simple bar chart of views and unique visitors for the last 14 days (`daily`); a "Run rollup" button that shows the API's returned output.
- **Projects tab:** table of projects (title, type, active or inactive, featured, views, reactions) with filters for status, featured and title search, 20 per page. A form to create or edit a project with: title (required; the web address slug is built from it automatically, and renaming changes the slug, so warn that old shared links stop working), summary (required, max 255), description, role, type (free text, max 60), problem, solution, key features (one per line, max 10, each max 255), tech stack (one per line, each max 50), repo URL, live URL, thumbnail URL (pasted link, with a small image preview), related links (label max 60 plus URL, up to 20), featured switch. Activate and deactivate are buttons on each row (the update call does not change published status). Server errors (422) show beside the field.
- **Impressions tab:** every note including hidden ones, newest first, 20 per page: name, employer badge, message, project slug or "page", visible or hidden. Buttons: Hide or Show, and Delete (asks to confirm first).
- **No image upload.** Thumbnails are pasted links (for example an image hosted on GitHub). File upload is a possible later project and would need new backend storage.
- The API has no throttling on admin routes (Warren's choice), so the admin token should be long and random.

## API support (done)
Public: projects list/detail (now with `role`, `type`, `problem`, `solution`, `key_features`), view tracking, reactions toggle, impressions list/create. No contact endpoint needed.

## Approaches considered
- Page order: (A) short hero then projects, (B) hero with projects in first screen, (C) projects as the hero. Chose B's order with C's big-plus-two card layout.
- Popup: (A) single column, (B) wide two-column. Chose B. Project notes: tab next to the story vs section at the bottom. Chose bottom section.
- Contact: form needs a new endpoint; chose Gmail compose link plus copy fallback instead.

## API contract (as built, verified against the Laravel code)
The API address comes from an env variable (`NEXT_PUBLIC_API_URL`, value = the Render URL + `/api`; the code adds `/v1` for public calls and `/admin` for admin calls; the Render URL is supplied by Warren). Always send `Accept: application/json`. No cookies or credentials.

- `GET /projects` returns `{ data: [Project] }`: published only, featured first, then newest. Not paginated.
- `GET /projects/{slug}` returns `{ data: Project }`.
- **Project fields:** `slug, title, summary, description, role, type, problem, solution` (text, any can be null), `key_features` (string array, may be empty), `tech_stack` (string array), `repo_url, live_url, thumbnail_url` (URLs, may be null), `is_featured, view_count, reactions_count`, `links` (array of `{label, url}`), `created_at`.
- **Media:** there is only `thumbnail_url` (one image). No separate screenshot or video fields. The popup media area shows `thumbnail_url`; a demo video would be one of the `links` for now.
- `POST /projects/{slug}/view` returns 202 `{counted}`. The server dedupes per visitor for 30 minutes, so the client just calls it once each time a popup opens.
- `POST /projects/{slug}/reactions` with body `{ type }` where type is `like | love | fire | clap`. It toggles and returns `{ active, total, by_type }`. The visitor is identified by the server from the request, so the client sends no ID. The API does not say which reactions a visitor already made, so the client remembers its own toggles in localStorage per project and type, and shows `total` (ignore `by_type`). Limit 30 a minute.
- `GET /impressions?scope=portfolio` (page level) or `?project={slug}` (one project), plus `&page=N`. Laravel pagination: `{ data: [...], links, meta: { current_page, last_page, total } }`, 10 per page, newest first, visible notes only. "Load more" asks for the next page until `current_page == last_page`. The popup's count is `meta.total`. Each note: `{ id, name, is_employer, message, project_slug, created_at }`.
- `POST /impressions` with `{ name (required, max 60), message (required, 3 to 500 chars), is_employer (optional boolean), project_slug (optional), website (honeypot) }`. The form must include a hidden `website` field that stays empty. Returns 201 `{ data: note }`, 422 `{ message, errors }` on bad input, 429 when rate limited (2 a minute, 10 a day per visitor). New notes are visible immediately; Warren hides them later from the admin.
- **CORS:** the server only allows origins listed in its `FRONTEND_URL` setting (comma separated). It must include the Vercel URL and the local dev URL, or browser calls will fail.
- No contact endpoint exists or is needed.

## Content (hardcoded in the client as a typed data file; the API holds only projects and notes)
- **Hero:** pill "Open to full-time, freelance". Headline "Warren Tabora". Title "Full Stack Developer / Systems Solutions Analyst". Intro: "I solve real business problems with effective, proven solutions that real users rely on."
- **About:** headline "Problem solver who builds the whole system". Paragraph 1: "I'm a Full Stack Developer with 2+ years of real-world experience. I started as a backend developer and now work across the full stack, building systems and apps used locally and internationally. I also run SEO and Google Ads for non-profits." Paragraph 2: "I've loved troubleshooting since my first PC: I kept breaking it and finding a way to fix it. That curiosity led me to a Computer Science degree, and coding became my main way of thinking up solutions." Facts: Location Rizal, Philippines (GMT+8); Remote work Yes; Open to Full-time, Freelance.
- **Skills:** Languages: JavaScript, PHP, Python. Frameworks: Laravel, CodeIgniter, Express, React, React Native, Flutter. Databases: PostgreSQL, MySQL, Supabase, MongoDB, Firebase. Tools: Git, VS Code, WordPress, Power Automate, Power Apps, Google Ads, SEMrush, Ahrefs. How I work: Problem-solving, Initiative, Teamwork, Communication.
- **Experience:** as listed under Experience above, with descriptions: NetGlobal "Code reviews, feature work and production deployment for a marketplace platform, plus business analysis and QA with cross-functional teams."; Streamsoft "Backend development, workflow automation, QA, SEO and Google Ad Grant management to improve site performance and efficiency."; ExaWeb "Technical SEO, metadata optimization, reporting and backlink audits."
- **Contact:** email `warrentabora3410@gmail.com` (from the planning doc). Gmail link subject "Hello Warren, I found your portfolio". LinkedIn and GitHub links are **not provided yet**: hide those two links until URLs are supplied.
- **Footer:** "(c) 2026 Warren Tabora" and the same links as the nav.
- **Assets:** portrait and resume live as static files in the client's public folder. The resume button shows only when a config flag says the file exists (off for now). Project thumbnails come from the API.
- **Education and Certificates:** show only entries whose facts are complete. No placeholders on the live page. If the high school or TESDA facts are still missing at build time, those cards are simply left out.

## Calls made by Claude (to check)
- Popup has its own address: `/projects/{slug}` opens the home page with that popup open, so a project link can be shared and the browser Back button closes the popup instead of leaving the site. Because the site is Next.js, that route can also set its own page title, description and link-preview card from the project's data, so shared project links show a proper preview.
- Data loading: the project list is fetched on the server and refreshed about once a minute, so the page arrives as real HTML (good for SEO). The API runs on a free Render plan that sleeps, so a failed or slow fetch must not break the page or the build: fall back to loading projects in the browser. Reactions, view tracking and Impressions always run in the browser.
- Environment: one variable for the API address used by the server and one for the browser. The API's `FRONTEND_URL` must list the Vercel URL and `http://localhost:3000`.
- Popup media = the single `thumbnail_url` image (see API contract).
- Content lives in the client, not the API.
- Resume button is controlled by a config flag.

## Decisions from Warren (2026-11-20)
- Tooling: **Next.js**, built in the `client/` folder.
- LinkedIn and GitHub URLs: left blank for now; Warren adds them during development. The client must hide each link while its URL is empty.
- High school and TESDA details: Warren adds them during development. The data file holds those entries once complete; until then the cards are not shown.

## Left to the builder
Exact spacing, breakpoints (suggest 768px and 1024px), animation, image sizing, loading and error states, SEO tags, accessibility (alt text, contrast, keyboard focus in the popup).
