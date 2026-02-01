# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2024-05-22 - Visual Feedback State Management
**Learning:** When using vanilla JS with Tailwind to implement temporary visual states (like "added!"), using inline styles (`element.style`) provides a more reliable override than toggling Tailwind utility classes, avoiding specificity wars or complex class string manipulation.
**Action:** For simple, temporary state changes in this project, prefer direct style manipulation over class toggling to ensure the feedback is immediately visible and easily reversible.
