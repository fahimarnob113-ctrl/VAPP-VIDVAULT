# 🎬 VidVault: The Master Guide

Welcome to **VidVault**, your professional, local-first video library and knowledge base. Think of it as **"Obsidain for Videos"**—a powerful tool to organize, annotate, and connect your local video collection with a seamless, YouTube-inspired interface.

---

## 🚀 Getting Started

### 1. Launching the App
To start VidVault, simply run the **`VidVault.bat`** file in the root directory. If you are a developer or need more control, use **`dev.cmd`** to launch with the console visible.

### 2. Setting up your Vault
When you first open the app, you'll need to point it to your video collection:
1. Click **"Select Folder"** on the home screen.
2. Choose the directory where your videos are stored.
3. VidVault will automatically scan all subfolders and index your library.
   * *Note: Your video metadata and notes are stored locally on your device's IndexedDB, keeping your data private and offline.*

---

## 🖥️ The Interface

*   **Sidebar (Left):** Access your full library, sub-folders (Albums), and your custom Playlists.
*   **Search Bar (Top):** Instant results filtered by filename or path.
*   **Video Grid (Center):** View your videos with rich thumbnails and progress bars.
*   **Video Player:** A high-performance custom player with speed controls, theater mode, and deep-linking integration.
*   **Notes Panel (Right):** Your workspace for timestamped annotations and research.

---

## 📑 Core Features

### Smart Organizing
VidVault automatically categorizes videos by their folder structure into **"Albums"**. You can browse these via the sidebar to keep projects separated.

### Playlists
1. Right-click any video or click the 3-dot menu.
2. Select **"Save to Playlist"**.
3. Create a new playlist or add it to an existing one.

### Up Next & Smart Queue
The **"Up Next"** column automatically suggests videos from the same folder. You can also manually add videos to your temporary play queue via the right-click menu.

---

## 💎 The "Obsidian Mode" (Notes & Linking)

This is where VidVault shines. Use the Notes panel to the right of any playing video to build a knowledge base.

### 🖊️ Formatting
*   **Bold:** `**text**`
*   **Italic:** `_text_`
*   **HashTags:** `#Research` or `#Physics`. Tags are global; clicking a tag in the sidebar shows every video with that tag.

### 🔗 Deep Linking & Timestamps
You can create links that jump to specific moments in any video:
*   **Jump to current video:** `[[#12:30]]` (Jumps to 12 mins 30 secs).
*   **Jump to another video:** `[[Meeting-Recording#05:00]]`.
*   **Embed a Clip:** `![[Demo-Video#01:00-01:30]]`. This creates a mini-player *inside* your notes that only plays that specific segment!

### 🧠 Concept Pages
If you link to a string that isn't a video name (e.g., `[[Machine Learning]]`), VidVault creates a **Concept Page**. This page aggregates every video tagged with `#Machine-Learning` and lists every note mention of that topic across your entire library.

---

## 🛠️ Performance & Tips

*   **Resume Tracking:** VidVault automatically remembers exactly where you left off. The progress bar in the grid shows your "Watch History" at a glance.
*   **Native Context Menus:** Use the right-click context menu on thumbnails for quick actions like "Add to Queue" or "Play Now".
*   **Mini-Player:** Minimize any video to browse your library while still watching in the floating bottom bar.

---

## ❓ Troubleshooting

*   **App won't open?** Ensure you have Node.js installed. If it still fails, try running `dev.cmd` and check for error messages.
*   **Videos not showing?** Ensure the folder you selected contains supported formats (`.mp4`, `.mkv`, `.webm`, `.avi`).
*   **Lost your data?** Clear your browser cache or IndexedDB only if you want to reset your vault. Otherwise, your data is persistent!

---

*Happy Watching & Notetaking!* 🚀
