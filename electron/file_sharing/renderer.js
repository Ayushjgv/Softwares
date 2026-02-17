const { ipcRenderer } = require('electron');
const progress = document.getElementById('progress');
const status = document.getElementById("status");
const send = document.getElementById('send');
const deviceList = document.getElementById("deviceList");
const dropArea = document.getElementById("drop-area");
const reload = document.getElementById("reload");
const portElement = document.getElementById('port');


let devices=[];


//my port

ipcRenderer.on('my-port',(event,Port,Ip)=>{
    portElement.innerText = `${Ip}:${Port}`;
});

//send file

let discoveredIP = null;
let discoveredPort = null;

ipcRenderer.on('device-found', (e, ip, port) => {
    discoveredIP = ip;
    discoveredPort = port;
    const device={
        ip:ip,
        port:port
    }
    devices.push(device);
    renderlist();
});

//render devices

function renderlist() {
    // remove duplicates (ip + port)
    const unique = [];
    const map = new Set();

    for (const d of devices) {
        const key = `${d.ip}:${d.port}`;
        if (!map.has(key)) {
            map.add(key);
            unique.push(d);
        }
    }

    devices = unique;

    // clear UI
    deviceList.innerHTML = "";

    devices.forEach((device, index) => {
        const li = document.createElement("li");
        li.innerText = `${device.ip}:${device.port}`;
        li.style.cursor = "pointer";
        li.style.padding = "6px";
        li.style.borderBottom = "1px solid #ccc";

        li.onclick = () => {
            discoveredIP = device.ip;
            discoveredPort = device.port;

            // highlight selection
            [...deviceList.children].forEach(el => {
                el.style.background = "";
            });
            li.style.background = "#d0ebff";
            li.style.color="black";

            status.innerText = `Selected: ${device.ip}:${device.port}`;
        };

        deviceList.appendChild(li);
    });
}


//send

send.addEventListener('click', () => {
    if(!discoveredIP) {
        alert("No device found on network");
        return;
    }

    ipcRenderer.send('send-file', discoveredIP, discoveredPort);
});



//progress bar
ipcRenderer.on('progress', (e, value) => {
    progress.value = value;
    status.innerText = "Sending: " + value + "%";

})



//drop area



dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.style.borderColor = "green";
});

dropArea.addEventListener("dragleave", () => {
    dropArea.style.borderColor = "#888";
});

dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.style.borderColor = "#888";
    let filePaths = [];
    for (const file of event.dataTransfer.files) {
        filePaths.push(file.path);
    }
    console.log("Dropped:", filePaths);
    if (filePaths.length > 0) {
        ipcRenderer.send('dropped-files', filePaths,discoveredIP,discoveredPort);
    }
});



//reload

reload.addEventListener('click',()=>{
    devices=[];
    renderlist();
    ipcRenderer.send("reload-please");
});

ipcRenderer.on('no-device-found',(e)=>{
    devices=[];
    renderlist();
});


//history

ipcRenderer.on('history', (event, file) => {
    const div = document.createElement('div');
    div.innerText = `${file.name} (${(file.size/1024).toFixed(2)} KB)`;

    document.querySelector('.left').appendChild(div);
});






