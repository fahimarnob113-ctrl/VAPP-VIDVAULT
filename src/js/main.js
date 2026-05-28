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
  const { Readable } = require('stream');

  protocol.handle('vidvault', (request) => {
    // 1. Strip the custom scheme prefix
    let urlStr = request.url.replace('vidvault://local/', '');
    // 2. Decode the URI to get the raw absolute path string
    let absolutePath = decodeURIComponent(urlStr);
    const filePath = path.normalize(absolutePath);

    if (!fs.existsSync(filePath)) {
      return new Response('Not found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    
    // Electron's request.headers is a standard Headers object in protocol.handle
    const range = request.headers.get('Range') || request.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] && parts[1] !== "" ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      const fileStream = fs.createReadStream(filePath, { start, end });
      const webStream = Readable.toWeb(fileStream);

      return new Response(webStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        }
      });
    } else {
      const fileStream = fs.createReadStream(filePath);
      const webStream = Readable.toWeb(fileStream);

      return new Response(webStream, {
        status: 200,
        headers: {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        }
      });
    }
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
