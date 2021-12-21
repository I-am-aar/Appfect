// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const BrowserWindow = require('electron').remote.BrowserWindow
const path = require('path')

padBtn.addEventListener('click', function (event) {
  const modalPath = path.join('file://', __dirname, 'subWindows/pad.html')
  let padWindow = new BrowserWindow({ width: 800, height: 600, titleBarStyle: 'hidden-inset'})
  padWindow.on('close', function () { padWindow = null })
  padWindow.loadURL(modalPath)
  padWindow.show()
})

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var streamNode;
var masterNode;
var bypassNode;
var delayNode;
var feedbackNode;
var convolverNode; // reverb

// Delay effectinn
  navigator.mediaDevices.getUserMedia({audio: true})
  .then(stream => {

    //create an audio node from the stream
    delayStreamNode = audioCtx.createMediaStreamSource(stream);
    delayNode = audioCtx.createDelay(1);
    delayFeedbackNode = audioCtx.createGain();
    delayBypassNode = audioCtx.createGain();
    delayMasterNode = audioCtx.createGain();

    //controls
    delayNode.delayTime.value = parseFloat(delayTimer.value);
    delayFeedbackNode.gain.value = parseFloat(delayFeedback.value);
    delayMasterNode.gain.value = parseFloat(delayVolume.value);
    delayBypassNode.gain.value = 1;

    delayTimer.addEventListener("input", function() {
      delayNode.delayTime.value = parseFloat(delayTimer.value);
    });

    delayFeedback.addEventListener("input", function() {
      delayFeedbackNode.gain.value = parseFloat(delayFeedback.value);
    });

    delayVolume.addEventListener("input", function() {
      delayMasterNode.gain.value = parseFloat(delayVolume.value);
    });

    // function til að toggla on of off á effectinum
    var delayEvent = function() {
      if(delay.className == 'off') {
        delay.className="on";
        document.getElementById("delay").style.color = "#B6FF00";
        document.getElementById("delay").style.WebkitAnimation = "neon4 1.5s ease-in-out infinite alternate";
        delayStreamNode.connect(delayNode);
        delayNode.connect(delayFeedbackNode);
        delayFeedbackNode.connect(delayNode);

        delayNode.connect(delayBypassNode);
        delayBypassNode.connect(delayMasterNode);
        delayStreamNode.connect(delayMasterNode);
        delayMasterNode.connect(audioCtx.destination);
      } else if(delay.className == 'on') {
        delay.className="off";
        document.getElementById("delay").style.color = "#222";
        document.getElementById("delay").style.WebkitAnimation = "none";
        delayStreamNode.disconnect(delayNode);
        delayNode.disconnect(delayFeedbackNode);
        delayFeedbackNode.disconnect(delayNode);

        delayNode.disconnect(delayBypassNode);
        delayBypassNode.disconnect(delayMasterNode);
        delayStreamNode.disconnect(delayMasterNode);
        delayMasterNode.disconnect(audioCtx.destination);
      }
    }

    // function til þess að toggla on og off þegar ýtt er á W
    document.addEventListener("keydown", function(event) {
      if (event.keyCode == 87) {
        delayEvent();
      }
    });

    // virkja On/Off functionina on click
    delay.onclick = delayEvent;
  })


// Reverb effectinn
  navigator.mediaDevices.getUserMedia({audio: true})
  .then(stream => {
    reverbStreamNode = audioCtx.createMediaStreamSource(stream);
    reverbConvolverNode = audioCtx.createConvolver();
    reverbMasterNode = audioCtx.createGain();

    reverbMasterNode.gain.value = parseFloat(reverbVolume.value);

    reverbVolume.addEventListener("input", function() {
      reverbMasterNode.gain.value = parseFloat(reverbVolume.value);
    });

    // function til að toggla on of off á effectinum
    var reverbEvent = function() {
      if(reverb.className == 'off') {
        reverb.className="on";
        document.getElementById("reverb").style.color = "#B6FF00";
        document.getElementById("reverb").style.WebkitAnimation = "neon4 1.5s ease-in-out infinite alternate";
        reverbStreamNode.connect(reverbConvolverNode);
        reverbConvolverNode.connect(reverbMasterNode);
        reverbStreamNode.connect(reverbMasterNode);
        reverbMasterNode.connect(audioCtx.destination);
      } else if(reverb.className == 'on') {
        reverb.className="off";
        document.getElementById("reverb").style.color = "#222";
        document.getElementById("reverb").style.WebkitAnimation = "none";
        reverbStreamNode.disconnect(reverbConvolverNode);
        reverbConvolverNode.disconnect(reverbMasterNode);
        reverbStreamNode.disconnect(reverbMasterNode);
        reverbMasterNode.disconnect(audioCtx.destination);
      }
    }

    // function til þess að toggla on og off þegar ýtt er á P
    document.addEventListener("keydown", function(event) {
      if (event.keyCode == 89) {
        reverbEvent();
      }
    });

    reverb.onclick = reverbEvent;
  })

// Distortion effectinn
  navigator.mediaDevices.getUserMedia({audio: true})
  .then(stream => {
    distortionStreamNode = audioCtx.createMediaStreamSource(stream);
    distortionNode = audioCtx.createWaveShaper();
    distortionMasterNode = audioCtx.createGain();

    // Stal þessari function af frá Mozilla Developer Network, þetta er function til að breyta distortion curve fyrir Distortion effectin.
    // Er frekar langt frá því að skilja þessa function en hún virkar þannig að ég ætla að nota hana.
    function makeDistortionCurve(amount) {
      var k = typeof amount === 'number' ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180,
        i = 0,
        x;
      for ( ; i < n_samples; ++i ) {
        x = i * 2 / n_samples - 1;
        curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
      }
      return curve;
    };

    distortionNode.curve = makeDistortionCurve(parseInt(distortionCurve.value));

    distortionCurve.addEventListener("input", function() {
      distortionNode.curve = makeDistortionCurve(parseInt(distortionCurve.value));
    });

    distortionMasterNode.gain.value = parseFloat(distortionVolume.value);

    distortionVolume.addEventListener("input", function() {
      distortionMasterNode.gain.value = parseFloat(distortionVolume.value);
    });

    // function til að toggla on of off á effectinum
    var distortionEvent = function() {
      if(distortion.className == 'off') {
        distortion.className="on";
        document.getElementById("distortion").style.color = "#B6FF00";
        document.getElementById("distortion").style.WebkitAnimation = "neon4 1.5s ease-in-out infinite alternate";
        distortionStreamNode.connect(distortionNode);
        distortionNode.connect(distortionMasterNode);
        distortionStreamNode.connect(distortionMasterNode);
        distortionMasterNode.connect(audioCtx.destination)
      } else if(distortion.className == 'on') {
        distortion.className="off";
        document.getElementById("distortion").style.color = "#222";
        document.getElementById("distortion").style.WebkitAnimation = "none";
        distortionStreamNode.disconnect(distortionNode);
        distortionNode.disconnect(distortionMasterNode);
        distortionStreamNode.disconnect(distortionMasterNode);
        distortionMasterNode.disconnect(audioCtx.destination)
      }
    }

    // function til þess að toggla on og off þegar ýtt er á P
    document.addEventListener("keydown", function(event) {
      if (event.keyCode == 80) {
        distortionEvent();
      }
    });

    // virkja On/Off functionina on click
    distortion.onclick = distortionEvent;
  })
