const { app, BrowserWindow, dialog, ipcMain ,shell} = require('electron');
const fs = require('fs');
const path = require('path');
const windowKeeper=require('electron-window-state');









ipcMain.handle('open-file-dialog',async()=>{
    const result=await dialog.showOpenDialog({
        properties:['openFile'],
        filters:[{name:'Text Files',extensions:['txt','md','js','json','html','css']},
        {name:'All Files',extensions:['*']}]
    });

    if(result.canceled) return null;

    const content = fs.readFileSync(result.filePaths[0],'utf-8');
    console.log(content);
    return content;

});


ipcMain.handle("save-file-dialog", async (event, text) => {
  const result = await dialog.showSaveDialog({
    filters: [{ name: "Text Files", extensions: ["txt"] }]
  });

  if (result.canceled) return;

  fs.writeFileSync(result.filePath, text);
  return true;
});






















function createWindow() {
    const mainWindowState=windowKeeper({
        defaultWidth:850,
        defaultHeight:700
    })

  const win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,

    transparent:true,
    hasShadow:false,
    // frame:false,
    vibrancy:'ultra-dark',
    backgroundmaterial:'acrylic',

    // alwaysOnTop:true,
    devtools:true,
    webPreferences: {
        contextIsolation:true,
        nodeIntegration:false,
        preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile("index.html");
}



app.whenReady().then(createWindow);

























