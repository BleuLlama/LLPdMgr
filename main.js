const { app, BrowserWindow, ipcMain } = require('electron')

const path = require('path')

console.log( "index.js" );
console.log( process );

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: 'icon/icon_1024',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  ipcMain.handle('ping', () => 'pong')

  win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();

  // for mac, open a window if none are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit(); 
  } else {
    app.quit(); // comment out to leave app running when last window closed
  }
});