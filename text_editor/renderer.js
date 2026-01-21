const open = document.getElementById('open');
const save = document.getElementById('save');
const editor = document.getElementById('editor');

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


















