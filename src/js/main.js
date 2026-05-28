const { app, BrowserWindow, ipcMain, protocol, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Register custom scheme before app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'vidvault', privileges: { bypassCSP: true, supportFetchAPI: true, stream: true } }
]);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../index.html'));
  
  // Optionally open DevTools
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  // Register modern custom protocol for video streaming
  const { net } = require('electron');
  protocol.handle('vidvault', (request) => {
    // request.url is safely encoded. Just replace the scheme.
    const fileUrl = request.url.replace('vidvault://local/', 'file:///');
    
    // Use Electron's native net.fetch which handles Range requests automatically!
    return net.fetch(fileUrl, {
      headers: request.headers
    });
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC Handlers ---

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0] || null;
});

ipcMain.handle('read-directory', async (_, dirPath) => {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries.map(e => {
      const isDir = e.isDirectory();
      const fullPath = path.join(dirPath, e.name);
      let size = 0;
      let lastModified = 0;
      
      if (!isDir) {
        try {
          const stat = fs.statSync(fullPath);
          size = stat.size;
          lastModified = stat.mtimeMs;
        } catch(err) {}
      }

      return {
        name: e.name,
        path: fullPath,
        isDirectory: isDir,
        size,
        lastModified
      };
    });
  } catch (error) {
    console.error("Error reading directory:", error);
    return [];
  }
});

ipcMain.handle('save-metadata', async (_, videoPath, data) => {
  try {
    const metaPath = videoPath + '.meta.json';
    fs.writeFileSync(metaPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error("Error saving metadata:", error);
    return false;
  }
});

ipcMain.handle('get-metadata', async (_, videoPath) => {
  try {
    const metaPath = videoPath + '.meta.json';
    if (fs.existsSync(metaPath)) {
      return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    }
    return null;
  } catch (error) {
    console.error("Error getting metadata:", error);
    return null;
  }
});
