const open = document.getElementById('open');
const save = document.getElementById('save');
const editor = document.getElementById('editor');
const lines = document.getElementById('lines');
const wrap = document.getElementById('wrap');
const split = document.getElementById('split');
const sidebarbtn = document.getElementById('sidebarbtn');
const sidebar = document.getElementById('sidebar');
const pin = document.getElementById('pin');
const filescontainer = document.getElementById('filescontainer');
const createSnapshot = document.getElementById('createsnapshot');
const getSnapshot = document.getElementById('getsnapshot');
const add = document.getElementById('add');
const body = document.getElementById('body');

let untitledCount = 0;
let paneCount = 0;
let currfile = "";
let autoSaveTimer = null;
let FilePaths = [];
let panes = [];
let activePane = null;
let wordWrap = false;

function getDisplayName(path) {
    if (!path) return "Untitled";
    if (path.startsWith("untitled-")) return `Untitled-${path.split("-")[1]}`;
    return path.substring(path.lastIndexOf("/") + 1);
}

function getFile(path) {
    return FilePaths.find(file => file.path === path);
}

function persistPaneContent(pane) {
    if (!pane || !pane.path) return;
    const file = getFile(pane.path);
    if (file) file.content = pane.editor.value;
}

function getContentForPath(path) {
    const file = getFile(path);
    return file ? file.content : "";
}

function setActivePane(pane) {
    if (!pane) return;
    if (activePane) {
        persistPaneContent(activePane);
        activePane.container.classList.remove("active-pane");
    }

    activePane = pane;
    currfile = pane.path || "";
    pane.container.classList.add("active-pane");
    updateLineNumbers(pane);
    updatesidebar();
}

function updatePaneTitle(pane) {
    pane.name.textContent = getDisplayName(pane.path);
    pane.container.title = pane.path && !pane.path.startsWith("untitled-") ? pane.path : getDisplayName(pane.path);
}

function setPaneFile(pane, path, content = getContentForPath(path)) {
    if (!pane) return;
    persistPaneContent(pane);
    pane.path = path;
    pane.editor.value = content || "";
    pane.editor.wrap = wordWrap ? "soft" : "off";
    updatePaneTitle(pane);
    updateLineNumbers(pane);
    setActivePane(pane);
}

function addFileEntry(file) {
    if (!file || !file.path) return;
    const existing = getFile(file.path);
    if (existing) {
        existing.content = file.content;
    } else {
        FilePaths.push(file);
    }
}

function createPane(path = currfile) {
    const paneId = paneCount++;
    let container;
    let paneEditor;
    let paneLines;
    let paneName;
    let closePaneBtn = null;

    if (paneId === 0) {
        container = document.querySelector(".editor-pane");
        paneEditor = editor;
        paneLines = lines;
        paneName = container.querySelector(".pane-name");
    } else {
        container = document.createElement("div");
        container.className = "editor-pane";
        container.dataset.paneId = String(paneId);
        container.innerHTML = `
            <div class="pane-title">
                <span class="pane-name">Untitled</span>
                <button class="pane-close icon-btn" title="Close split" aria-label="Close split">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6 6 18"/></svg>
                </button>
            </div>
            <div class="editor-shell">
                <div class="lines"></div>
                <textarea></textarea>
            </div>
        `;
        paneEditor = container.querySelector("textarea");
        paneLines = container.querySelector(".lines");
        paneName = container.querySelector(".pane-name");
        closePaneBtn = container.querySelector(".pane-close");
        body.appendChild(container);
    }

    const pane = {
        id: paneId,
        container,
        editor: paneEditor,
        lines: paneLines,
        name: paneName,
        path: path || ""
    };

    panes.push(pane);
    paneEditor.wrap = wordWrap ? "soft" : "off";
    paneEditor.value = getContentForPath(pane.path);
    updatePaneTitle(pane);
    updateLineNumbers(pane);

    paneEditor.addEventListener("focus", () => setActivePane(pane));
    paneEditor.addEventListener("scroll", () => {
        pane.lines.scrollTop = pane.editor.scrollTop;
    });
    paneEditor.addEventListener("input", () => {
        setActivePane(pane);
        updateLineNumbers(pane);
        autosave();
    });
    container.addEventListener("mousedown", () => setActivePane(pane));

    if (closePaneBtn) {
        closePaneBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            closePane(pane);
        });
    }

    setActivePane(pane);
    return pane;
}

function closePane(pane) {
    if (!pane || panes.length <= 1) return;
    persistPaneContent(pane);
    panes = panes.filter(item => item !== pane);
    pane.container.remove();

    if (activePane === pane) {
        setActivePane(panes[0]);
    } else {
        updatesidebar();
    }

    split.classList.toggle("is-active", panes.length > 1);
}

function updateAllPaneTitles() {
    panes.forEach(updatePaneTitle);
}

function syncPanesForFile(path) {
    const file = getFile(path);
    if (!file) return;
    panes.forEach((pane) => {
        if (pane !== activePane && pane.path === path) {
            pane.editor.value = file.content;
            updateLineNumbers(pane);
        }
    });
}

wrap.addEventListener('click', () => {
    wordWrap = !wordWrap;
    wrap.classList.toggle("is-active", wordWrap);
    panes.forEach((pane) => {
        pane.editor.wrap = wordWrap ? "soft" : "off";
        updateLineNumbers(pane);
    });
});

split.addEventListener('click', () => {
    persistPaneContent(activePane);
    const nextFile = FilePaths.find(file => !panes.some(pane => pane.path === file.path));
    createPane(nextFile ? nextFile.path : currfile);
    split.classList.toggle("is-active", panes.length > 1);
});

open.addEventListener('click', async () => {
    const res = await window.api.openFile();
    if (res && res.path) {
        addFileEntry(res);
        setPaneFile(activePane, res.path, res.content);
    }
});

async function handleSave() {
    persistPaneContent(activePane);
    const data = activePane ? activePane.editor.value : "";
    const oldPath = currfile;

    if (currfile && !currfile.startsWith("untitled-")) {
        const file = getFile(currfile);
        if (file) file.content = data;
        await window.api.saveFile(data, currfile);
        syncPanesForFile(currfile);
    } else {
        const path = await window.api.saveFile(data, "");
        if (path && activePane) {
            const file = getFile(oldPath);
            if (file) {
                file.path = path;
                file.content = data;
            }

            panes.forEach((pane) => {
                if (pane.path === oldPath) {
                    pane.path = path;
                    updatePaneTitle(pane);
                }
            });
            currfile = path;
            updateAllPaneTitles();
            updatesidebar();
        }
    }
}

save.addEventListener('click', handleSave);

async function updatesidebar() {
    filescontainer.innerHTML = '';

    if (currfile && !currfile.startsWith("untitled-")) {
        await window.api.openedFile(currfile);
    }

    FilePaths.forEach((f) => {
        const div = document.createElement("div");
        div.classList.add("file-item");

        const nameSpan = document.createElement("span");
        nameSpan.textContent = getDisplayName(f.path);
        div.appendChild(nameSpan);

        const crossBtn = document.createElement("div");
        crossBtn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6 6 18"/></svg>';
        crossBtn.setAttribute("title", "Close file");
        crossBtn.setAttribute("aria-label", "Close file");
        crossBtn.classList.add("cross-btn");
        div.appendChild(crossBtn);

        if (f.path === currfile) {
            div.style.backgroundColor = "cyan";
        }

        div.addEventListener('click', () => {
            setPaneFile(activePane, f.path, f.content);
        });

        crossBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            FilePaths = FilePaths.filter(file => file.path !== f.path);

            panes.forEach((pane) => {
                if (pane.path === f.path) {
                    const fallback = FilePaths[0];
                    pane.path = fallback ? fallback.path : "";
                    pane.editor.value = fallback ? fallback.content : "";
                    updatePaneTitle(pane);
                    updateLineNumbers(pane);
                }
            });

            if (currfile === f.path) {
                const fallback = activePane && activePane.path ? activePane : panes[0];
                currfile = fallback ? fallback.path : "";
            }

            updatesidebar();
        });

        filescontainer.appendChild(div);
    });
}

createSnapshot.addEventListener('click', async () => {
    if (!currfile || currfile.startsWith("untitled-")) return;
    persistPaneContent(activePane);
    await window.api.CreateSnapshot(activePane.editor.value, currfile);
});

getSnapshot.addEventListener('click', async () => {
    if (!currfile || currfile.startsWith("untitled-")) return;
    const snapshot = await window.api.RestoreSnapshot(currfile);

    if (snapshot !== undefined && snapshot !== null) {
        const file = getFile(currfile);
        if (file) file.content = snapshot;
        activePane.editor.value = snapshot;
        updateLineNumbers(activePane);
        syncPanesForFile(currfile);
        activePane.editor.focus();
    }
});

function updateLineNumbers(pane = activePane) {
    if (!pane) return;

    if (wordWrap) {
        let numbers = "";
        const lineCount = pane.editor.value.split("\n").length;
        for (let i = 1; i <= lineCount; i++) {
            numbers += i + ".\n";
        }
        pane.lines.textContent = numbers;
    } else {
        pane.lines.textContent = "";
    }
}

function autosave() {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    autoSaveTimer = setTimeout(() => {
        persistPaneContent(activePane);
        if (activePane) syncPanesForFile(activePane.path);
    }, 1000);
}

pin.addEventListener('click', async () => {
    const ispinned = await window.api.pin();
    pin.classList.toggle("is-active", ispinned);
});

window.electron.onFileOpened((files) => {
    if (files) {
        addFileEntry(files);
        setPaneFile(activePane, files.path, files.content);
    }
});

window.electron.onSave(handleSave);

function createUntitledFile() {
    untitledCount++;
    const virtualPath = `untitled-${untitledCount}`;
    const newFile = { path: virtualPath, content: "" };

    FilePaths.push(newFile);
    setPaneFile(activePane, virtualPath, "");
}

add.addEventListener('click', () => {
    createUntitledFile();
});

createPane();
createUntitledFile();

sidebarbtn.addEventListener('click', () => sidebar.classList.add("active"));
document.getElementById("close").addEventListener('click', () => sidebar.classList.remove("active"));
