# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2024-05-22 - Micro-Interaction Feedback
**Learning:** For static sites without backend state, simulating "success" states (like "Added to cart") with temporary text/color inversion provides essential user feedback that is otherwise missing.
**Action:** Use a standardized `handleAction` function that swaps text/styles and reverts after a timeout for all future "fake" or client-side only actions.
