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




let FilePaths = [];

//open save files

wrap.addEventListener('click', () => {
    editor.wrap = editor.wrap === "off" ? "soft" : "off";
});

open.addEventListener('click', async () => {
    const res = await window.api.openFile();

    console.log("File content:", res);

    if (res) {
        editor.value = res.content;
        currfile = res.path;
    }
});


save.addEventListener('click', async () => {
    const data = editor.value;
    const file = FilePaths.find(f => f.path === currfile);

    if (file) {
        file.content = data;
    }

    await window.api.saveFile(data, currfile, FilePaths);
});


//snapshot


createSnapshot.addEventListener('click', async () => {
    const data = editor.value;
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

function autosave() {
    if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
    }

    autoSaveTimer = setTimeout(async () => {
        const data = editor.value;
        // await window.api.saveFile(data,currfile);
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

window.electron.onFileOpened((filepath, content) => {
    editor.value = content;
    currfile = filepath;
});


window.electron.onSave(async (filepath) => {
    const data = editor.value;
    const file = FilePaths.find(f => f.path === currfile);

    if (file) {
        file.content = data;
    }

    await window.api.saveFile(data, currfile, FilePaths);
});



//sidepanel multiple files at a time



window.electron.getfilepaths((filepaths) => {
    FilePaths = filepaths;
    filescontainer.innerHTML = "";

    FilePaths.forEach((f, index) => {
        const div = document.createElement("div");
        div.classList.add("file-item");

        let name = f.path.substring(f.path.lastIndexOf("/") + 1);

        div.dataset.index = index;
        div.textContent = name;

        filescontainer.appendChild(div);


        div.addEventListener('click', async () => {
            const res = await window.electron.open(f.path);
            currfile=f.path;
            if (res) {
                editor.value = res;
            }
            // updateContent(f.path);
        });

    });
});


// function updateContent(currf) {
//     const file = FilePaths.find(f => f.path === currf);

//     if (file) {
//         editor.value = file.content;
//         currfile = currf;
//     }
// }





//add button functionality




// add.addEventListener('click', () => {

//     // Create a temporary untitled file object
//     const newFile = {
//         path: "",
//         content: ""
//     };

//     // Add to array
//     FilePaths.push(newFile);

//     // Update current file
//     currfile = newFile.path;

//     // Clear editor
//     editor.value = "";

//     // Refresh sidebar UI
//     renderFileList();
// });


// function renderFileList() {
//     filescontainer.innerHTML = "";

//     FilePaths.forEach((f, index) => {
//         const div = document.createElement("div");
//         div.classList.add("file-item");

//         let name = f.path.substring(f.path.lastIndexOf("/") + 1);

//         div.dataset.index = index;
//         div.textContent = name;

//         // highlight active file
//         if (f.path === currfile) {
//             // div.style.background = "#333";
//         }

//         filescontainer.appendChild(div);

//         div.addEventListener('click', () => {
//             updateContent(f.path);
//         });
//     });
// }






