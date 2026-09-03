const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const https = require('https');

let mainWindow;

const SERVER_URL = 'https://mail.kreatixtech.com';
const HEALTH_ENDPOINT = '/api/health';

function checkServerReachable() {
  return new Promise((resolve) => {
    const req = https.get(`${SERVER_URL}${HEALTH_ENDPOINT}`, { timeout: 5000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

async function waitForServer(maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    const reachable = await checkServerReachable();
    if (reachable) return true;
    console.log(`[Kreatix Mail] Waiting for server... attempt ${i + 1}/${maxAttempts}`);
    await new Promise(r => setTimeout(r, 2000));
  }
  return false;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Kreatix Mail',
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'electron-preload.cjs'),
      webSecurity: false,
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      require('electron').shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  Menu.setApplicationMenu(null);
}

app.whenReady().then(async () => {
  const isDev = !app.isPackaged;

  if (!isDev) {
    const reachable = await waitForServer();
    if (!reachable) {
      console.error('[Kreatix Mail] Could not reach server after multiple attempts. Loading anyway...');
    }
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
