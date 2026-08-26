# Roadmap

## 1. Homepage With Flying Books

Create the responsive landing homepage for Miss Micro's Magick Wheel, including the core visual direction, branding, primary call to action, and flying books in the background.

**Exit criteria:** The homepage is usable on desktop and mobile, the flying books remain behind the content, and the animation respects reduced-motion preferences.

## 2. Homepage Spinning Wheel Icon

Add the spinning wheel icon to the homepage and establish it as a reusable visual asset for loading and win states.

**Exit criteria:** The icon is visible, scales cleanly across viewports, and has an accessible label when it communicates status or action.

## 3. Wheel Page and Google Sheets Server Component

Build the wheel page and a server component that fetches configured wheel data through the Google Sheets API, parses it, and passes normalized entries to a client component.

**Exit criteria:** The server component fetches the configured range, ignores invalid or blank entries as specified, passes normalized options to the client, and keeps credentials server-side.

## 4. Google Sheets Loading State

Add loading, error, and empty-data states while Google Sheets data is fetched, using the homepage spinning wheel icon during loading.

**Exit criteria:** Incomplete data cannot be spun, and loading, error, and empty states are clear, responsive, and accessible.

## 5. Canvas Spinning Wheel Animation

Create the client-side Canvas wheel, calculate sections from normalized Google Sheets entries, render the wheel and pointer, and calculate the selected winner.

**Exit criteria:** Every valid entry maps to one visible section, the wheel animates to one calculated winner, and the result remains correct for different entry counts and viewport sizes.

## 6. Winner Selection Animation and Modal

Add the winner selection animation and an accessible modal that prominently displays the selected winner.

**Exit criteria:** The winner is announced visually and accessibly, the modal supports keyboard focus and close behavior, and its value matches the wheel calculation.

## 7. Spinning Music and Win Animation

Add spinning music and animate the homepage wheel icons flying across the screen after a win, with graceful handling for autoplay restrictions and reduced motion.

**Exit criteria:** Audio and win visuals start and stop with the correct wheel states, do not block the result modal, and degrade gracefully when unavailable.

## 8. HTML-in-Canvas Wheel

Build the HTML-in-Canvas version of the wheel for supported Chrome environments and provide a clear unsupported-browser experience elsewhere.

**Exit criteria:** The Chrome implementation uses the same entries and winner behavior as the Canvas version, while other browsers receive a clear availability message or fallback.
