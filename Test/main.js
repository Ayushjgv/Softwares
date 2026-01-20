<<<<<<< HEAD
const { app, BrowserWindow ,globalShortcut,dialog,Tray,Menu} = require('electron');
=======
const { app, BrowserWindow } = require('electron');
>>>>>>> 7a8eb59f43968e732b10d8551e742e3109b7390b
const path = require('path');
const windowstateKeeper = require('electron-window-state');


function createWindow() {
    const mainWindowState=windowstateKeeper({
        defaultWidth:500,
        defaultHeight:600
    })
    const win = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        alwaysOnTop: true,
<<<<<<< HEAD
        devtools: true,
        // autoHideMenuBar: true,
=======
        autoHideMenuBar: true,
>>>>>>> 7a8eb59f43968e732b10d8551e742e3109b7390b
        // frame: false,
        // resizable: false,
        title:"Tic Tac Toe",
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('index.html');
    mainWindowState.manage(win);
<<<<<<< HEAD






    let wc =win.webContents;
    wc.on('dom-ready',()=>{
        console.log("DOM Ready");
    });
    wc.on('did-finish-load',()=>{
        console.log("Finished Loading");
    });
    wc.on('before-input-event',(event, input)=>{
        // console.log(`Key Pressed: ${input.key}`);
        // if(input.key==="F12"){
        //     event.preventDefault();
        // }
    });



    

    // wc.on('did-finish-load',()=>{
    //     dialog.showMessageBox(win,{
    //         type:"info",
    //         title:"Info",
    //         message:"Content Loaded Successfully"
    //     });
    //     dialog.showOpenDialog(win,{
    //         title:"Select a file",
    //         properties:['openFile','multiSelections'],
    //         filters:[
    //             {name:"Text Files",extensions:['txt']},
    //             {name:"Image Files",extensions:['png','jpg','jpeg']}
    //         ],
    //         defaultPath:app.getPath('documents'),
    //         buttonLabel:"Select",
    //     }).then(result=>{
    //         console.log(result.canceled);
    //         console.log(result.filePaths);
    //     }).catch(err=>{
    //         console.log(err);
    //     });
    // });



    tray=new Tray('icon.png');
    tray.setToolTip("This is a tray icon");
    tray.on('click',()=>{
        console.log("Tray icon clicked");
        win.isVisible()?win.hide():win.show();
    });

    let template=[{label:"Item1"},{label:"Item2"}];
    const contextMenu=Menu.buildFromTemplate(template);
    tray.setContextMenu(contextMenu);

}







// app.on('before-quit',(e)=>{
//     // app.quit();
//     console.warn("Quitting");
//     e.preventDefault();
//     // createWindow();
// });

// app.on('will-quit',(e)=>{
//     console.warn("Will Quit");
//     e.preventDefault();
// });

// app.on('browser-window-focus',()=>{
//     console.log("Focused");
// })

// app.on('browser-window-blur',()=>
//     console.log("Blurred");
// })

// app.whenReady().then(createWindow);






app.on('ready',()=>{
    createWindow();

    globalShortcut.register('K',()=>{
        // win.loadFile('Other.html');
        console.log("K Pressed");
    });
});
=======
}

app.on('before-quit',(e)=>{
    // app.quit();
    console.warn("Quitting");
    e.preventDefault();
});

app.on('will-quit',(e)=>{
    console.warn("Will Quit");
    e.preventDefault();
})

app.on('browser-window-focus',()=>{
    console.log("Focused");
})

app.on('browser-window-blur',()=>{
    console.log("Blurred");
})

// app.whenReady().then(createWindow);
app.on('ready',createWindow);
>>>>>>> 7a8eb59f43968e732b10d8551e742e3109b7390b
