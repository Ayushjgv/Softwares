// const camera = document.getElementById('camera');
const photo = document.getElementById('photo');
const canvas = document.getElementById("canvas");
const save = document.getElementById('save');
const slider=document.getElementById('slider');




let context = canvas.getContext("2d");
const camera = document.createElement("video");
camera.autoplay = true;
camera.playsInline = true;



let stream


//stream camera

async function startcamera(){
    try{
        stream= await navigator.mediaDevices.getUserMedia({
            video:true,
            audio:true
        });
        camera.srcObject = stream;
        camera.onloadedmetadata=()=>{
            canvas.width = camera.videoWidth;
            canvas.height = camera.videoHeight;
            drawFrame();
        };
    }
    catch (error){
        alert("Camera access denied or not available");
        console.log(error);
    }
}


startcamera();
function drawFrame() {
    context.drawImage(camera, 0, 0, canvas.width, canvas.height);
    //filter

    // blackWhiteFilter();
    blurFilter();
    requestAnimationFrame(drawFrame);
}


//take photo

photo.addEventListener('click',()=>{

    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    context.drawImage(camera,0,0,canvas.width,canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    console.log(dataUrl);

    //add to slider
    addToSlider(dataUrl);

    //save to gallary

    


});

//add to silder

function addToSlider(dataUrl) {

    const picture = document.createElement('div');

    picture.style.backgroundImage = 'url(' + dataUrl + ')';
    picture.style.backgroundSize = 'cover';
    picture.style.width = "150px";
    picture.style.height = "100px";
    picture.style.margin = "5px";
    picture.style.border = "1px solid white";

    picture.addEventListener('click',()=>{
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = "photo_" + Date.now() + ".png";
        link.click();
        link.remove();
    });

    slider.appendChild(picture);
}



//save photo


save.addEventListener('click',()=>{
    const canvasUrl=canvas.toDataURL('image/png');
    const createEl = document.createElement('a');
    createEl.href = canvasUrl;

    createEl.download = "canvas-image.png";

    createEl.click();

    createEl.remove();
});




//blackwhite filter

function blackWhiteFilter() {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    // console.log(imageData);
    let pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];
        let g = pixels[i + 1];
        let b = pixels[i + 2];

        let gray = (r + g + b) / 3;

        pixels[i] = gray;
        pixels[i + 1] = gray;
        pixels[i + 2] = gray;
    }
    context.putImageData(imageData, 0, 0);
}



//blur filter


// function blurFilter() {
//     let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
//     let pixels = imageData.data;

//     let temp = context.getImageData(0, 0, canvas.width, canvas.height).data;

//     const w = canvas.width;

//     for (let y = 1; y < canvas.height - 1; y++) {
//         for (let x = 1; x < canvas.width - 1; x++) {

//             let r = 0, g = 0, b = 0;

//             for (let ky = -1; ky <= 1; ky++) {
//                 for (let kx = -1; kx <= 1; kx++) {

//                     let idx = ((y + ky) * w + (x + kx)) * 4;

//                     r += temp[idx];
//                     g += temp[idx + 1];
//                     b += temp[idx + 2];
//                 }
//             }

//             let i = (y * w + x) * 4;

//             pixels[i]     = r / 90;
//             pixels[i + 1] = g / 9;
//             pixels[i + 2] = b / 9;
//         }
//     }

//     context.putImageData(imageData, 0, 0);
// }

function blurFilter() {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = imageData.data;

    let temp = context.getImageData(0, 0, canvas.width, canvas.height).data;

    const w = canvas.width;

    for (let y = 3; y < canvas.height - 3; y++) {
        for (let x = 3; x < canvas.width - 3; x++) {

            let r = 0, g = 0, b = 0;

            for (let ky = -3; ky <= 3; ky++) {
                for (let kx = -3; kx <= 3; kx++) {

                    let idx = ((y + ky) * w + (x + kx)) * 4;

                    r += temp[idx];
                    g += temp[idx + 1];
                    b += temp[idx + 2];
                }
            }

            let i = (y * w + x) * 4;

            pixels[i]     = r / 49;
            pixels[i + 1] = g / 49;
            pixels[i + 2] = b / 49;
        }
    }

    context.putImageData(imageData, 0, 0);
}
