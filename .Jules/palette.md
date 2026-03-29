# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2024-05-22 - Dynamic Visual Feedback
**Learning:** When implementing temporary visual feedback (like "added!" state) on elements styled with Tailwind, inline styles (`element.style`) are reliable for overriding utility classes. Critically, these must be explicitly cleared (set to `""`) to restore the original Tailwind hover states.
**Action:** Use inline styles for temporary overrides, but always ensure cleanup to restore class-based styling. Also, use fixed width classes (like `w-32`) to prevent layout jank when text content changes.
