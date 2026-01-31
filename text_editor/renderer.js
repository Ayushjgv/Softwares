const open = document.getElementById('open');
const save = document.getElementById('save');
const editor = document.getElementById('editor');
const lines = document.getElementById('lines');
const wrap = document.getElementById('wrap');
const sidebarbtn=document.getElementById('sidebarbtn');
const sidebar = document.getElementById('sidebar');
const pin=document.getElementById('pin');



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



editor.addEventListener("scroll", () => {
    lines.scrollTop = editor.scrollTop;
});


editor.addEventListener("input", updateLineNumbers);

updateLineNumbers();



//sidebar

sidebarbtn.addEventListener('click', () => {
    sidebar.classList.add("active");
});

document.getElementById("close").addEventListener('click', () => {
    sidebar.classList.remove("active");
});


//pinning

pin.addEventListener('click',async()=>{
    let ispinned = await window.api.pin();
    if(ispinned) pin.style.background="cyan";
    else pin.style.background="white";
});



//shortcut controls

window.electron.onFileOpened((filepath, content) => {
  editor.value = content;

  console.log("opened file path : ",filepath);
});


window.electron.onSave(async (filepath)=>{
    const data=editor.value;
    await window.api.saveFile(data);
});







