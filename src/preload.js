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


/// these are the things we receive from MAIN to RENDERER
contextBridge.exposeInMainWorld( 'electronAPI', {
  //handleCounter: (callback) => ipcRenderer.on('update-counter', callback),
  appFinishedStartup: (callback) => ipcRenderer.on( 'app-finished-startup', callback),

  handleItchLoginSuccess: (callback) => ipcRenderer.on( 'itch-login-success', callback),
  handleItchLoginFail: (callback) => ipcRenderer.on( 'itch-login-fail', callback),
  handleItchOwnedData: (callback) => ipcRenderer.on( 'itch-owned-data', callback),
  handleItchOwnedDataFail: (callback) => ipcRenderer.on( 'itch-owned-data-fail', callback),

  handleSideloadLoginSuccess: (callback) => ipcRenderer.on( 'sideload-login-success', callback),
  handleSideloadLoginFail: (callback) => ipcRenderer.on( 'sideload-login-fail', callback),
  handleSideloadGameList: (callback) => ipcRenderer.on( 'sideload-game-list', callback),
  handleSideloadGameListFail: (callback) => ipcRenderer.on( 'sideload-game-list-fail', callback)
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
        console.log( "Invoke", channel );

        // these are the items we send from the renderer to MAIN
          let validChannels = [
            "refresh-itch-login",
            "refresh-itch-owned-data",
            "refresh-sideloads",
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
