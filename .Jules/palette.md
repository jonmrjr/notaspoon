# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2024-05-23 - Interactive Button Feedback
**Learning:** Playwright's `get_by_role` is highly sensitive to dynamic ARIA label updates; using it to re-query an element after its label changes causes failures.
**Action:** When verifying dynamic accessibility states (like an ARIA label changing from "Buy" to "Added"), use a stable CSS selector for the element handle and assert the property changes on that handle.
