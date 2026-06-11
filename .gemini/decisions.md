# Decisions - Resume Builder

## ADR 1: Global State Proxy
* **Context**: The legacy scripts referenced the variable `PROFILE` in hundreds of distinct DOM insertion and DOCX packaging functions.
* **Decision**: Declared a dynamic JS `Proxy` wrapper:
  ```javascript
  const PROFILE_PROXY = new Proxy({}, {
    get(target, prop) { return getActiveProfile()[prop]; }
  });
  const PROFILE = PROFILE_PROXY;
  ```
* **Consequence**: Avoided the risk of breaking data bindings and eliminated the need to refactor hundreds of static references.

## ADR 2: CDN-Based Library Loading
* **Context**: The original repository had over 23,000 lines of inlined JS utility libraries.
* **Decision**: Removed inlined files and referenced `https://cdn.jsdelivr.net/npm/docx@7.3.0/build/index.js` directly.
* **Consequence**: Optimized repo asset size and improved performance.
