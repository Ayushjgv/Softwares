const { app, BrowserWindow, dialog, ipcMain ,shell,Menu,globalShortcut} = require('electron');
const fs = require('fs');
const path = require('path');
const windowKeeper=require('electron-window-state');

const snapshotsDir = path.join(app.getPath("userData"), "snapshots");
let temp;
if (!fs.existsSync(snapshotsDir)) {
  fs.mkdirSync(snapshotsDir);
}
const snapshotFile = path.join(app.getPath("userData"), "snapshot.txt");



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
      // transparent:true,
      hasShadow:true,
      // frame:false,
      setAlwaysOnTop:true,
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

  //devtools

  win.webContents.on('before-input-event', (event, input) => {
    if (
      (input.control && input.shift && input.key.toLowerCase() === 'i') ||
      input.key === 'F12'
    ) {
      event.preventDefault();
    }

  });


  //always on top

  let isPinned = false;

  ipcMain.handle('pin', () => {
    isPinned = !isPinned;
    win.setAlwaysOnTop(isPinned);
    console.log(isPinned);
    return isPinned;
  });


  //shortcuts 

  const template=[
    {
      label:'Files',
      submenu:[
        {
          label:'open',
          accelerator:'Ctrl+O',
          click:async()=>{
            const { canceled, filePaths } = await dialog.showOpenDialog(win, {
              properties: ['openFile']
            });

            if (!canceled) {
              const content = fs.readFileSync(filePaths[0],'utf-8');
              temp={path:filePaths[0],content:content}
              win.webContents.send('file-opened', temp);
              win.setTitle("NotePad - " + filePaths[0]);
            }
          }
        }
      ]
    },
    {
      label:'Save',
      accelerator:'Ctrl+S',
      click:()=>{
        win.webContents.send('file-save');
      }
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));


  //open save files


  ipcMain.handle('open-file-dialog',async()=>{
      const result=await dialog.showOpenDialog({
          properties:['openFile'],
          filters:[{name:'Text Files',extensions:['txt','md','js','json','html','css']},
          {name:'All Files',extensions:['*']}]
      });
      if(result.canceled) return null;
      const Content = fs.readFileSync(result.filePaths[0],'utf-8');
      win.setTitle("NotePad - " + result.filePaths[0]);
      return {
          path: result.filePaths[0],
          content: Content
      };
  });


  ipcMain.handle("save-file-dialog", async (event, text,filepath) => {
    if(filepath!=''){
      fs.writeFileSync(filepath,text);
      return true;
    }
    else {
      const result = await dialog.showSaveDialog({
        filters: [{ name: "Text Files", extensions: ["txt"] }]
      });
      if (result.canceled) return;
      fs.writeFileSync(result.filePath, text);
      return result.filePath;
    }
  });

  ipcMain.handle('openfile',(event,path)=>{
    const content = fs.readFileSync(path,'utf-8');
    const name = path.substring(path.lastIndexOf("/") + 1);
    currfilepath=path;
    win.setTitle("NotePad - " +path );
    return content;
  });


  // SNAPSHOT SYSTEM

  ipcMain.handle('create-snapshot', (event, data,currfile) => {
    if (!currfile) return false;

    const snapPath = snapshotFile + "_" + path.basename(currfile);

    fs.writeFileSync(snapPath, data);
    return true;
  });

  ipcMain.handle("restore-snapshot", (event,currfile) => {
    if (!currfile) return null;

    const snapPath = snapshotFile + "_" + path.basename(currfile);

    if (fs.existsSync(snapPath)) {
      return fs.readFileSync(snapPath, "utf-8");
    }

    return null;
  });

}


app.whenReady().then(() => {
    createWindow();

    globalShortcut.register('CommandOrControl+Shift+K', () => {
        const win = BrowserWindow.getAllWindows()[0];

        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });
});

// app.on('will-quit', () => {
//     globalShortcut.unregisterAll();
// });
