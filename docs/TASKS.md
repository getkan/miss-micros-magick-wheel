# Tasks

All tasks are ordered by dependency. Task 8 is **Blocked** following the HTML-in-Canvas experiment (see SPEC).

## 1. Homepage With Flying Books

- [Completed] Build the responsive homepage layout and visual identity.
- [Completed] Add flying books in the background without obstructing content or controls.
- [Completed] Respect reduced-motion preferences for the background animation.

**Acceptance criteria:** The homepage is usable on desktop and mobile, the flying books remain behind the content, and the animation has an accessible reduced-motion behavior.

## 2. Homepage Spinning Wheel Icon

- [Completed] Design and implement the spinning wheel icon for the homepage.
- [Completed] Reuse the icon as the visual loading and win-state asset where appropriate.

**Acceptance criteria:** The icon is visible on the homepage, scales cleanly across viewports, and has an accessible label when it communicates status or action.

## 3. Wheel Page and Google Sheets Server Component

- [Completed] Create the wheel page and its server component boundary.
- [Completed] Fetch the configured wheel data through the Google Sheets API.
- [Completed] Parse and normalize spreadsheet entries before passing them to the client component.
- [Completed] Keep API credentials and spreadsheet configuration server-side.

**Acceptance criteria:** The server component fetches the configured sheet range, ignores invalid or blank entries as specified, and passes normalized options to the client wheel component without exposing credentials.

**Dependency:** Google Sheets API credentials, spreadsheet ID, range, and row format must be configured.

## 4. Google Sheets Loading State

- [Completed] Add a loading state while wheel data is fetched.
- [Completed] Use the homepage spinning wheel icon in the loading state.
- [Completed] Add error and empty-data states for failed or unusable sheet responses.

**Acceptance criteria:** Loading, error, and empty states are clear, responsive, accessible, and prevent the wheel from presenting incomplete data.

**Dependency:** Task 3 server component and data contract.

## 5. Canvas Spinning Wheel Animation

- [Completed] Create the client-side Canvas wheel component.
- [Completed] Calculate wheel sections from parsed Google Sheets entries.
- [Completed] Render labels, sections, pointer, and current spin state on Canvas.
- [Completed] Implement deterministic winner calculation from the selected section.

**Acceptance criteria:** Every valid entry maps to one visible section, the wheel animates to one calculated winner, and the result remains correct for different entry counts and viewport sizes.

**Dependency:** Task 3 normalized data contract and Task 4 loading/error states.

## 6. Winner Selection Animation and Modal

- [Completed] Add the winner selection animation after the wheel stops.
- [Completed] Build a modal that prominently displays the selected winner.
- [Completed] Add keyboard focus management and close behavior for the modal.

**Acceptance criteria:** The winner is announced visually and accessibly, the modal can be opened and closed by keyboard, and the selected value matches the wheel calculation.

**Dependency:** Task 5 Canvas wheel selection state.

## 7. Spinning Music and Win Animation

- [Completed] Add spinning music during the wheel animation.
- [Completed] Add the homepage wheel icons flying across the screen on win.
- [Completed] Respect browser autoplay restrictions and provide a usable muted or unavailable-audio state.
- [Completed] Respect reduced-motion preferences for the win animation.

**Acceptance criteria:** Audio and win visuals start and stop with the correct wheel states, do not block the result modal, and degrade gracefully when autoplay or motion is unavailable.

**Dependency:** Task 2 wheel icon and Task 6 winner state.

## 8. HTML-in-Canvas Wheel (Parked)

- [Blocked] Prototype completed on the `/wheel/html` route with a `fillText` fallback, but the experiment did not clear the performance bar and the API is still Canary-flag-only.
- [Blocked] Reopen when the WICG proposal reaches stable Chrome or an origin trial; the route and `drawable`/`layoutsubtree` plumbing stay in the tree as the revisit starting point.

**Blocker:** The API throws `InvalidStateError` outside `paint`-event-driven drawing, and measured performance was not better than the plain Canvas wheel. Track https://github.com/WICG/html-in-canvas and https://chromestatus.com/feature/4576477137072128 for shipping signals.

**Exit criteria for reopening:** HTML-in-Canvas available in stable Chrome (or an origin trial token) without user-facing flags.

## Validation

- Automated: `npm run lint`
- Automated: `npm run build`
- Manual: Test desktop and mobile layouts, keyboard interaction, loading/error states, reduced motion, audio restrictions, winner modal behavior, and Chrome-only availability.
