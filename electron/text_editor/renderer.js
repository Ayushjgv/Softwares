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

// Global tracker for unique temporary IDs for untitled files
let untitledCount = 0;

let currfile = ""; 
let autoSaveTimer = null;
let FilePaths = [];
let wordWrap = false; // Set to false initially to match standard editor default behavior

// Toggle word wrap
wrap.addEventListener('click', () => {
    wordWrap = !wordWrap;
    editor.wrap = editor.wrap === "off" ? "soft" : "off";
    updateLineNumbers(); 
});

// Open file handling
open.addEventListener('click', async () => {
    const res = await window.api.openFile();
    if (res && res.path) {
        editor.value = res.content;
        currfile = res.path;
        
        if (!FilePaths.some(file => file.path === res.path)) {
            FilePaths.push(res);
        }
        updatesidebar();
        updateLineNumbers();
    }
});

// Unified save function logic
async function handleSave() {
    const data = editor.value;

    // If it's a real file on disk
    if (currfile && !currfile.startsWith("untitled-")) {
        const file = FilePaths.find(f => f.path === currfile);
        if (file) file.content = data;

        await window.api.saveFile(data, currfile);
    } else {
        // If it's an untitled scratchpad file
        const path = await window.api.saveFile(data, "");
        if (path) {
            // Find the temporary virtual file entry and update it to a real file path
            const file = FilePaths.find(f => f.path === currfile);
            if (file) {
                file.path = path;
                file.content = data;
            }
            currfile = path;
            updatesidebar();
        }
    }
}

save.addEventListener('click', handleSave);

// Redraw the open files sidebar
async function updatesidebar() {
    filescontainer.innerHTML = '';
    
    // Only notify backend IPC channels if it's a genuine absolute disk file path
    if (currfile && !currfile.startsWith("untitled-")) {
        await window.api.openedFile(currfile);
    }

    FilePaths.forEach((f) => {
        const div = document.createElement("div");
        div.classList.add("file-item");

        // Clean display layout: Real filenames get chopped, untitled files get clean "Untitled-X" text
        let displayPath = "Untitled";
        if (f.path) {
            if (f.path.startsWith("untitled-")) {
                const id = f.path.split("-")[1];
                displayPath = `Untitled-${id}`;
            } else {
                displayPath = f.path.substring(f.path.lastIndexOf("/") + 1);
            }
        }

        const nameSpan = document.createElement("span");
        nameSpan.textContent = displayPath;
        div.appendChild(nameSpan);

        const crossBtn = document.createElement("div");
        crossBtn.textContent = "X";
        crossBtn.classList.add("cross-btn");
        div.appendChild(crossBtn);

        // Active highlighted tab injection hook
        if (f.path === currfile) {
            div.style.backgroundColor = "cyan";
        }

        div.addEventListener('click', () => {
            currfile = f.path;
            editor.value = f.content;
            updatesidebar();
            updateLineNumbers();
        });

        crossBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            
            FilePaths = FilePaths.filter(file => file.path !== f.path);

            if (currfile === f.path) {
                if (FilePaths.length > 0) {
                    currfile = FilePaths[0].path;
                    editor.value = FilePaths[0].content;
                } else {
                    currfile = "";
                    editor.value = "";
                }
            }
            updatesidebar();
            updateLineNumbers();
        });

        filescontainer.appendChild(div);
    });
}

// Snapshot system
createSnapshot.addEventListener('click', async () => {
    if (!currfile || currfile.startsWith("untitled-")) return;
    const data = editor.value;
    await window.api.CreateSnapshot(data, currfile);
});

getSnapshot.addEventListener('click', async () => {
    if (!currfile || currfile.startsWith("untitled-")) return;
    const snapshot = await window.api.RestoreSnapshot(currfile);

    if (snapshot !== undefined && snapshot !== null) {
        editor.value = snapshot;
        updateLineNumbers();
        editor.focus();
    }
});

// Dynamic line numbering
function updateLineNumbers() {
    if (wordWrap) {
        let numbers = "";
        const lineCount = editor.value.split("\n").length;
        for (let i = 1; i <= lineCount; i++) {
            numbers += i + ".\n";
        }
        lines.textContent = numbers;
    } else {
        lines.textContent = ""; 
    }
}

// Memory-only autosave fallback 
function autosave() {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    autoSaveTimer = setTimeout(() => {
        const data = editor.value;
        const file = FilePaths.find(f => f.path === currfile);
        if (file) {
            file.content = data;
        }
    }, 1000);
}

// Scroll synchronization
editor.addEventListener("scroll", () => {
    lines.scrollTop = editor.scrollTop;
});

editor.addEventListener("input", () => {
    updateLineNumbers();
    autosave();
});

// Window/UI pinning toggles
pin.addEventListener('click', async () => {
    const ispinned = await window.api.pin();
    pin.style.background = ispinned ? "cyan" : "white";
});

// Electron main shortcuts
window.electron.onFileOpened((files) => {
    if (files) {
        editor.value = files.content;
        currfile = files.path;
        if (!FilePaths.some(file => file.path === files.path)) {
            FilePaths.push(files);
        }
        updatesidebar();
        updateLineNumbers();
    }
});

window.electron.onSave(handleSave);

// Helper function to create an untitled workspace tab cleanly
function createUntitledFile() {
    untitledCount++;
    const virtualPath = `untitled-${untitledCount}`;
    const newFile = { path: virtualPath, content: "" };
    
    FilePaths.push(newFile);
    currfile = virtualPath;
    editor.value = '';
    updatesidebar();
    updateLineNumbers();
}

// Add button functionality
add.addEventListener('click', () => {
    createUntitledFile();
});

// --- Initialization Logic ---
// Automatically spins up your initial open Untitled File tab right when the application launches
createUntitledFile();

// Sidebar opening panels
sidebarbtn.addEventListener('click', () => sidebar.classList.add("active"));
document.getElementById("close").addEventListener('click', () => sidebar.classList.remove("active"));