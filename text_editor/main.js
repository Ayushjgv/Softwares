<<<<<<< HEAD
const { app, BrowserWindow, dialog, ipcMain ,shell,Menu} = require('electron');
=======
const { app, BrowserWindow, dialog, ipcMain ,shell} = require('electron');
>>>>>>> d1ac7dac1d0d66c8ec17fa1311f4b2cac19b5514
const fs = require('fs');
const path = require('path');
const windowKeeper=require('electron-window-state');


<<<<<<< HEAD
let filepaths=[];
=======




>>>>>>> d1ac7dac1d0d66c8ec17fa1311f4b2cac19b5514



ipcMain.handle('open-file-dialog',async()=>{
    const result=await dialog.showOpenDialog({
        properties:['openFile'],
        filters:[{name:'Text Files',extensions:['txt','md','js','json','html','css']},
        {name:'All Files',extensions:['*']}]
    });

    if(result.canceled) return null;

<<<<<<< HEAD
    //add in filepaths with tabno.
    if(!filepaths[0]) filepaths.push(result.filePaths[0]);
    else filepaths[0]=result.filePaths[0];

    const content = fs.readFileSync(result.filePaths[0],'utf-8');
    // console.log(content);
=======
    const content = fs.readFileSync(result.filePaths[0],'utf-8');
    console.log(content);
>>>>>>> d1ac7dac1d0d66c8ec17fa1311f4b2cac19b5514
    return content;

});


ipcMain.handle("save-file-dialog", async (event, text) => {
<<<<<<< HEAD
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

  
=======
  const result = await dialog.showSaveDialog({
    filters: [{ name: "Text Files", extensions: ["txt"] }]
  });

  if (result.canceled) return;

  fs.writeFileSync(result.filePath, text);
  return true;
>>>>>>> d1ac7dac1d0d66c8ec17fa1311f4b2cac19b5514
});













<<<<<<< HEAD
=======









>>>>>>> d1ac7dac1d0d66c8ec17fa1311f4b2cac19b5514
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
<<<<<<< HEAD
    // transparent:true,
    hasShadow:true,
    // frame:false,
    // devtools:true,
    webPreferences: {
        // devtools:true,
=======

    transparent:true,
    hasShadow:false,
    // frame:false,
    vibrancy:'ultra-dark',
    backgroundmaterial:'acrylic',

    // alwaysOnTop:true,
    devtools:true,
    webPreferences: {
>>>>>>> d1ac7dac1d0d66c8ec17fa1311f4b2cac19b5514
        contextIsolation:true,
        nodeIntegration:false,
        preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile("index.html");
<<<<<<< HEAD

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
              const content = fs.readFileSync(result.filePaths[0],'utf-8');
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
        win.webContents.send('file-save');
      }
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));






}


app.whenReady().then(createWindow);
=======
}



app.whenReady().then(createWindow);

























>>>>>>> d1ac7dac1d0d66c8ec17fa1311f4b2cac19b5514
