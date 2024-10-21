const canvas = document.getElementById("plantCanvas");
const ctx = canvas.getContext("2d");
const cameraButton = document.getElementById("toggle-camera");
const webcam = document.getElementById("camera");
const fisheyeCanvas = document.getElementById("fisheyeCanvas");
const fisheyeCtx = fisheyeCanvas.getContext("2d");

let plantSize = 50; // Initial size of the plant
let growthCount = 0;
let maxGrowth = 8; // Max growth stages
let isAlive = true;
let webcamStream = null;
let cameraOn = false;

// Initial plant rendering
function drawPlant(size) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, size, 0, Math.PI * 2);
  ctx.fillStyle = isAlive ? "#32CD32" : "#555";
  ctx.fill();
  ctx.closePath();
}

drawPlant(plantSize);

// Function to simulate plant growth
function growPlant(type) {
  if (!isAlive) {
    alert("The plant is dead. Reset to try again.");
    return;
  }

  if (growthCount < maxGrowth) {
    if (type === "water") {
      plantSize += 10;
    } else if (type === "light") {
      plantSize += 5;
    } else if (type === "sound") {
      plantSize += 8;
    } else if (type === "tactile") {
      plantSize += 3;
    }

    growthCount++;
    drawPlant(plantSize);
  } else {
    isAlive = false;
    drawPlant(plantSize);
    alert("The plant has died from overgrowth.");
  }
}

// Event Listeners for inputs
document
  .getElementById("waterButton")
  .addEventListener("click", () => growPlant("water"));
document
  .getElementById("lightButton")
  .addEventListener("click", () => growPlant("light"));
document
  .getElementById("soundInput")
  .addEventListener("change", () => growPlant("sound"));
document
  .getElementById("tactileButton")
  .addEventListener("click", () => growPlant("tactile"));

// Reset game
document.getElementById("resetButton").addEventListener("click", () => {
  isAlive = true;
  growthCount = 0;
  plantSize = 50;
  drawPlant(plantSize);
});

// Webcam Feature
cameraButton.addEventListener("click", () => {
  if (cameraOn) {
    stopCamera();
    cameraButton.textContent = "Turn On Camera";
  } else {
    startCamera();
    cameraButton.textContent = "Turn Off Camera";
  }
  cameraOn = !cameraOn;
});

function startCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } })
    .then((stream) => {
      webcamStream = stream;
      webcam.srcObject = stream;
      webcam.style.display = "block";
    })
    .catch((err) => {
      console.error("Error accessing camera: ", err);
    });
}

function stopCamera() {
  if (webcamStream) {
    let tracks = webcamStream.getTracks();
    tracks.forEach((track) => track.stop());
  }
  webcam.style.display = "none";
}

// Fisheye Effect
function drawFisheye() {
  fisheyeCtx.clearRect(0, 0, fisheyeCanvas.width, fisheyeCanvas.height);
  fisheyeCtx.drawImage(webcam, 0, 0, fisheyeCanvas.width, fisheyeCanvas.height);
  requestAnimationFrame(drawFisheye);
}

if (cameraOn) {
  drawFisheye();
}

function openPopup(popupId) {
  document.getElementById(popupId).style.display = "block";
}

function closePopup(popupId) {
  document.getElementById(popupId).style.display = "none";
}
