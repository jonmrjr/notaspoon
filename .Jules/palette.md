# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2025-02-24 - Dynamic State & Tailwind
**Learning:** Dynamic visual state changes in `index.html` (like the "added!" feedback) use inline styles to override Tailwind classes. These must be explicitly cleared (set to empty string) to restore original Tailwind hover effects.
**Action:** Always clean up inline styles in `setTimeout` or event handlers when reverting state.
