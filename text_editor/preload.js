
const {contextBridge, ipcRenderer}=require('electron');

contextBridge.exposeInMainWorld("api",{
    openFile:()=>{
        return ipcRenderer.invoke('open-file-dialog');
    },
    saveFile:(data)=>{
        return ipcRenderer.invoke('save-file-dialog', data);
    },
    pin:()=>{
        return ipcRenderer.invoke('pin');
    }
});


contextBridge.exposeInMainWorld('electron', {
  onFileOpened: (callback) => ipcRenderer.on('file-opened',(event,filepath,content)=>{
    callback(filepath,content);
  }),
  onSave: (callback) => ipcRenderer.on('file-save', (event,filepath)=>{
    callback(filepath);
  }),
  saveFile: (text) => ipcRenderer.invoke('save-file-dialog', text)
});