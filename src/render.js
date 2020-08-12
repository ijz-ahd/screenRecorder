// importing desktop capturing method from electron
const { desktopCapturer,remote } = require('electron');

//to include native menu's 
const { Menu, dialog } = remote;

const {writeFile} = require('fs');
//reference to id's

const video = document.querySelector('video');
const startBtn = document.getElementById('startRec');
const stopBtn = document.getElementById('stopRec');
const videoSrc = document.getElementById('sourceSelect');


let recordedVideo = [];    
let videoSettings = 'video/webm; codecs=vp9'; 
let mediaRecorder;

// if(videoSrc) videoSrc.addEventListener('click', getVideoSources, false);
videoSrc.onclick = getVideoSources;

startBtn.onclick = (e) =>{
    mediaRecorder.start();
    startBtn.classList.add('is-danger');
    startBtn.innerText = 'Recording';
}

stopBtn.onclick = (e) =>{
    mediaRecorder.stop();
    startBtn.classList.remove('is-danger');
    startBtn.innerText = 'Start';
}

async function getVideoSources(){

    // selecting available video sources
    const inputVideoSrc = await desktopCapturer.getSources({
        types : ['window','screen']
    });

    //Selecting one source among available
    const VideoOptions =  Menu.buildFromTemplate(
     inputVideoSrc.map(source => {
         return {
         label : source.name,
         click : ()=> selectSource(source)
     };
    }
     )
    );

    VideoOptions.popup();
}

async function selectSource(src){
    videoSrc.innerText = src.name;

    // constraints for video to work
    let constraints = {
        audio:false,
        video:{
            mandatory:{
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: src.id
            }
        }
    };

    // To create a stream from browser navigator api

    let videoStream = await navigator.mediaDevices.getUserMedia(constraints);

    video.srcObject = videoStream;
    video.play();

    const options = { mimetype: videoSettings };
    mediaRecorder = new MediaRecorder(videoStream,options);

    mediaRecorder.ondataavailable = saveVideo;
    mediaRecorder.onstop = stopVideo;
}


function saveVideo(e){
    // console.log("file saved")
    recordedVideo.push(e.data);
}

async function stopVideo(e){
    const blob = new Blob(recordedVideo, {
        type: videoSettings
    });

    const buffer = Buffer.from(await blob.arrayBuffer());

    const { filePath } = await dialog.showSaveDialog({
        buttonLabel:'Save video',
        defaultPath: `vid-${Date.now()}.webm`
    });

    writeFile(filePath,buffer,()=>{
        console.log("File saved successfully");
    });

}