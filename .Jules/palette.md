# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.

## 2025-05-23 - Button Feedback Race Condition
**Learning:** Simple temporary state changes (like changing button text for 2s) can create race conditions if the user clicks again during the timeout. The timeout callback might revert the state to an incorrect value if it captures stale data (e.g. `innerHTML`), or multiple timeouts might overlap.
**Action:** Always guard temporary UI states with a flag (like checking `aria-pressed`) to prevent re-triggering the action while the feedback is active. Also, prefer restoring to a known hardcoded state rather than reading dynamic state before the change.
