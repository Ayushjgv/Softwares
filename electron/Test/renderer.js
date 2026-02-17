const { webFrame, ipcRenderer } = require('electron');

const btnZoomIn = document.getElementById('btnZoomIn');
const btnZoomOut = document.getElementById('btnZoomOut');
const btnShareData = document.getElementById('btnShareData');

btnZoomIn.addEventListener('click', ZoomIn);
btnZoomOut.addEventListener('click', ZoomOut);
btnShareData.addEventListener('click', shareData);

function ZoomIn() {
    webFrame.setZoomFactor(webFrame.getZoomFactor() + 0.1);
}

function ZoomOut() {
    webFrame.setZoomFactor(webFrame.getZoomFactor() - 0.1);
}

function shareData() {
    console.log("Sending Data to Main Process");
    ipcRenderer.send('msg', 'Hello from Renderer Process');
    ipcRenderer.on('reply1', (event, arg) => {
        console.log(arg);
    });
    ipcRenderer.on('reply2', (event, arg) => {
        console.log(arg);
    });
}