# AGENTS.md

## Cursor Cloud specific instructions

This is a zero-dependency static Sudoku web app (vanilla HTML/CSS/JS). There is no build step, no backend, and no database.

- **Run the app**: it is a static site. Serve the repo root over HTTP and open `index.html`, e.g. `python3 -m http.server 8000` then visit `http://localhost:8000/index.html`. Opening the `file://` path also works, but a static server is preferred for browser-based testing.
- **Test**: `npm test` (runs Node's built-in test runner `node --test` against `test/sudoku.test.js`). Requires Node 18+ only; no `npm install` needed since there are no dependencies.
- **Lint/build**: there is no linter or build config in this repo.
- `app.js` serves double duty: it wires up the browser game on `DOMContentLoaded` and also `module.exports` its pure functions for the Node tests. Keep both the browser and `module.exports` branches working when editing it.
