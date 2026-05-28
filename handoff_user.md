# VidVault — User Handoff & Product Vision Document

This guide explains how to use VidVault, lists its key capabilities, and breaks down the vision for an alternate "open-explorer" version (FastStone Image Viewer style) versus the current "database-catalog" version (Adobe Lightroom style).

---

## 1. Feature Checklist & How-To

VidVault is a local-first multimedia note-taking tool that works like "Obsidian for Video." Here are the core user flows:

### Mounting a Video Vault
- On launch, select a local folder on your computer.
- VidVault scans the folder recursively, importing all files and organizing sub-folders under **Local Albums** in the sidebar.

### Browsing & Filtering
- **Video Cards Grid**: Rendered with dynamic, color-gradient thumbnails that scale and show overlay play indicators on hover.
- **Sorting Options**: Sort the list by file name, file size, duration, or date modified (using ascending or descending ordering).
- **Advanced Filters Drawer**: Open the sliders menu to filter by length (short, medium, long), file size (under 100MB, 1GB+, etc.), and cull status (Starred, Neutral, Dump).

### Video Playback & Custom Controls
- Clicking a video opens the player view.
- **Custom controls bar**: Timeline progress seek, volume slider (hover to expand), playback rate adjustments (0.5x, 1x, 2x), cc button, repeat loop, and fullscreen.
- **Spotify-style Mini Bar**: Minimizing the video shrinks it into a glassmorphic bar at the bottom, allowing you to browse the grid while the audio/video keeps playing.

### Markdown Note-Taking
- Take notes in the right sidebar. Use Obsidian markdown links to reference other parts:
  - **Timestamp Links**: Click the **Time** toolbar button or press `Ctrl + T` to insert `[[#MM:SS]]`. Clicking this jumps directly to that timestamp in the video.
  - **Reference Links**: Use `[[VideoName.mp4]]` to link videos. Type `[[` to open an autocomplete drop-down suggestion list.
  - **Embedded Clips**: Click the **Clip** button to insert `![[VideoName#MM:SS]]` to embed video loops.
  - **Tags**: Use hashtags (e.g. `#tutorial`). These automatically populate the tags index in the sidebar.
  - **Linked Mentions / Backlinks**: Scroll down to see other videos that mention the current video in their notes.
  - **Topic Nodes (Concept Pages)**: Click on a hashtag or tag item. It opens a virtual note page aggregating all clips and videos mentioning that topic.

---

## 2. Product Vision: Managed Database vs. Open File Explorer

You are planning to build an alternate, "more open" version of this app. The two product philosophies are compared below:

```
+------------------------------------------------------------+
|                VIDVAULT PRODUCT EVOLUTION                  |
+------------------------------------------------------------+
|                                                            |
|  [ Current Version ]               [ Planned Alternate ]   |
|   Lightroom Catalog                 FastStone Explorer     |
|   (Database Managed)               (Open File System)      |
|           |                                 |              |
|   - Mounted Vault Root Only         - Browse System Files  |
|   - Metadata in IndexedDB           - Sidecar Meta Files   |
|   - Internal App Playlists          - Simple Folder Lists  |
|   - High-setup Catalog              - Portable folders     |
|                                                            |
+------------------------------------------------------------+
```

### Philosophy A: The "Lightroom Classic" Catalog (Current)
This version treats the app as a closed workstation:
- **Pros**:
  - Centralized queries are fast (finding all tags, playlists, and watch history takes a single database read).
  - Keeps local folders clean (no extra files are generated).
- **Cons**:
  - Locked down. You cannot easily browse folders outside the vault.
  - If you move a file using Windows Explorer, the notes database loses track of it.
  - It is hard to share notes or backup specific folder annotations without exporting the whole IndexedDB.

### Philosophy B: The "FastStone Viewer" / Explorer (Alternate)
This version treats the app as a transparent overlay on top of the user's existing filesystem:
- **Pros**:
  - **Extreme Portability**: Metadata, tags, and notes are saved directly inside sidecar files (`video_name.meta.json` or `.md`) in the same folder. Copying the folder to a flash drive copies all notes automatically.
  - **System Freedom**: You can navigate to any drive or folder instantly. No "mounting" or "scanning the whole vault" setup is required.
  - **Interoperability**: You can edit sidecar files in other tools (like Notepad++ or Obsidian) and they sync instantly in the viewer.
- **Cons**:
  - Scanning nested folder sub-trees for global backlinks requires scanning files on-the-fly, which is slower than a database.
  - Leaves sidecar meta files in your video directories.
