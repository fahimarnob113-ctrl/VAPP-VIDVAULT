# VidVault - AI & Developer Handoff Guide

## Project Summary
VidVault is a local-first, high-performance video management application built with Electron. It functions as an "Obsidian for Video," allowing users to mount local folders, take markdown-based notes, and create timestamped jumping links or embedded video clips.

## Tech Stack
-   **Runtime**: Electron (Windows/Mac/Linux)
-   **Frontend**: Vanilla JavaScript (ES6+), HTML5, Vanilla CSS
-   **Icons**: Lucide Icons
-   **Persistence**: IndexedDB (via `src/js/db.js`)
-   **Build System**: npm, electron-builder

## Current Architecture (Post-Refactoring)
The application was recently refactored from a monolithic `index.html` into a modular JS structure. This makes the code much easier for AI models to handle.

### Key Files & Their Purposes:
1.  **[index.html](file:///index.html)**: The main entry point. Contains the UI layout and bootstraps the JS modules.
2.  **[src/js/state.js](file:///src/js/state.js)**: **CRITICAL.** Contains all global state (e.g., `allVideoFiles`, `currentVideo`) and DOM references. Loaded first.
3.  **[src/js/library.js](file:///src/js/library.js)**: Handles folder scanning, vault mounting, and album navigation.
4.  **[src/js/player.js](file:///src/js/player.js)**: The video player engine. Handles playback controls, subtitles, and queue logic.
5.  **[src/js/notes.js](file:///src/js/notes.js)**: Markdown parser and note-taking logic (links, tags, backlinks).
6.  **[src/js/ui.js](file:///src/js/ui.js)**: General UI interactions (sidebar, navigation, search filters).
7.  **[src/js/grid.js](file:///src/js/grid.js)**: High-performance rendering for the video thumbnail grid.
8.  **[main.js](file:///main.js)**: The Electron main process. Handles native file system access and IPC calls.

## Critical State Variables
If you are an AI modifying this app, you will need to access these (defined in `state.js`):
-   `allVideoFiles`: Array of all discovered video objects.
-   `currentVideo`: The video object currently being played.
-   `uniqueAlbums`: A `Set` of folder names found in the vault.
-   `videoQueue`: Array for the "Up Next" feature.

## Common Workflows for AI/Developers
-   **Adding a UI Component**: Add the HTML to `index.html`, style it in the CSS block (at the top of `index.html`), and handle the logic in `ui.js`.
-   **Adding a Metadata Field**: Update `db.js` if a new object store is needed, and update `player.js` or `notes.js` to save/retrieve the data via `dbPut`/`dbGet`.
-   **Debugging Errors**: Check the Electron Developer Console (Ctrl+Shift+I). Most errors now occur in the modular JS files.

## Running the App
```bash
npm install
npm run dev
```

## Building for Production
```bash
npm run build:win
```

## Design Philosophy
-   **No Placeholders**: Always use real logic or generated assets.
-   **Premium Feel**: Keep the design dark, sleek (YouTube/Spotify style), and use transitions.
-   **Offline First**: No external APIs other than Google Fonts/Lucide CDN (and these can be localed in the future).

---
*Signed, Antigravity (Advanced Agentic Coding)*
