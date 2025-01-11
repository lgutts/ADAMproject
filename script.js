let isListening = false;
let audioContext = null;
let analyser = null;
let microphone = null;
let dataArray = null;
let decibelsSum = 0;
let decibelsCount = 0;

const meterElement = document.getElementById('meter');
const volumeBar = document.getElementById('volume-bar');
const decibelLevelDisplay = document.getElementById('decibel-level');
const decibelAverageDisplay = document.createElement('p'); // Create a new element for average display
meterElement.after(decibelAverageDisplay); // Place it right after the meter element
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');

// Calibration offset (this needs to be determined based on your environment and hardware)
const calibrationOffset = 70;

function startListening() {
    if (isListening) return;
    isListening = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    decibelsSum = 0; // Reset sum and count at the start
    decibelsCount = 0;
    decibelAverageDisplay.textContent = ''; // Clear the average display text

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.fftSize = 2048; // Use a larger FFT size for better accuracy
            const bufferLength = analyser.fftSize;
            dataArray = new Uint8Array(bufferLength);
            renderMeter();
        })
        .catch(err => {
            console.error('Access to microphone was denied!', err);
            isListening = false;
            startButton.disabled = false;
            stopButton.disabled = true;
        });
}

function stopListening() {
    if (!isListening) return;
    isListening = false;
    startButton.disabled = false;
    stopButton.disabled = true;

    if (microphone) microphone.disconnect();
    if (analyser) analyser.disconnect();
    if (audioContext) audioContext.close();
    volumeBar.style.height = '0px';
    decibelLevelDisplay.textContent = 'Decibels: 0 dB';

    // Calculate and display the average decibel level
    if (decibelsCount > 0) { // Avoid division by zero
        let averageDecibels = decibelsSum / decibelsCount;
        decibelAverageDisplay.textContent = `Average Decibels: ${Math.round(averageDecibels)} dB`;
    } else {
        decibelAverageDisplay.textContent = 'No average decibels to display.';
    }
}


function renderMeter() {
    if (!isListening) return;
    requestAnimationFrame(renderMeter);

    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        let sample = (dataArray[i] - 128) / 128.0; // Convert to [-1.0, 1.0]
        sum += sample * sample;
    }
    let rms = Math.sqrt(sum / dataArray.length);
    let decibels = 20 * Math.log10(rms) + calibrationOffset; // Apply calibration offset
    decibels = Math.min(Math.max(decibels, 0), 120); // Clamp the value between 0 and 120 dB

    let height = (decibels / 120) * 300; // Scale height based on 0-120 dB range
    volumeBar.style.height = `${height}px`;
    decibelLevelDisplay.textContent = `Decibels: ${Math.round(decibels)} dB`;

    // Dynamic gradient change based on decibel level
    let color = interpolateColor([0, 255, 0], [255, 0, 0], decibels / 120);
    volumeBar.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

    // Accumulate decibels for average calculation
    decibelsSum += decibels;
    decibelsCount++;
}

function interpolateColor(color1, color2, factor) {
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
}
function stopListening() {
  if (!isListening) return;
  isListening = false;
  startButton.disabled = false;
  stopButton.disabled = true;

  if (microphone) microphone.disconnect();
  if (analyser) analyser.disconnect();
  if (audioContext) audioContext.close();
  volumeBar.style.height = '0px';
  decibelLevelDisplay.textContent = 'Decibels: 0 dB';

  // Calculate and display the average decibel level
  if (decibelsCount > 0) { // Avoid division by zero
      let averageDecibels = decibelsSum / decibelsCount;
      decibelAverageDisplay.textContent = `Average Decibels: ${Math.round(averageDecibels)} dB`;
  } else {
      decibelAverageDisplay.textContent = 'No average decibels to display.';
  }
}
startButton.addEventListener('click', startListening);
stopButton.addEventListener('click', stopListening);

// Initialize buttons
startButton.disabled = false;
stopButton.disabled = true;

// Assuming existing setup from previous code snippets

const logsContainer = document.getElementById('logs'); // Get the logs container

function addLogEntry(averageDecibels) {
    // Create a new list item for the log entry
    const logEntry = document.createElement('li');
    logEntry.textContent = `Average Decibels: ${Math.round(averageDecibels)} dB - ${new Date().toLocaleTimeString()}`;
    logsContainer.insertBefore(logEntry, logsContainer.firstChild); // Insert at the top

    // Optional: Limit the number of log entries to keep the list manageable
    while (logsContainer.children.length > 10) {
        logsContainer.removeChild(logsContainer.lastChild);
    }
}

function stopListening() {
    if (!isListening) return;
    isListening = false;
    startButton.disabled = false;
    stopButton.disabled = true;

    if (microphone) microphone.disconnect();
    if (analyser) analyser.disconnect();
    if (audioContext) audioContext.close();
    volumeBar.style.height = '0px';
    decibelLevelDisplay.textContent = 'Decibels: 0 dB';

    // Calculate and display the average decibel level
    if (decibelsCount > 0) {
        let averageDecibels = decibelsSum / decibelsCount;
        decibelAverageDisplay.textContent = `Average Decibels: ${Math.round(averageDecibels)} dB`;
        addLogEntry(averageDecibels); // Log this reading
    } else {
        decibelAverageDisplay.textContent = 'No average decibels to display.';
    }
}
