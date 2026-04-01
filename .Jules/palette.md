# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2026-02-02 - Safe HTML Generation
**Learning:** `index.html` generates product cards using template literals. Inline event handlers (like `onclick`) break if data contains quotes.
**Action:** Avoid passing dynamic strings to inline handlers. Pass `this` and access data attributes, or rely on event delegation. For `aria-label`, always escape quotes.
