# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2024-05-22 - Improving Vanilla JS Interaction
**Learning:** `index.html` generates UI via template literals in JS (`renderProducts`). Adding interactivity requires passing arguments (like `product.name` or `this`) directly in the HTML string handlers, which can get messy.
**Action:** Use `data-` attributes for state (like `data-state="added"`) to manage visual feedback logic cleanly without complex frameworks.
