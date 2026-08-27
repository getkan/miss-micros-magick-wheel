# Miss Micro's Magick Wheel Specification

## Product Summary

Miss Micro's Magick Wheel is a browser-based randomizer for choosing from a user's curated set of options. The first release should make a playful choice feel quick, legible, and repeatable without requiring an account or database.

## Goals

- Let a user enter and manage a list of wheel options.
- Let a user spin the wheel and clearly identify the selected option.
- Keep the experience usable on both desktop and mobile screens.
- Preserve the current session's options while the page remains open.
- Make the primary interaction accessible by keyboard and understandable without relying on color alone.

## Non-goals for the first release

- Accounts, authentication, or user-specific cloud synchronization.
- Multiplayer or shared wheels.
- A server-side database.
- Payments, advertising, or a content marketplace.

## Functional Requirements

1. The application displays a responsive landing homepage with flying books in the background and a clear path to the wheel page.
2. The homepage displays a reusable spinning wheel icon that can also represent loading and win states.
3. The wheel page uses a server component to fetch and parse entries from Google Sheets, then passes normalized entries to a client component.
4. While Google Sheets data is loading, the wheel page displays the homepage spinning wheel icon; failures and empty data receive clear states.
5. The client component renders a Canvas wheel whose sections are calculated from the parsed entries.
6. The wheel cannot spin when it has fewer than two valid entries, and the interface explains why.
7. Starting a spin provides visible motion or progress and ends with one deterministic selected entry.
8. The selected entry triggers a winner animation and is displayed in an accessible modal.
9. Spinning music plays during the wheel animation when permitted, and homepage wheel icons fly across the screen after a win.
10. The primary Canvas wheel is the default experience; the HTML-in-Canvas experimental route (`/wheel/html`) is not part of the core acceptance path.
11. The layout remains functional at narrow mobile widths and larger desktop widths.

## Experience Direction

The visual language should feel theatrical and handmade while keeping controls clear: bold display typography, high-contrast ink and jewel-tone accents, a visible wheel as the first-viewport focus, and restrained motion that supports the spin rather than distracting from it. Avoid relying on gradients, tiny text, or decorative elements that compete with the selected result.

## Google Sheets API Integration

- The wheel options are maintained in a Google Sheet and fetched through the Google Sheets API.
- A Next.js server-side wrapper retrieves the configured spreadsheet and range, validates the response, and passes normalized options to the client wheel component.
- Google API credentials and spreadsheet identifiers remain server-side environment variables and are never exposed to the browser.
- The wrapper handles missing configuration, API failures, malformed rows, and an empty sheet with a clear user-facing error or usable fallback state.
- The sheet format should use one option per row in a documented column and ignore blank rows.
- The integration should use a bounded request strategy appropriate for a public read-only sheet, with caching or revalidation to avoid fetching the sheet on every client interaction.

## Technical Constraints

- Next.js 16 App Router with React 19 and TypeScript.
- Tailwind CSS 4 through the existing PostCSS setup unless a small local stylesheet is more appropriate.
- Client-side interaction state only for the first release; source options come from the server-side Google Sheets wrapper.
- The primary wheel animation uses the Canvas API.
- No new dependency is required for the core wheel interaction unless implementation needs become materially complex.

## Accessibility and Quality

- All actions have keyboard-accessible controls and visible focus states.
- The result and spin state use appropriate live-region semantics without producing noisy announcements.
- Motion respects `prefers-reduced-motion`.
- Audio respects browser autoplay restrictions and provides a usable muted or unavailable-audio state.
- Text and controls maintain sufficient contrast and do not depend on color alone.
- Lint and production build pass before a phase is marked complete.

## Open Product Decisions

- **Default options:** Suggested starting point: a small whimsical set that demonstrates the interaction while remaining easy to replace.
- **Persistence:** Suggested first release behavior: session-only state; local storage can be evaluated after the core flow is proven.
- **Wheel style:** Suggested first release behavior: Canvas-rendered sections with a fixed pointer and a predictable random selection.
- **History:** Suggested first release behavior: show only the latest result; add result history only if repeated spins need it.

## HTML-in-Canvas Experiment

The `/wheel/html` route implemented the proposed HTML-in-Canvas API (`layoutsubtree`, `drawable`, `drawElementImage`) behind Chrome's `#canvas-draw-element` flag. The experiment was **parked, not failed**:

- The API exists only in Chrome Canary behind a flag and throws `InvalidStateError` when called before the browser has recorded an element snapshot, which pushes all drawing into the `paint` event lifecycle.
- Measured against the plain Canvas wheel, the DOM-snapshot path was not more performant — each frame still pays a full 2D pass plus snapshot overhead, and the extra `paint`-event indirection complicates the spin animation that currently runs off a `requestAnimationFrame` loop.
- The implementation is too new: the spec is an active WICG draft, the IDL is changing, and even the labeled samples warn they need updating.

**Revisit when:** the feature ships to stable Chrome without a flag (or at least to origin trial), and the WICG example suite stops marking demos as needing updates. At that point Task 8 reopens against the same normalized entries contract as the Canvas wheel.

Until then, the experimental route remains in the tree with a graceful `fillText` fallback so `/wheel/html` degrades to the plain Canvas behavior in unsupported browsers.

These decisions should be resolved before the interaction phase is marked complete if they affect acceptance behavior.

## Learning Materials

- Next.js App Router: https://nextjs.org/docs/app
- React state and interactivity: https://react.dev/learn
- TypeScript handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- Tailwind CSS: https://tailwindcss.com/docs
- WAI-ARIA live regions: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
