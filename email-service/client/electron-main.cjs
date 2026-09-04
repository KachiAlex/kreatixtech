const { app, BrowserWindow, Menu, session } = require('electron');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');

let mainWindow;
let server;

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

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function startLocalServer(distDir) {
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath === '/') urlPath = '/index.html';
      const filePath = path.join(distDir, urlPath);
      const ext = path.extname(filePath);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        });
        res.end(data);
      });
    });
    s.listen(0, '127.0.0.1', () => {
      const port = s.address().port;
      resolve(port);
    });
    server = s;
  });
}

function createWindow(localUrl) {
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
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadURL(localUrl);
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

  let url;
  if (isDev) {
    url = 'http://localhost:5173';
  } else {
    const distDir = path.join(__dirname, 'dist');
    const port = await startLocalServer(distDir);
    url = `http://127.0.0.1:${port}`;
    console.log(`[Kreatix Mail] Local server running on ${url}`);
  }

  createWindow(url);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(url);
  });
});

app.on('window-all-closed', () => {
  if (server) { server.close(); server = null; }
  if (process.platform !== 'darwin') app.quit();
});
