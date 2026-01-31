const { app, BrowserWindow, dialog, ipcMain ,shell,Menu} = require('electron');
const fs = require('fs');
const path = require('path');
const windowKeeper=require('electron-window-state');

const snapshotsDir = path.join(app.getPath("userData"), "snapshots");

if (!fs.existsSync(snapshotsDir)) {
  fs.mkdirSync(snapshotsDir);
}

const snapshotFile = path.join(app.getPath("userData"), "snapshot.txt");




let filepaths=[];
let currfilepath;




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
  //   if (
  //     (input.control && input.shift && input.key.toLowerCase() === 'i') ||
  //     input.key === 'F12'
  //   ) {
  //     event.preventDefault();
  //   }

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
              if(!filepaths.includes(filePaths[0])){
                filepaths.push(filePaths[0]);
                currfilepath=filePaths[0];
              }


              console.log(filePaths[0]);
              win.webContents.send('file-opened', filePaths[0],content);
              win.webContents.send('filepaths',filepaths);
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
        win.webContents.send('file-save',currfilepath);
        console.log(currfilepath);
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

      //add in filepaths with tab no.
      if(!filepaths.includes(result.filePaths[0])){
        filepaths.push(result.filePaths[0]);
        currfilepath=result.filePaths[0];
      }
      
      const content = fs.readFileSync(result.filePaths[0],'utf-8');
      

      //emit to send filepaths
      win.webContents.send('filepaths',filepaths);
      win.setTitle("NotePad - " + result.filePaths[0]);

      return content;

  });


  ipcMain.handle("save-file-dialog", async (event, text,filepath) => {
    if(filepath){
      fs.writeFileSync(filepath,text);
      console.log(filepath);
    }
    else{
      console.log(filepath);
      const result = await dialog.showSaveDialog({
        filters: [{ name: "Text Files", extensions: ["txt"] }]
      });

      if (result.canceled) return;

      fs.writeFileSync(result.filePath, text);
      return true;
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

  ipcMain.handle('create-snapshot', (event, data) => {
    if (!currfilepath) return false;

    const snapPath = snapshotFile + "_" + path.basename(currfilepath);

    fs.writeFileSync(snapPath, data);
    return true;
  });

  ipcMain.handle("restore-snapshot", () => {
    if (!currfilepath) return null;

    const snapPath = snapshotFile + "_" + path.basename(currfilepath);

    if (fs.existsSync(snapPath)) {
      return fs.readFileSync(snapPath, "utf-8");
    }

    return null;
  });

}


app.whenReady().then(createWindow);