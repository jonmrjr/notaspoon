## 2025-12-22 - [Blind Loading State]
**Learning:** The application had a full CSS loading screen implementation that was unused, leading to users staring at a blank screen during async model loading.
**Action:** Reuse existing "dead" code (CSS) to implement a proper loading state rather than writing new components. Check for unused assets before building new ones.

## 2024-05-21 - [Infinite Loading Trap]
**Learning:** Visual components (like loading screens) must have their lifecycle states (enter, active, exit) explicitly managed in logic, not just defined in CSS. CSS animations alone cannot handle logical state transitions like "loading complete".
**Action:** Always verify the "exit condition" of any overlay or modal during implementation.
