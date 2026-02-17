const { app, BrowserWindow, dialog, ipcMain ,shell,Menu} = require('electron');
const fs = require('fs');
const path = require('path');
const windowKeeper=require('electron-window-state');




function createWindow() {
    const mainWindowState=windowKeeper({
        defaultWidth:700,
        defaultHeight:775
    })

    const win = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      // transparent:true,
      hasShadow:true,
      // frame:false,
      alwaysOnTop:true,
      devtools:true,
      webPreferences: {
          devtools:true,
          contextIsolation:true,
          nodeIntegration:false,
          preload: path.join(__dirname, "preload.js")
      }
    });

  
  win.loadFile("index.html");
  win.setTitle('NotePad');
}

app.whenReady().then(createWindow);