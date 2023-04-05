
  
var LLsettings = require('./conf');
var ItchAPI = require('./ItchAPI');
var APIHelper = require( './APIHelper');
var SideloadAPI = require( './SideloadAPI');


var lls = new LLsettings();
var itchapi = new ItchAPI( lls );
var sideloadapi = new SideloadAPI( lls );

//lls.test();

//sideloadapi.test();
//itchapi.test();


//const { app, BrowserWindow, ipcMain } = require('electron')
//app.quit(); 

if( true ) {

const { app, BrowserWindow, Menu, ipcMain } = require('electron')

const path = require('path')
//console.log( process );
var mainWindow;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 950,
    height: 700,
    icon: 'icon/icon_1024',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false,
      contentSecurityPolicy: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
      {
        click: () => mainWindow.webContents.send('update-counter', 1),
        label: 'Increment',
      },
      {
        click: () => mainWindow.webContents.send('update-counter', -1),
        label: 'Decrement',
      }
      ]
    }

  ])

  Menu.setApplicationMenu(menu)

  ipcMain.handle('ping', () => 'pong')

  /** 
   * FUNCTION YOU WANT ACCESS TO ON THE FRONTEND
   */
  ipcMain.handle('myfunc', async (event, arg) => {
    return new Promise(function(resolve, reject) {
      // do stuff
      if (true) {
          resolve("this worked!");
      } else {
          reject("this didn't work!");
      }
    });  
  });

  mainWindow.loadFile('index.html');

  //mainWindow.webContents.openDevTools({ mode: 'detach' })
  mainWindow.webContents.openDevTools();

};


function GetAndSend_Itch_Me() {

  itchapi.GetMe( function( success, data ) {
    if( success ) { 
      itchapi.logindata = data;
      mainWindow.webContents.send( 'itch-login-success', data );
    } else {
      mainWindow.webContents.send( 'itch-login-fail', data );
    }
  });
}


function GetAndSend_Itch_MyOwnedData() {
  itchapi.GetMyOwnedKeys( function( success, data ) {
    if( success ) { 
      mainWindow.webContents.send( 'itch-owned-data', data );
    } else {
      mainWindow.webContents.send( 'itch-owned-data-fail', data );
    }
  });
}

ipcMain.handle('refresh-itch-login', async (event, arg) => {
  return new Promise(function(resolve, reject) {
    // do stuff
    if (true) {
      GetAndSend_Itch_Me();

      resolve( "OK 100" );
    } else {
        reject("this didn't work!");
    }
  });  
});

ipcMain.handle('refresh-itch-owned-data', async (event, arg) => {
  return new Promise(function(resolve, reject) {
    // do stuff
    if (true) {
      GetAndSend_Itch_MyOwnedData();

      resolve( "OK 100" );
    } else {
        reject("this didn't work!");
    }
  });  
});


app.whenReady().then(() => {

  ipcMain.on('counter-value', (_event, value) => {
    console.log(value) // will print value to Node console
  });


  ipcMain.on('get-itch-status', (_event, value) => {
    console.log(value) // will print value to Node console
  });


  createMainWindow();


  // for mac, open a window if none are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });

  GetAndSend_Itch_Me();
  
  /*
  devtools = new BrowserWindow()
  win.loadURL('https://github.com')
  win.webContents.setDevToolsWebContents(devtools.webContents)
  win.webContents.openDevTools({ mode: 'detach' })
  */

  setTimeout( function() {
    mainWindow.webContents.send( 'app-finished-startup' );
  }, 500 );

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit(); 
  } else {
    app.quit(); // comment out to leave app running when last window closed
  }
});

}