const { app, BrowserWindow ,globalShortcut,dialog,Tray,Menu,shell,ipcMain} = require('electron');
const path = require('path');
const windowstateKeeper = require('electron-window-state');





ipcMain.on('msg',(event,arg)=>{
    console.log("Message received from Renderer Process");
    console.log(arg);
    // ipcMain.emit('reply1','Hello from Main Process');
    event.reply('reply2','Hello from Main Process');
});




// let template=[{label:'Blog',submenu:[{label:'Visit',click:()=>{
//     console.log("Visiting Blog");
// }}]},
// {label:'About',submenu:[{label:'Version 1.0.0'},{label:'Author: Your Name'}]},
// {label:'Close',role:'close'}];

// let menu=Menu.buildFromTemplate(template);
// Menu.setApplicationMenu(menu);





let template=[{label:'Blog',submenu:[{label:'Visit',click:()=>{
    console.log("Visiting Blog");
}}]},
{label:'About',submenu:[{label:'Version 1.0.0'},{label:'Author: Your Name'}]},
{label:'Close',role:'close'}];

let ContextMenu=Menu.buildFromTemplate(template);





function createWindow(prop) {
    const mainWindowState=windowstateKeeper({
        defaultWidth:120,
        defaultHeight:150
    })
    const win = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: 800,
        height: 900,
        alwaysOnTop: true,
        devtools: true,
        // autoHideMenuBar: true,
        frame: false,
        // resizable: false,
        title:"Tic Tac Toe",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation:false,
            // preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('index.html');
    mainWindowState.manage(win);


    if(prop){
        let b=0;
        while(b<1000){
            win.loadFile('other.html');
            b++;
            win.loadFile('index.html');
            dialog.showMessageBox(win,{
                type:"info",
                title:"Info",
                message:`${b}`
            });
        }
    }



    let wc =win.webContents;

    // wc.on('dom-ready',()=>{
    //     console.log("DOM Ready");
    // });
    // wc.on('did-finish-load',()=>{
    //     console.log("Finished Loading");
    // });
    // wc.on('before-input-event',(event, input)=>{
    //     // console.log(`Key Pressed: ${input.key}`);
    //     // if(input.key==="F12"){
    //     //     event.preventDefault();
    //     // }
    // });

    wc.on('context-menu',()=>{
        ContextMenu.popup()
    })



    

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

// app.on('before-quit',(e)=>{
//     // app.quit();
//     console.warn("Quitting");
//     e.preventDefault();
// });

app.on('will-quit',(e)=>{
    console.warn("Will Quit");
    e.preventDefault();
    createWindow(true);

})

// app.on('browser-window-focus',()=>{
//     console.log("Focused");
// })

// app.on('browser-window-blur',()=>{
//     console.log("Blurred");
// })

// app.whenReady().then(createWindow);