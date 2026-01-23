# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2024-05-22 - Inline Handlers in Generated HTML
**Learning:** Product card buttons in `index.html` use `data-name` attributes to store product names and pass `this` to the `handleBuy` handler. This avoids syntax errors and escaping issues associated with passing strings directly in inline `onclick` events within template literals.
**Action:** Use `data-*` attributes for passing dynamic data to inline event handlers in vanilla JS components.
