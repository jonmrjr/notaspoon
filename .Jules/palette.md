# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2026-05-22 - Layout Stability
**Learning:** Interactive buttons with text state changes (e.g., "buy" -> "added!") cause layout shifts if not fixed-width.
**Action:** Use fixed width classes (e.g., `w-32`) for buttons with dynamic text content to prevent UI jank.
