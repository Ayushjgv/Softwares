const { app, BrowserWindow, dialog, ipcMain ,shell,Menu} = require('electron');
const fs = require('fs');
const path = require('path');
const windowKeeper=require('electron-window-state');


let filepaths=[];



ipcMain.handle('open-file-dialog',async()=>{
    const result=await dialog.showOpenDialog({
        properties:['openFile'],
        filters:[{name:'Text Files',extensions:['txt','md','js','json','html','css']},
        {name:'All Files',extensions:['*']}]
    });

    if(result.canceled) return null;

    //add in filepaths with tabno.
    if(!filepaths[0]) filepaths.push(result.filePaths[0]);
    else filepaths[0]=result.filePaths[0];

    const content = fs.readFileSync(result.filePaths[0],'utf-8');
    // console.log(content);
    return content;

});


ipcMain.handle("save-file-dialog", async (event, text) => {
  if(filepaths[0]){
    fs.writeFileSync(filepaths[0],text);
  }
  else{
    const result = await dialog.showSaveDialog({
      filters: [{ name: "Text Files", extensions: ["txt"] }]
    });

    if (result.canceled) return;

    fs.writeFileSync(result.filePath, text);
    return true;
  }

  
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
    // transparent:true,
    hasShadow:true,
    // frame:false,
    // devtools:true,
    webPreferences: {
        // devtools:true,
        contextIsolation:true,
        nodeIntegration:false,
        preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile("index.html");

  //devtools

  // win.webContents.on('before-input-event', (event, input) => {
  //   if (
  //     (input.control && input.shift && input.key.toLowerCase() === 'i') ||
  //     input.key === 'F12'
  //   ) {
  //     event.preventDefault();
  //   }
  // });


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
              if(!filepaths[0]) filepaths.push(filePaths[0]);
              else filepaths[0]=filePaths[0];
              console.log(filePaths[0]);
              win.webContents.send('file-opened', filePaths[0],content);
            }
          }
        }
      ]
    },
    {
      label:'Save',
      accelerator:'Ctrl+S',
      click:()=>{
        win.webContents.send('file-save',filepaths);
      }
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));






}


app.whenReady().then(createWindow);