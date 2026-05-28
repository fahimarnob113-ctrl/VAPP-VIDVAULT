let currentFolderPath = null;
let currentVideoPath = null;
let mode = 'explorer'; // 'explorer' or 'vault'

const dom = {
  selectFolderBtn: document.getElementById('select-folder-btn'),
  dirTree: document.getElementById('dir-tree'),
  gridView: document.getElementById('grid-view'),
  videoGrid: document.getElementById('video-grid'),
  playerView: document.getElementById('player-view'),
  mainPlayer: document.getElementById('main-player'),
  backBtn: document.getElementById('back-btn'),
  currentFolderTitle: document.getElementById('current-folder-title'),
  notesArea: document.getElementById('notes-area'),
  saveNotesBtn: document.getElementById('save-notes-btn'),
  modeToggle: document.getElementById('mode-toggle')
};

// Initialization
dom.gridView.classList.remove('hidden');

dom.modeToggle.addEventListener('click', () => {
  mode = mode === 'explorer' ? 'vault' : 'explorer';
  dom.modeToggle.innerText = `Mode: ${mode === 'explorer' ? 'Open Explorer' : 'Indexed Vault'}`;
  // For MVP, we primarily support Open Explorer. Indexed Vault is a placeholder for future db logic.
});

dom.selectFolderBtn.addEventListener('click', async () => {
  const folderPath = await window.electronAPI.selectFolder();
  if (folderPath) {
    currentFolderPath = folderPath;
    dom.currentFolderTitle.innerText = folderPath.split('\\').pop() || folderPath;
    loadDirectory(folderPath);
  }
});

dom.backBtn.addEventListener('click', () => {
  dom.mainPlayer.pause();
  dom.mainPlayer.src = "";
  currentVideoPath = null;
  dom.playerView.classList.add('hidden');
  dom.gridView.classList.remove('hidden');
});

dom.saveNotesBtn.addEventListener('click', async () => {
  if (!currentVideoPath) return;
  const notes = dom.notesArea.value;
  const data = { notes, updatedAt: Date.now() };
  const success = await window.electronAPI.saveMetadata(currentVideoPath, data);
  if (success) {
    dom.saveNotesBtn.innerText = "Saved!";
    setTimeout(() => { dom.saveNotesBtn.innerText = "Save Metadata"; }, 2000);
  }
});

async function loadDirectory(dirPath) {
  dom.dirTree.innerHTML = `<div class="p-2 text-sm text-gray-400">Loading...</div>`;
  const entries = await window.electronAPI.readDirectory(dirPath);
  
  // Render Tree (Folders)
  const folders = entries.filter(e => e.isDirectory);
  dom.dirTree.innerHTML = '';
  if (folders.length === 0) {
    dom.dirTree.innerHTML = `<div class="text-sm text-gray-500 italic p-2">No subfolders.</div>`;
  } else {
    folders.forEach(f => {
      const el = document.createElement('div');
      el.className = "cursor-pointer p-2 hover:bg-yt-hover rounded text-sm text-gray-300 truncate";
      el.innerText = `📁 ${f.name}`;
      el.title = f.path;
      el.addEventListener('click', () => {
        currentFolderPath = f.path;
        dom.currentFolderTitle.innerText = f.name;
        loadDirectory(f.path);
      });
      dom.dirTree.appendChild(el);
    });
  }

  // Render Grid (Videos)
  const videos = entries.filter(e => !e.isDirectory && e.name.match(/\.(mp4|mkv|webm|avi|mov|m4v)$/i));
  dom.videoGrid.innerHTML = '';
  
  if (videos.length === 0) {
    dom.videoGrid.innerHTML = `<div class="col-span-full text-center text-gray-500 py-10">No videos found in this folder.</div>`;
  } else {
    videos.forEach(v => {
      const card = document.createElement('div');
      card.className = "vid-card cursor-pointer group bg-yt-dark rounded-lg overflow-hidden relative border border-transparent hover:border-gray-600 transition";
      card.innerHTML = `
        <div class="aspect-video bg-black relative flex items-center justify-center">
           <span class="text-gray-500 text-xs">Video Placeholder</span>
           <div class="play-overlay absolute inset-0 bg-black/40 opacity-0 transition flex items-center justify-center">
              <div class="w-12 h-12 bg-yt-red rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
           </div>
        </div>
        <div class="p-3">
          <h3 class="text-sm font-semibold text-yt-lightText truncate" title="${v.name}">${v.name}</h3>
          <p class="text-xs text-gray-400 mt-1">${(v.size / (1024*1024)).toFixed(2)} MB</p>
        </div>
      `;
      card.addEventListener('click', () => playVideo(v.path));
      dom.videoGrid.appendChild(card);
    });
  }
}

async function playVideo(absolutePath) {
  currentVideoPath = absolutePath;
  const url = window.electronAPI.getFileUrl(absolutePath);
  
  dom.gridView.classList.add('hidden');
  dom.playerView.classList.remove('hidden');
  
  dom.mainPlayer.src = url;
  dom.mainPlayer.play();

  // Load Sidecar Metadata
  dom.notesArea.value = "Loading notes...";
  const meta = await window.electronAPI.getMetadata(absolutePath);
  if (meta && meta.notes) {
    dom.notesArea.value = meta.notes;
  } else {
    dom.notesArea.value = "";
  }
}
