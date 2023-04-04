console.log( "preload.js" );
const { ipcRenderer, contextBridge } = require('electron')


// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
  }
})


contextBridge.exposeInMainWorld('electronAPI', {
  //handleCounter: (callback) => ipcRenderer.on('update-counter', callback),
  handleItchLoginSuccess: (callback) => ipcRenderer.on('itch-login-success', callback),
  handleItchLoginFail: (callback) => ipcRenderer.on('itch-login-fail', callback),
  handleItchData: (callback) => ipcRenderer.on( 'itch-login-data', callback)
})

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,

  // we can also expose variables, not just functions

  ping: () => ipcRenderer.invoke('ping'),

});

/**
 * HERE YOU WILL EXPOSE YOUR 'myfunc' FROM main.js
 * TO THE FRONTEND.
 * (remember in main.js, you're putting preload.js
 * in the electron window? your frontend js will be able
 * to access this stuff as a result.
 */
contextBridge.exposeInMainWorld(
  "api", {
      invoke: (channel, data) => {
        /*
          let validChannels = ["myfunc"]; // list of ipcMain.handle channels you want access in frontend to
          if (validChannels.includes(channel)) {
              // ipcRenderer.invoke accesses ipcMain.handle channels like 'myfunc'
              // make sure to include this return statement or you won't get your Promise back
              return ipcRenderer.invoke(channel, data); 
          }
          */

          let validChannels = [
            "refresh-itch-login",
            "refresh-itch-data"
          ]; // list of ipcMain.handle channels you want access in frontend to
          if (validChannels.includes(channel)) {

              console.log( "preload invoke", channel );
              // ipcRenderer.invoke accesses ipcMain.handle channels like 'myfunc'
              // make sure to include this return statement or you won't get your Promise back
              return ipcRenderer.invoke(channel, data); 
          }
      },
  }
);

/*
ipcRenderer.on('asynchronous-message', function (evt, message) {
  if( message.itch_login_fail ) { handle_itch_login_fail( message.itch_login_fail ) ; }
  if( message.itch_login ) {  handle_itch_login( message.itch_login ); }
});
  


function handle_itch_login( message ) {
  console.log( message.user.cover_url );
} 
function handle_itch_login_fail( message ) {
    console.log( "FAIL", message );
} 
*/