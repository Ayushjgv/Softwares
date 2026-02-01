import { app, BrowserWindow, dialog, ipcMain, shell, Menu } from 'electron';
import fs from 'fs';
import path from 'path';
import windowKeeper from 'electron-window-state';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



function createWindow() {
    const mainWindowState=windowKeeper({
        defaultWidth:380,
        defaultHeight:480
    })

    const win = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      // transparent:true,
      hasShadow:true,
      // frame:false,
      devtools:true,
      webPreferences: {
          devtools:true,
          contextIsolation:true,
          nodeIntegration:false,
          preload: path.join(__dirname, "preload.js")
      }
    });

  
  win.loadURL("http://localhost:5173");
    // win.loadFile("dist/index.html");
  win.setTitle('calculator');
}




app.whenReady().then(createWindow);