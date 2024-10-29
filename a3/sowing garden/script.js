const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
let drawingData = []; // Store drawing data

document.addEventListener("DOMContentLoaded", function () {
  const plant = document.getElementById("plant");
  const waterButton = document.getElementById("waterButton");
  const lightButton = document.getElementById("lightButton");
  const tactileButton = document.getElementById("tactileButton");
  const resetButton = document.getElementById("resetButton");
  const stageDisplay = document.getElementById("stage");

  let currentStage = 1; // Plant starts at stage 1
  const maxStage = 5; // 5 stages of growth

  // Function to update the plant image based on the stage
  function updatePlantImage() {
    plant.src = `stage${currentStage}.png`; // Assuming images are named stage1.png, stage2.png, etc.
    stageDisplay.textContent = currentStage;
  }

  // Increment stage when interacting with plant
  function growPlant() {
    if (currentStage < maxStage) {
      currentStage++;
      updatePlantImage();
    }
  }

  // Reset the plant to stage 1
  function resetPlant() {
    currentStage = 1;
    updatePlantImage();
  }

  // Event listeners for buttons
  waterButton.addEventListener("click", growPlant);
  lightButton.addEventListener("click", growPlant);
  tactileButton.addEventListener("click", growPlant);
  resetButton.addEventListener("click", resetPlant);

  // Initialize the game
  updatePlantImage();
});

function adjustCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  redrawCanvas();
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Listen for resize events and adjust canvas size accordingly
window.addEventListener("resize", adjustCanvasSize);

window.addEventListener("resize", function () {
  adjustCanvasSize();
});

function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawingData.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  });
}

adjustCanvasSize(); // Call adjustCanvasSize initially to set canvas size

// Fisheye Effect
function drawFisheye() {
  fisheyeCtx.clearRect(0, 0, fisheyeCanvas.width, fisheyeCanvas.height);
  fisheyeCtx.drawImage(webcam, 0, 0, fisheyeCanvas.width, fisheyeCanvas.height);
  requestAnimationFrame(drawFisheye);
}

document.addEventListener("DOMContentLoaded", function () {
  const videoElement = document.getElementById("camera");
  const toggleCameraButton = document.getElementById("toggle-camera");

  // Function to turn on the camera
  function startCamera() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoElement.srcObject = stream;
        videoElement.style.display = "block"; // Display the video feed
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
        alert("Unable to access your camera. Please check permissions.");
      });
  }

  // Function to turn off the camera
  function stopCamera() {
    const stream = videoElement.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop()); // Stop all tracks (turns off the camera)
    }
    videoElement.srcObject = null;
    videoElement.style.display = "none"; // Hide the video feed
  }

  // Toggle the camera on or off
  let cameraIsOn = false;
  toggleCameraButton.addEventListener("click", function () {
    if (!cameraIsOn) {
      startCamera();
      toggleCameraButton.innerText = "Turn Off Camera";
      cameraIsOn = true;
    } else {
      stopCamera();
      toggleCameraButton.innerText = "Turn On Camera";
      cameraIsOn = false;
    }
  });
});
