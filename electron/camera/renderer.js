const camera = document.getElementById('camera');
const photo = document.getElementById('photo');
const canvas = document.getElementById("canvas");
const save = document.getElementById('save');
const slider=document.getElementById('slider');
console.log(slider);



let context = canvas.getContext("2d");




let stream


//stream camera

async function startcamera(){
    try{
        stream= await navigator.mediaDevices.getUserMedia({
            video:true,
            audio:false
        });

        camera.srcObject = stream;
    }
    catch (error){
        alert("Camera access denied or not available");
        console.log(error);
    }
}


startcamera();

//take photo

photo.addEventListener('click',()=>{

    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;

    context.drawImage(camera,0,0,canvas.width,canvas.height);
    const dataUrl = canvas.toDataURL('image/png');


    //add to slider
    addToSlider(dataUrl);


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
