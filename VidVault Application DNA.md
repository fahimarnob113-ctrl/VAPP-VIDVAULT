# VidVault Application DNA

## 1. Overview
VidVault is an offline Video Vault application built with Electron, functioning like a localized, private YouTube experience. It allows users to scan their local directories for video files, organize them into playlists, tag them, and seamlessly play them back using a customized, highly functional native video player. All metadata, processing, and playback remain entirely offline.

## 2. Design & UI Aesthetics
- **Theme:** Default Dark Mode (`class="dark"`), using a YouTube-inspired color palette (`yt-black`, `yt-dark`, `yt-red`, `yt-blue`, `yt-hover`, `yt-lightText`).
- **Framework:** Vanilla HTML/JS, Tailwind CSS for robust styling and grid layouts, and Lucide for vector iconography.
- **Layout Structure:**
  - **Top Navigation Bar:** Persistent header with global Search, menu toggle, and Vault Folder status.
  - **Sidebar Menu:** Dynamic, scrollable sidebar providing quick access to Home, Watch History, Liked Videos, custom Playlists, Local Albums (auto-extracted from sub-folders), and Tag aggregations.
  - **Main Content Area:** A responsive video grid displaying thumbnails with contextual hover menus, advanced filtering (Duration, Size, Status), and sorting options.
  - **Player View:** Detailed split-view showing the main video player, title/metadata, action buttons, dynamic markdown notes section, and an "Up Next" queue.
  - **Mini-Player:** A persistent, Spotify-style mini-player bar pinned at the bottom, allowing playback to continue while browsing the vault grid.
- **Component Aesthetics:**
  - Glass-panel aesthetic for modals (e.g., initial vault setup and save-to-playlist dialogues).
  - Smooth micro-animations (e.g., hover scaling, slide-in from bottom, context menus).

## 3. Core Features & Functionality
- **Local File Interfacing & Streaming:**
  - Uses the native system dialog (via Electron IPC) to mount and select a local "Vault" folder.
  - Recursively scans the directory for compatible media (`.mp4`, `.mkv`, `.webm`, `.mov`, `.avi`, `.m4v`).
  - Implements a custom protocol `vidvault://local/` to stream local files chunk-by-chunk securely, bypassing Chromium CSP rules and enabling smooth seeking on massive files via HTTP Range requests.
- **Video Management & Curation:**
  - **Sorting & Filtering:** Sort by Name, Size, Duration, or Last Modified. Advanced filtering by file size brackets, duration brackets, and a triage "Cull Status" (Starred/Neutral/Dump).
  - **Playlists & Queuing:** Users can create persistent custom playlists, add videos to an active session queue, and monitor the next item via a floating widget.
  - **Watch History & Likes:** System automatically logs played videos and user likes/dislikes.
- **Advanced Player Controls:**
  - Custom UI overlay on top of an HTML5 `<video>` element.
  - Capabilities include: Skip forward/backward (10s), precise playback speed adjustment (0.5x - 2.0x), custom timeline scrubbing, volume slider, fullscreen, loop/repeat toggles, and UI minimization.
- **Interactive Knowledge Base & Note-Taking:**
  - Comprehensive markdown-enabled notes editor strictly tied to individual videos, with toggleable preview/edit modes.
  - Tooling to insert timestamp links, embed mini-clips of the current video, and link to or embed other videos from the vault directly into the notes.
  - **Backlinking:** Auto-generated list of "Linked Mentions" showing which other videos reference the current one.
  - **Concept View:** Virtual, auto-aggregated topic pages that collect all videos and clip mentions sharing a specific `#tag` or concept, showcasing an interconnected knowledge network.

## 4. Technical Architecture
- **Environment:** Electron Shell combining a Node.js backend with a Chromium browser frontend.
- **Backend (Main Process - `main.js`):**
  - Bootstraps the application window and establishes secure context isolation.
  - Registers the `vidvault` protocol and securely proxies file read streams to the frontend using Node's `fs` module.
  - Handles the file-system crawling and metadata extraction, passing sanitized object arrays to the UI.
- **Bridge (Preload - `preload.js`):**
  - Exposes `electronAPI` with strictly defined, uni-directional and bidirectional IPC methods (`selectFolder`, `getVideoFiles`, `getFileUrl`). Protects against arbitrary file system access.
- **Frontend (Renderer Process - `src/js/app.js` & siblings):**
  - Monolithic/modular vanilla JS handling the DOM lifecycle, state management, UI rendering, and local storage.
  - Storage is likely persisted via `localStorage` or `IndexedDB` to handle tags, notes, play history, and user settings seamlessly between sessions.
  - Dynamic thumbnail generation utilizing a hidden `<canvas>` element to extract frames directly from local videos without external dependencies.
