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


