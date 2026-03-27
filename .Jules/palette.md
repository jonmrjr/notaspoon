# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2026-10-18 - Interactive Feedback Patterns
**Learning:** Using `style.backgroundColor` override combined with `data-state` attributes allows for lightweight, performant feedback states in vanilla JS without complex class toggling logic, but requires careful cleanup of inline styles.
**Action:** Use this pattern for simple, temporary state changes (like "added!" confirmation) to avoid layout shifts or CSS specificity wars.
