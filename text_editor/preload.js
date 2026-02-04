
const {contextBridge, ipcRenderer}=require('electron');

contextBridge.exposeInMainWorld("api",{
    openFile:()=>{
        return ipcRenderer.invoke('open-file-dialog');
    },
    saveFile:(data,path)=>{
        return ipcRenderer.invoke('save-file-dialog', data,path,FilePaths);
    },
    pin:()=>{
        return ipcRenderer.invoke('pin');
    },
    CreateSnapshot:(data)=>{
        return ipcRenderer.invoke('create-snapshot',data);
    },
    RestoreSnapshot:()=>{
        return ipcRenderer.invoke('restore-snapshot');
    }
});


contextBridge.exposeInMainWorld('electron', {
  onFileOpened: (callback) => ipcRenderer.on('file-opened',(event,filepath,content)=>{
    callback(filepath,content);
  }),
  onSave: (callback) => ipcRenderer.on('file-save', (event,filepath)=>{
    callback(filepath);
  }),
  saveFile: (text) => ipcRenderer.invoke('save-file-dialog', text),
  getfilepaths:(callback)=>ipcRenderer.on('filepaths',(event,filepaths)=>{
    callback(filepaths);
  }),
  open:(path)=> ipcRenderer.invoke('openfile',path)
});