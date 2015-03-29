// Hacks to deal with different function names in different browsers
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback, element){
		window.setTimeout(callback, 1000 / 60);
	};
})();

window.AudioContext = (function(){
	return  window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
})();

// Random
/*
var image = ['sounds/comp8.wav', 'sounds/comp3.mp3', 'sounds/WET_SLOW.mp3'];
var x = Math.floor(image.length * Math.random())
*/
// END Random

// Global Variables for Audio
var audioContext,
	audioBuffer,
	sourceNode,
	analyserNode,
	javascriptNode,
	audioData = null,
	audioPlaying = false,
	sampleSize = 2048,      // number of samples to collect before analyzing FFT
	fftSize = 1024,         // must be power of two
	frequencyArray,         // array to hold frequency data

	// This must be hosted on the same server as this page - otherwise you get a Cross Site Scripting error
	audioUrl = "sounds/comp.wav";
	//audioUrl = image[x]; // Randomise?

// Global Variables for Drawing
	////// old scroll
	/*
	var column = 0;
	*/
	////// end old scroll
var	canvasWidth  = $("#canvas").width(),
	canvasHeight = $("#canvas").height(),
	ctx,

	// Uses the chroma.js library by Gregor Aisch to create a color gradient
	// download from https://github.com/gka/chroma.js
	// @link: http://jsfiddle.net/vis4/cYLZH/
		
	colorScale = chroma.scale(['#ffffe0', '#ffeec1', '#ffdda7', '#ffcb91', '#ffb880', '#ffa474', '#fe8f6a', '#f87d64', '#f06a5e', '#e65758', '#db4551', '#ce3447', '#c0223b', '#b0122c', '#9e051b', '#8b0000']).out('hex');
	//colorScale(0.5).hex();
		
$(document).ready(function() {
	// get the context from the canvas to draw on
	ctx = $("#canvas").get()[0].getContext("2d");

	// the AudioContext is the primary 'container' for all your audio node objects
	try {
		audioContext = new AudioContext();
	} catch(e) {
		alert('Web Audio API is not supported in this browser');
	}

	// When the Start button is clicked, finish setting up the audio nodes, play the sound and
	// gather samples for FFT frequency analysis, draw the spectrogram
	
	// $("#start").click(function(e) {
		// e.preventDefault();
		
		////// old scroll
		/*
		column = 0;
		*/
		////// end old scroll

		// Set up / reset the audio Analyser and Source Buffer
		setupAudioNodes();

		// setup the event handler that is triggered every time enough samples have been collected
		// trigger the audio analysis and draw one column in the display based on the results
		javascriptNode.onaudioprocess = function () {
			// get the Frequency Domain data for this sample
			analyserNode.getByteFrequencyData(frequencyArray);

			// draw one column of the spectrogram if the audio is playing
			if (audioPlaying == true) {
				requestAnimFrame(drawSpectrogram);
			}
		}

		// Load the Audio the first time through, otherwise play it from the buffer
		// Note that the audio load is asynchronous
		// @link: http://stackoverflow.com/questions/11304515/web-audio-api-noteon-after-noteoff-not-working
		// @link: http://www.html5rocks.com/en/tutorials/webaudio/intro/
		//
		// Further examples - just need to figure out where to hook these in...
		// @link: http://stackoverflow.com/questions/21413396/simple-oscillator-but-no-sound-with-web-audio-api-on-ios
		// @link: http://matt-harrison.com/perfect-web-audio-on-ios-devices-with-the-web-audio-api/ -- good
		if(audioData == null) {
			loadSound(audioUrl);
		} else {
			playSound(audioData);
		}
	//}); // end click

	// Stop the audio playing
	/*
	$("#stop").click(function(e) {
		e.preventDefault();
		sourceNode.stop(0);
		audioPlaying = false;
	});
	*/
});

function setupAudioNodes() {
	sourceNode = audioContext.createBufferSource();
	analyserNode = audioContext.createAnalyser();
	analyserNode.smoothingTimeConstant = 0; // The smoothingTimeConstant property's value defaults to 0.8; it must be in the range 0 to 1 (0 = pixelated 1 = smudged).
	analyserNode.fftSize = fftSize;
	javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1); // Create a ScriptProcessorNode with a bufferSize as set above and a single input and output channel

	// Create the array for the data values
	frequencyArray = new Uint8Array(analyserNode.frequencyBinCount);

	// Now connect the nodes together
	sourceNode.connect(audioContext.destination);
	sourceNode.connect(analyserNode);
	analyserNode.connect(javascriptNode);
	javascriptNode.connect(audioContext.destination);
}

// Load the sound from the URL only once and store it in global variable audioData
function loadSound(url) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

	// When loaded, decode the data and play the sound
	request.onload = function () {
		audioContext.decodeAudioData(request.response, function (buffer) {
			audioData = buffer;
			playSound(audioData);
		}, onError);
	}
	request.send();
}

// Play the sound with no delay and loop over the sample until stopped
function playSound(buffer) {
	sourceNode.buffer = buffer;
	sourceNode.start(0);    // Play the sound now
	// @link: http://codetheory.in/solve-your-game-audio-problems-on-ios-and-android-with-web-audio-api/
	//sourceNode.noteOn(0);
	sourceNode.loop = true;
	audioPlaying = true;
}

function onError(e) {
	console.log(e);
}

// Draw the Spectrogram from the frequency array
// The array has 1024 elements - but truncate at 512
function drawSpectrogram() {

	//// new scroll

	// create a temp canvas we use for copying
	var tempCanvas = document.createElement("canvas"),
		tempCtx = tempCanvas.getContext("2d");
	tempCanvas.width=canvasWidth;
	tempCanvas.height=canvasHeight;

	//// end new scroll

	for (var i = 0; i < frequencyArray.length; i++) {
		// Get the color from the color map, draw 1x1 pixel rectangle -- changes the density of the colorScale. High = subtle, low = intense.
		ctx.fillStyle = colorScale(frequencyArray[i] / 512.0); 
		
		////// old scroll
		/*
		ctx.fillRect(column, canvasHeight - i, 1, 1);
		*/
		////// end old scroll
		
		//// new scroll
		
		ctx.fillRect(canvasWidth - 1, canvasHeight - i, 1, 1);
		
		//// end new scroll
	}

	////// old scroll
	/*
	// loop around the canvas when we reach the end
	column += 1;
	if(column >= canvasWidth) {
		column = 0;
		clearCanvas();
	}
	*/
	////// end old scroll
	
	//// new scroll
	
	tempCtx.drawImage(canvas, 0, 0, canvasWidth, canvasHeight);
	// set translate on the canvas
	ctx.translate(-1, 0);
	// draw the copied image
	ctx.drawImage(tempCanvas, 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);

	// reset the transformation matrix
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	
	//// end new scroll
}

function clearCanvas() {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

/*
 * Other examples
 *
 * @link: https://github.com/borismus/spectrogram
 * @link: http://jlongster.com/The-Rise-of-the-Mobile-Web--and-Web-Audio-on-iOS-6-
 *
 * @search: html5 web audio ios
 */