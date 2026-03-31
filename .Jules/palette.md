# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2024-05-22 - Data Attributes for Dynamic Content
**Learning:** Dynamic HTML generation in `index.html` avoids passing strings with potential quotes directly to inline `onclick` handlers; instead, data is stored in `data-*` attributes and retrieved via `dataset`.
**Action:** Use `data-*` attributes to store context for event handlers in vanilla JS to ensure robust handling of special characters.
