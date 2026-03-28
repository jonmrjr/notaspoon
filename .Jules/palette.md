# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2024-05-22 - Micro-Interaction State Management
**Learning:** Dynamic UI updates (like temporary feedback) need to ensure they clean up aria attributes (like `aria-pressed`) to avoid leaving screen readers with stale state.
**Action:** Always implement a revert/cleanup phase for any timed micro-interaction that modifies ARIA states.
