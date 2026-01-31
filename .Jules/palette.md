# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2024-05-23 - Button State Management
**Learning:** Changing button text (e.g., "buy" -> "added!") causes layout shifts if the container width isn't fixed.
**Action:** Use fixed width utility classes (e.g., `w-32`) for interactive elements that change text content to ensure UI stability.
