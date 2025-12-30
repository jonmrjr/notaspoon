# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2025-05-22 - Game State Focus Management
**Learning:** In canvas-based games where the UI is overlaid, returning to the "Menu" or "Game Over" state often leaves keyboard focus lost (on the body or canvas).
**Action:** Always programmatically move focus (`.focus()`) to the primary action button (e.g., "Play Again") when the UI panel reappears or expands, ensuring keyboard users can immediately navigate.
