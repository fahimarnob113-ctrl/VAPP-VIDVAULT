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
      card.className = "vid-card cursor-pointer group bg-[#1a1a1a] rounded-xl overflow-hidden relative border border-gray-800/80 shadow-lg";
      card.innerHTML = `
        <div class="aspect-video bg-gradient-to-br from-gray-900 to-black relative flex items-center justify-center overflow-hidden">
           <svg class="w-10 h-10 text-gray-700/50 group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
           <div class="play-overlay absolute inset-0 bg-indigo-900/40 backdrop-blur-[2px] opacity-0 flex items-center justify-center">
              <div class="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/50 scale-90 group-hover:scale-100 transition-transform">
                <svg class="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
           </div>
        </div>
        <div class="p-4 bg-gradient-to-b from-[#1a1a1a] to-[#121212]">
          <h3 class="text-sm font-semibold text-gray-200 truncate group-hover:text-indigo-400 transition-colors" title="${v.name}">${v.name}</h3>
          <div class="flex justify-between items-center mt-2">
            <span class="text-xs text-gray-500 font-medium bg-gray-900 px-2 py-0.5 rounded border border-gray-800">MP4</span>
            <span class="text-xs text-gray-500">${(v.size / (1024*1024)).toFixed(1)} MB</span>
          </div>
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
  
  document.getElementById('player-error').classList.add('hidden');
  dom.mainPlayer.src = url;
  
  try {
    await dom.mainPlayer.play();
  } catch (err) {
    console.error("Playback error:", err);
    document.getElementById('player-error').classList.remove('hidden');
  }

  // Load Sidecar Metadata
  dom.notesArea.value = "Loading notes...";
  const meta = await window.electronAPI.getMetadata(absolutePath);
  if (meta && meta.notes) {
    dom.notesArea.value = meta.notes;
  } else {
    dom.notesArea.value = "";
  }
}

// -- Video Player Logic --
function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Update UI on time update
dom.mainPlayer.addEventListener('timeupdate', () => {
  document.getElementById('time-current').textContent = formatTime(dom.mainPlayer.currentTime);
  const percent = (dom.mainPlayer.currentTime / dom.mainPlayer.duration) * 100;
  document.getElementById('timeline-slider').value = percent || 0;
});

// Update duration on load
dom.mainPlayer.addEventListener('loadedmetadata', () => {
  document.getElementById('time-total').textContent = formatTime(dom.mainPlayer.duration);
});

// Scrubbing
document.getElementById('timeline-slider').addEventListener('input', (e) => {
  const percent = e.target.value;
  dom.mainPlayer.currentTime = (percent / 100) * dom.mainPlayer.duration;
});

// Play / Pause
const playPauseBtn = document.getElementById('play-pause-btn');
const iconPlay = document.getElementById('icon-play');
const iconPause = document.getElementById('icon-pause');

function togglePlay() {
  if (dom.mainPlayer.paused) {
    dom.mainPlayer.play();
  } else {
    dom.mainPlayer.pause();
  }
}

playPauseBtn.addEventListener('click', togglePlay);
dom.mainPlayer.addEventListener('click', togglePlay);

dom.mainPlayer.addEventListener('play', () => {
  iconPlay.classList.add('hidden');
  iconPause.classList.remove('hidden');
});
dom.mainPlayer.addEventListener('pause', () => {
  iconPlay.classList.remove('hidden');
  iconPause.classList.add('hidden');
});

// Volume & Mute
const volumeSlider = document.getElementById('volume-slider');
const muteBtn = document.getElementById('mute-btn');
let lastVolume = 1;

volumeSlider.addEventListener('input', (e) => {
  dom.mainPlayer.volume = e.target.value;
  dom.mainPlayer.muted = (e.target.value === "0");
});

muteBtn.addEventListener('click', () => {
  if (dom.mainPlayer.muted || dom.mainPlayer.volume === 0) {
    dom.mainPlayer.muted = false;
    dom.mainPlayer.volume = lastVolume > 0 ? lastVolume : 1;
    volumeSlider.value = dom.mainPlayer.volume;
  } else {
    lastVolume = dom.mainPlayer.volume;
    dom.mainPlayer.muted = true;
    volumeSlider.value = 0;
  }
});

// Fullscreen
document.getElementById('fullscreen-btn').addEventListener('click', () => {
  const container = dom.mainPlayer.parentElement;
  if (!document.fullscreenElement) {
    container.requestFullscreen().catch(err => console.log(err));
  } else {
    document.exitFullscreen();
  }
});
