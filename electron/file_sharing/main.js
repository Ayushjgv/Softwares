
const { app, BrowserWindow, ipcMain,dialog } = require('electron');
const dgram = require('dgram');
const WebSocket = require('ws');
const bonjour = require('bonjour')();
const net = require('net');
const fs = require('fs');
const path = require('path');
const { create } = require('domain');
const PORT = process.env.PORT || (5000 + Math.floor(Math.random() * 1000));
const os=require('os');

const devicename= os.hostname();



let win;
let port;
let ip;
let received=0;
let totalsize;

//buffer pending devices


let pendingDevices = [];
let windowReady = false;





//register and discover devices

bonjour.publish({
    name:devicename+Date.now(),
    type:"fileshare",
    port:PORT
});

bonjour.find({ type: "fileshare" }, (service) => {
    if (service.port === PORT){
        const IP = service.addresses[0];
        win.webContents.send('my-port',PORT,IP);
        return;
    }

    const ip = service.addresses.find(a => net.isIPv4(a));
    if (!ip) return;

    const device = { ip, port: service.port };

    if (windowReady && win) {
        win.webContents.send("device-found", device.ip, device.port);
    } else {
        pendingDevices.push(device); // buffer it
    }
});


//client side 
function connectclient(ip,port){
    const client = new net.Socket();

    client.connect(port ,ip,()=>{
        console.log("client connected",port,ip);
        client.write("client connected in server");
    });
}


//eastablish tcp server

const server = net.createServer((socket) => {

    let filestream = null;
    let totalsize = 0;
    let received = 0;
    let metadataBuffer = "";

    socket.once('data', (data) => {
        metadataBuffer += data.toString();

        const meta = JSON.parse(metadataBuffer);

        totalsize = meta.size;

        filestream = fs.createWriteStream("received_" + meta.name);

        win.webContents.send('history', {
            name: meta.name,
            size: meta.size
        });

        socket.write("ready");
        socket.pipe(filestream);

        socket.on('data', (chunk) => {
            received += chunk.length;
            const progress = (received / totalsize) * 100;

            win.webContents.send('progress', progress);
        });
    });

    socket.on('end', () => {
        if (filestream) filestream.end();
    });
});


server.listen(PORT,'0.0.0.0');



//sendfile

function sendfile(ip,port,filepath,totalsize){
    const client = new net.Socket();
    client.setNoDelay(true);

    client.connect(port, ip, () => {
        const filename = path.basename(filepath);

        const metadata = JSON.stringify({
            name: filename,
            size: totalsize
        });

        client.write(metadata);
    });


    client.on('data',(data)=>{
        if(data.toString()==="ready"){
            const readStream = fs.createReadStream(filepath,{
                highWaterMark:1024*1024*8
            });
            readStream.pipe(client);
            readStream.on('end',()=>{
                client.end();
            })
        }
    });


    client.on('end',()=>{

    });
}


//ipc handle things


ipcMain.on('sendtext',(event,text)=>{
    // console.log(text);
});


ipcMain.on('send-file',async (event,ip,port)=>{

    const result = await dialog.showOpenDialog({
        properties: ['openFile','multiSelections'],
    });
    
    let stats;

    // console.log(result.filePaths);

    if (!result.canceled) {
        const FilePath = result.filePaths[0];
        stats = fs.statSync(FilePath);
        totalsize=stats.size;

        result.filePaths.forEach((filePath)=>{
            stats = fs.statSync(filePath);
            totalsize=stats.size;
            const filename = path.basename(filePath);
            console.log(filename);
            win.webContents.send('history', {
                name: filename,
                size:totalsize
            });

            sendfile(ip, port, filePath,totalsize);
        });

        // sendfile(ip, port, filePath,totalsize);
    }
});


ipcMain.on('dropped-files', (event, filepaths,ip,port) => {
    console.log("Received in main:", filepaths);

    filepaths.forEach((filePath) => {
        const stats = fs.statSync(filePath);
        const totalsize = stats.size;

        sendfile(ip, port, filePath, totalsize);
    });
});


ipcMain.on('reload-please',(event)=>{
    bonjour.find({ type: "fileshare" }, (service) => {
        if (service.port === PORT) return;

        const ip = service.addresses.find(a => net.isIPv4(a));
        if (!ip) win.webContents.send("no-device-found");

        const device = { ip, port: service.port };

        if (windowReady && win) {
            win.webContents.send("device-found", device.ip, device.port);
        } else {
            pendingDevices.push(device);
        }
    });
});







const createWindow =()=>{
    win = new BrowserWindow({
        width:700,
        height:700,
        webPreferences:{
            nodeIntegration:true,
            contextIsolation:false
        }
    });

    win.loadFile("index.html");

     win.webContents.on("did-finish-load", () => {
        windowReady = true;

        // send buffered devices
        pendingDevices.forEach(d => {
            win.webContents.send("device-found", d.ip, d.port);
        });

        pendingDevices = [];
    });
}




app.whenReady().then(()=>{
    createWindow();
})