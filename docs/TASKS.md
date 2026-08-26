# Tasks

All tasks are ordered by dependency and are currently **Not started**.

## 1. Homepage With Flying Books

- [Not started] Build the responsive homepage layout and visual identity.
- [Not started] Add flying books in the background without obstructing content or controls.
- [Not started] Respect reduced-motion preferences for the background animation.

**Acceptance criteria:** The homepage is usable on desktop and mobile, the flying books remain behind the content, and the animation has an accessible reduced-motion behavior.

## 2. Homepage Spinning Wheel Icon

- [Not started] Design and implement the spinning wheel icon for the homepage.
- [Not started] Reuse the icon as the visual loading and win-state asset where appropriate.

**Acceptance criteria:** The icon is visible on the homepage, scales cleanly across viewports, and has an accessible label when it communicates status or action.

## 3. Wheel Page and Google Sheets Server Component

- [Not started] Create the wheel page and its server component boundary.
- [Not started] Fetch the configured wheel data through the Google Sheets API.
- [Not started] Parse and normalize spreadsheet entries before passing them to the client component.
- [Not started] Keep API credentials and spreadsheet configuration server-side.

**Acceptance criteria:** The server component fetches the configured sheet range, ignores invalid or blank entries as specified, and passes normalized options to the client wheel component without exposing credentials.

**Dependency:** Google Sheets API credentials, spreadsheet ID, range, and row format must be configured.

## 4. Google Sheets Loading State

- [Not started] Add a loading state while wheel data is fetched.
- [Not started] Use the homepage spinning wheel icon in the loading state.
- [Not started] Add error and empty-data states for failed or unusable sheet responses.

**Acceptance criteria:** Loading, error, and empty states are clear, responsive, accessible, and prevent the wheel from presenting incomplete data.

**Dependency:** Task 3 server component and data contract.

## 5. Canvas Spinning Wheel Animation

- [Not started] Create the client-side Canvas wheel component.
- [Not started] Calculate wheel sections from parsed Google Sheets entries.
- [Not started] Render labels, sections, pointer, and current spin state on Canvas.
- [Not started] Implement deterministic winner calculation from the selected section.

**Acceptance criteria:** Every valid entry maps to one visible section, the wheel animates to one calculated winner, and the result remains correct for different entry counts and viewport sizes.

**Dependency:** Task 3 normalized data contract and Task 4 loading/error states.

## 6. Winner Selection Animation and Modal

- [Not started] Add the winner selection animation after the wheel stops.
- [Not started] Build a modal that prominently displays the selected winner.
- [Not started] Add keyboard focus management and close behavior for the modal.

**Acceptance criteria:** The winner is announced visually and accessibly, the modal can be opened and closed by keyboard, and the selected value matches the wheel calculation.

**Dependency:** Task 5 Canvas wheel selection state.

## 7. Spinning Music and Win Animation

- [Not started] Add spinning music during the wheel animation.
- [Not started] Add the homepage wheel icons flying across the screen on win.
- [Not started] Respect browser autoplay restrictions and provide a usable muted or unavailable-audio state.
- [Not started] Respect reduced-motion preferences for the win animation.

**Acceptance criteria:** Audio and win visuals start and stop with the correct wheel states, do not block the result modal, and degrade gracefully when autoplay or motion is unavailable.

**Dependency:** Task 2 wheel icon and Task 6 winner state.

## 8. HTML-in-Canvas Wheel

- [Not started] Build the HTML-in-Canvas version of the wheel.
- [Not started] Limit this implementation to supported Chrome environments.
- [Not started] Provide a clear unsupported-browser experience outside Chrome.
- [Not started] Keep winner selection behavior consistent with the Canvas version.

**Acceptance criteria:** The HTML-in-Canvas wheel works in supported Chrome, uses the same normalized entries and winner behavior, and presents a clear fallback or availability message in other browsers.

**Dependency:** Tasks 3 through 6 and confirmation of the target Chrome API support.

## Validation

- Automated: `npm run lint`
- Automated: `npm run build`
- Manual: Test desktop and mobile layouts, keyboard interaction, loading/error states, reduced motion, audio restrictions, winner modal behavior, and Chrome-only availability.
