<<<<<<< HEAD

=======
>>>>>>> d1ac7dac1d0d66c8ec17fa1311f4b2cac19b5514
const {contextBridge, ipcRenderer}=require('electron');

contextBridge.exposeInMainWorld("api",{
    openFile:()=>{
        return ipcRenderer.invoke('open-file-dialog');
    },
    saveFile:(data)=>{
        return ipcRenderer.invoke('save-file-dialog', data);
<<<<<<< HEAD
    },
    pin:()=>{
        return ipcRenderer.invoke('pin');
=======
>>>>>>> d1ac7dac1d0d66c8ec17fa1311f4b2cac19b5514
    }
});


<<<<<<< HEAD
contextBridge.exposeInMainWorld('electron', {
  onFileOpened: (callback) => ipcRenderer.on('file-opened',(event,filepath,content)=>{
    callback(filepath,content);
  }),
  onSave: (callback) => ipcRenderer.on('file-save', callback),
  saveFile: (text) => ipcRenderer.invoke('save-file-dialog', text)
});
=======


>>>>>>> d1ac7dac1d0d66c8ec17fa1311f4b2cac19b5514
