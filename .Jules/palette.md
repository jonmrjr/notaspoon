# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2025-05-22 - Tailwind State Overrides
**Learning:** Dynamic state changes (like "added!" button feedback) in this environment require inline styles to reliably override Tailwind hover classes.
**Action:** Use `element.style.backgroundColor` instead of toggling utility classes for temporary state overrides.
