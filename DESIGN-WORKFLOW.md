# Design workflow — taradomemusik.com

Design work on this site runs through the `taradome-web-design` plugin: Emil
Kowalski's design engineering, the taste skill for visual direction, Impeccable
for the typography/spacing/hierarchy audit, and a `taradome-site-build` workflow
that sequences them.

## One-time setup

```bash
# 1. The design toolkit (skills)
claude plugin marketplace add https://github.com/kdufay-tech/taradome-plugins
claude plugin install taradome-web-design@taradome

# 2. Impeccable project context — writes DESIGN.md and PRODUCT.md for this repo
claude
/impeccable init

# 3. Figma, only if working from a design file
claude plugin install figma@claude-plugins-official
#    then restart Claude Code, open /plugin, and authorize in the browser
```

Playwright is already wired up: [`.mcp.json`](.mcp.json) in this repo declares
the server, so a session started here picks it up. Confirm with `/mcp` and ask
for a screenshot to verify browser access.

Full detail, including the optional Impeccable detector hooks:
[taradome-web-design README](https://github.com/kdufay-tech/taradome-plugins/blob/main/taradome-web-design/README.md).

## This site

Next.js + Tailwind, app router. Source lives under `Website/`.

```bash
cd Website
npm install
npm run dev        # http://localhost:3000 — the preview Playwright drives
```

Routes: `/`, `/about`, `/artists`, `/artists/[artist]`, `/releases`, `/spotlight`,
`/studio`, `/join`, `/contact`, `/privacy`. Design tokens in
`Website/app/globals.css` and `Website/tailwind.config.ts` — change the tokens,
not the call sites.

## Running it

Ask for the work in plain language; `taradome-site-build` picks it up and applies
the house precedence rule — **your brief beats the existing brand system, which
beats the design skills' own taste**, with accessibility non-negotiable
throughout.

For a new page or a full redesign, give it the brief:

> Build a responsive **[page type]** for **[audience]**. The main goal is
> **[the one action]**. Include **[sections]** and use **[real copy, images,
> brand assets]**.
>
> References: **[2–3 URLs or screenshots, and what I like about each]**.
> Figma frame: **[link, or "none"]**.
> Visual direction: **[mood, typography, colours, motion]**.
>
> Run a local preview and use Playwright to test desktop and mobile layouts,
> navigation, buttons and form validation. Check keyboard access and
> reduced-motion behaviour. Take screenshots, fix visible problems and show the
> updated result. Ask before publishing.

On the existing site:

> Audit this site with Impeccable. Fix the biggest design and usability issues,
> then retest with Playwright and show updated screenshots.

## Before publishing

Deploys are a separate, explicit step — the workflow stops before them. Check by
hand first:

- [ ] The main action works end to end, clicked by a human.
- [ ] Every link resolves; no dead artist or release routes.
- [ ] Mobile fits — no horizontal scroll, no clipped text.
- [ ] Body text readable at arm's length on a phone.
- [ ] Roster, catalogue and company claims are factually accurate.
- [ ] `/join` and `/contact` forms tested against their **real** integrations.
      Layout testing does not cover these.
