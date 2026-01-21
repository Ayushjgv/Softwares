const {contextBridge, ipcRenderer}=require('electron');

contextBridge.exposeInMainWorld("api",{
    openFile:()=>{
        return ipcRenderer.invoke('open-file-dialog');
    },
    saveFile:(data)=>{
        return ipcRenderer.invoke('save-file-dialog', data);
    }
});




