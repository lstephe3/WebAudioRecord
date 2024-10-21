const setupDiv = document.getElementById('setup');
const recordingDiv = document.getElementById('recording');
const gameContainerDiv = document.getElementById('game-container');
const startRecordingButton = document.getElementById('startRecording');
const recordingInstructions = document.getElementById('recordingInstructions');
const recordButton = document.getElementById('recordButton');
const stopButton = document.getElementById('stopButton');

let rootWords = [];
let affixWords = [];
let audioBlobs = {}; // Object to store audio blobs
let currentWordType = 'root'; // Start with recording root words
let currentWordIndex = 0;
let mediaRecorder;
let chunks = [];

// Function to start recording
function startRecording() {

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = e => chunks.push(e.data);
            mediaRecorder.onstop = e => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                console.log("Blob:", blob);
                // Store the blob in audioBlobs
                const wordKey = currentWordType === 'root' ? `root-${currentWordIndex}` : `affix-${currentWordIndex}`;
                audioBlobs[wordKey] = blob;
                
                // Reset for next recording
                chunks = [];

                currentWordIndex++;

                if (currentWordType === 'root' && currentWordIndex < gridSize.value) {
                    recordingInstructions.textContent = `Record root word ${currentWordIndex + 1}`;
                } else if (currentWordType === 'root') {
                    currentWordType = 'affix';
                    currentWordIndex = 0;
                    recordingInstructions.textContent = `Record affix word ${currentWordIndex + 1}`;
                } else if (currentWordType === 'affix' && currentWordIndex < gridSize.value) {
                    recordingInstructions.textContent = `Record affix word ${currentWordIndex + 1}`;
                } else {
                    // Recording is complete, proceed to game setup
                    recordingDiv.style.display = 'none';
                    gameContainerDiv.style.display = 'flex';
                    createTiles(); // (Implementation from previous response)
                }

            };
            mediaRecorder.start();
        })
        .catch(err => {
            console.error('Error accessing microphone:', err);
        });
}

// Function to stop recording
function stopRecording() {
    mediaRecorder.stop();
}

startRecordingButton.addEventListener('click', () => {
    setupDiv.style.display = 'none';
    recordingDiv.style.display = 'block';
    recordingInstructions.textContent = `Record root word ${currentWordIndex + 1}`;
    const gridSize = document.getElementById('gridSize').value; 
    
    // Start recording the first root word
    startRecording();
});

recordButton.addEventListener('click', () => {
    startRecording();
});

stopButton.addEventListener('click', () => {
    stopRecording();
});

// Function to create tiles and assign words (from previous responses)

function createTiles() {
    const rootWordsContainer = document.getElementById('root-words');
    const affixWordsContainer = document.getElementById('affix-words');
    const gridSize = document.getElementById('gridSize').value;
    const numRowsCols = Math.sqrt(gridSize); // Calculate number of rows/columns
    

    // Create root word tiles
    for (let i = 0; i < gridSize; i++) { // Assuming equal root and affix words
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.dataset.word = `root-${i}`;
        tile.dataset.audioBlob = URL.createObjectURL(audioBlobs[`root-${i}`]); 

        // Add image for root word
        const img = document.createElement('img');
        img.src = 'images/rootword.png';
        img.alt = 'Root Word';
        tile.appendChild(img);

        tile.addEventListener('click', () => handleTileClick(tile));
        rootWordsContainer.appendChild(tile);
    }

    // Create affix word tiles
    for (let i = 0; i < gridSize; i++) { // Assuming equal root and affix words
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.dataset.word = `affix-${i}`;
        tile.dataset.audioBlob = URL.createObjectURL(audioBlobs[`affix-${i}`]);

        // Add image for affix word
        const img = document.createElement('img');
        img.src = 'images/affixword.png';
        img.alt = 'Affix Word';
        tile.appendChild(img);

        tile.addEventListener('click', () => handleTileClick(tile));
        affixWordsContainer.appendChild(tile);
    }

    // Apply CSS Grid properties for layout
    rootWordsContainer.style.gridTemplateColumns = `repeat(${numRowsCols}, 1fr)`;
    rootWordsContainer.style.gridTemplateRows = `repeat(${numRowsCols}, 1fr)`;
    affixWordsContainer.style.gridTemplateColumns = `repeat(${numRowsCols}, 1fr)`;
    affixWordsContainer.style.gridTemplateRows = `repeat(${numRowsCols}, 1fr)`;
}



// Function to handle tile clicks (from previous responses)
function handleTileClick(tile) {
    const audioBlob = audioBlobs[tile.dataset.word]; // Get the original blob
    if (audioBlob) {
        const audioBlobUrl = URL.createObjectURL(audioBlob); // Create a new object URL
        const audio = new Audio(audioBlobUrl);
        audio.play();
        audio.muted = false; 
        audio.volume = 1.0; 

        // Revoke the object URL when audio finishes playing
        audio.onended = () => {
            URL.revokeObjectURL(audioBlobUrl); 
        };
    }
}

