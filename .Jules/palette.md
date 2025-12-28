# Palette's Journal

## 2024-05-22 - Initial Assessment
**Learning:** The application uses raw DOM manipulation in `app.js` to create the UI, which makes state management and accessibility updates a bit manual.
**Action:** When adding accessibility features, I need to ensure I update the DOM elements directly in the event listeners or update loops.
## 2024-05-22 - Loading State Synchronization
**Learning:** CSS Animations for loading states are brittle if JS relies on fixed timers. Use `animationend` events for robust synchronization to ensure the loading screen is fully removed only after the visual transition completes.
**Action:** Replace `setTimeout` with `addEventListener('animationend', ...)` for all future transition-based state changes.
