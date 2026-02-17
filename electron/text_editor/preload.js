
const {contextBridge, ipcRenderer}=require('electron');

contextBridge.exposeInMainWorld("api",{
    openFile:()=>{
        return ipcRenderer.invoke('open-file-dialog');
    },
    saveFile:(data,path)=>{
        return ipcRenderer.invoke('save-file-dialog', data,path);
    },
    pin:()=>{
        return ipcRenderer.invoke('pin');
    },
    CreateSnapshot:(data,currfile)=>{
        return ipcRenderer.invoke('create-snapshot',data,currfile);
    },
    RestoreSnapshot:(currfile)=>{
        return ipcRenderer.invoke('restore-snapshot',currfile);
    }
});


contextBridge.exposeInMainWorld('electron', {
  onFileOpened: (callback) => ipcRenderer.on('file-opened',(event,temp)=>{
    callback(temp);
  }),
  onSave: (callback) => ipcRenderer.on('file-save', (callback)),
});