const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
  saveMetadata: (videoPath, data) => ipcRenderer.invoke('save-metadata', videoPath, data),
  getMetadata: (videoPath) => ipcRenderer.invoke('get-metadata', videoPath),
  // Utility for constructing video URLs for the frontend
  getFileUrl: (absolutePath) => {
      // Normalize slashes and encode for URI
      const normalizedPath = absolutePath.replace(/\\/g, '/');
      // Only encode the components, keeping the slashes intact
      const encodedPath = normalizedPath.split('/').map(encodeURIComponent).join('/');
      return `vidvault://local/${encodedPath}`;
  }
});
