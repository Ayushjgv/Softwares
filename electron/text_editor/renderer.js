const open = document.getElementById('open');
const save = document.getElementById('save');
const editor = document.getElementById('editor');
const lines = document.getElementById('lines');
const wrap = document.getElementById('wrap');
const sidebarbtn = document.getElementById('sidebarbtn');
const sidebar = document.getElementById('sidebar');
const pin = document.getElementById('pin');
const filescontainer = document.getElementById('filescontainer');
const createSnapshot = document.getElementById('createsnapshot');
const getSnapshot = document.getElementById('getsnapshot');
const add = document.getElementById('add');


let currfile;
let autoSaveTimer = null;
let file;



let FilePaths = [];

//wrap on off

wrap.addEventListener('click', () => {
    editor.wrap = editor.wrap === "off" ? "soft" : "off";
});

//open save files

open.addEventListener('click', async () => {
    const res = await window.api.openFile();

    // console.log("File content:", res);

    if (res) {
        editor.value = res.content;
        currfile = res.path;
        if(!FilePaths.some(file=>file.path===res.path)) FilePaths.push(res);
        updatesidebar();
    }
});


save.addEventListener('click', async () => {
    if(currfile!=''){
        const data = editor.value;
        file = FilePaths.find(f => f.path === currfile);

        if (file) {
            file.content = data;
        }

        await window.api.saveFile(data, currfile);
    }
    else{
        const data=editor.value;
        file = FilePaths.find(f => f.path === currfile);
        if (file) {
            file.content = data;
        }
        const path=await window.api.saveFile(data, currfile);
        file.path=path;
        currfile=path;
        updatesidebar();
    }
});

//updatesidebar

function updatesidebar(){
    filescontainer.innerHTML='';
    FilePaths.forEach((f, index) => {
        const div = document.createElement("div");
        div.classList.add("file-item");

        let name = f.path.substring(f.path.lastIndexOf("/") + 1);

        div.dataset.index = index;
        div.textContent = name;

        filescontainer.appendChild(div);


        div.addEventListener('click', async () => {
            currfile=f.path;
            editor.value=f.content;
        });

    });
}


//snapshot


createSnapshot.addEventListener('click', async () => {
    const data = editor.value;
    await window.api.CreateSnapshot(data,currfile);
});

getSnapshot.addEventListener('click', async () => {
    const snapshot = await window.api.RestoreSnapshot(currfile);

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

function autosave() {
    if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
    }

    autoSaveTimer = setTimeout(async () => {
        const data = editor.value;
        const file = FilePaths.find(f => f.path === currfile);
        if (file) {
            file.content = data;
        }
    }, 1000);
}


editor.addEventListener("scroll", () => {
    lines.scrollTop = editor.scrollTop;
});


editor.addEventListener("input", () => {
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

pin.addEventListener('click', async () => {
    let ispinned = await window.api.pin();
    if (ispinned) pin.style.background = "cyan";
    else pin.style.background = "white";
});



//shortcut controls

window.electron.onFileOpened((files) => {
    editor.value = files.content;
    currfile = files.path;
    if(!FilePaths.some(file=>file.path===files.path)) FilePaths.push(files);
    updatesidebar();
});


window.electron.onSave(async () => {
    const data = editor.value;
    const file = FilePaths.find(f => f.path === currfile);

    if (file) {
        file.content = data;
    }

    await window.api.saveFile(data, currfile);
});


//add button functionality




add.addEventListener('click', () => {
    const newFile = {
        path: "",
        content: ""
    };
    FilePaths.push(newFile);
    currfile = newFile.path;
    editor.value = '';
    updatesidebar();
});

