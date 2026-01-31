const open = document.getElementById('open');
const save = document.getElementById('save');
const editor = document.getElementById('editor');
const lines = document.getElementById('lines');
const wrap = document.getElementById('wrap');
const sidebarbtn=document.getElementById('sidebarbtn');
const sidebar = document.getElementById('sidebar');
const pin=document.getElementById('pin');
const filescontainer=document.getElementById('filescontainer');
const createSnapshot=document.getElementById('createsnapshot');
const getSnapshot=document.getElementById('getsnapshot');


let currfile;
let autoSaveTimer=null;




let FilePaths=[];

//open save files

wrap.addEventListener('click', () => {
    editor.wrap = editor.wrap === "off" ? "soft" : "off";
});

open.addEventListener('click', async () => {
    const res = await window.api.openFile();

    console.log("File content:", res);
    
    if (res) {
        editor.value = res;
    }
});

save.addEventListener('click', async () => {
    const data = editor.value;
    await window.api.saveFile(data);
});


//snapshot


createSnapshot.addEventListener('click',async()=>{
    const data=editor.value;
    await window.api.CreateSnapshot(data);
});

getSnapshot.addEventListener('click', async () => {
    const snapshot = await window.api.RestoreSnapshot();

    if (snapshot) {
        editor.value = snapshot;
        updateLineNumbers();
        // alert("Snapshot Restored!");
        editor.focus();
    } else {
        // alert("No snapshot available for this file.");
    }
});




//line numbers



function updateLineNumbers() {
    let numbers = "";

    if (editor.wrap === "off") {
        // Normal mode (no wrap)
        const lineCount = editor.value.split("\n").length;

        for (let i = 1; i <= lineCount; i++) {
            numbers += i + ".\n";
        }
    } 
    else {
        // WRAP ON — calculate visual lines
        
    }

    lines.textContent = numbers;
}

//autosave

function autosave(){
    if(autoSaveTimer){
        clearTimeout(autoSaveTimer);
    }

    autoSaveTimer = setTimeout(async () => {
        const data=editor.value;
        await window.api.saveFile(data,currfile);
    }, 1000);
}

editor.addEventListener("scroll", () => {
    lines.scrollTop = editor.scrollTop;
});


editor.addEventListener("input", ()=>{
    updateLineNumbers();
    autosave();
});

updateLineNumbers();



//sidebar

sidebarbtn.addEventListener('click', () => {
    sidebar.classList.add("active");
});

document.getElementById("close").addEventListener('click', () => {
    sidebar.classList.remove("active");
});


//pinning

pin.addEventListener('click',async()=> {
    let ispinned = await window.api.pin();
    if(ispinned) pin.style.background="cyan";
    else pin.style.background="white";
});



//shortcut controls

window.electron.onFileOpened((filepath, content) => {
  editor.value = content;
  currfile=filepath;
});


window.electron.onSave(async (filepath)=>{
    const data=editor.value;
    currfile=filepath;
    await window.api.saveFile(data,filepath);
});



//sidepanel multiple files at a time



window.electron.getfilepaths((filepaths)=>{
   FilePaths=filepaths;
   filescontainer.innerHTML="";

   FilePaths.forEach((path,index) => {
    const div=document.createElement("div");
    div.classList.add("file-item");

    let name = path.substring(path.lastIndexOf("/") + 1);

    div.dataset.index=index;
    div.textContent=name;

    filescontainer.appendChild(div);


    div.addEventListener('click',async ()=>{
        const res = await window.electron.open(path);
        currfile=path;
        if (res) {
            editor.value = res;
        }
    });
    
   });
});


