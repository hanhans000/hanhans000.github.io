const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
let drawingData = []; // Store drawing data

document.addEventListener("DOMContentLoaded", function () {
  const plant = document.getElementById("plant");
  const waterButton = document.getElementById("waterButton");
  const resetButton = document.getElementById("resetButton");
  const stageDisplay = document.getElementById("stage");
  const deathModal = document.getElementById("deathModal");

  let currentStage = 1;
  const maxStage = 5;
  let lastWateringTime = 0;
  const overwateringThreshold = 1000; // 1 second threshold

  // Function to update the plant image based on the stage
  function updatePlantImage() {
    if (currentStage > 0) {
      plant.src = `stage${currentStage}.png`; // Assuming images are named stage1.png, stage2.png, etc.
      stageDisplay.textContent = currentStage;
    } else {
      plant.src = "dead_plant.png"; // Set to a "dead" plant image
      stageDisplay.textContent = "Dead";
      deathModal.style.display = "block"; // Show the death modal
    }
  }

  // Function to water the plant
  function waterPlant() {
    const currentTime = Date.now();

    // Check if watered too quickly (overwatering)
    if (currentTime - lastWateringTime < overwateringThreshold) {
      currentStage = 0; // Set stage to 0 to indicate the plant has died
    } else if (currentStage < maxStage) {
      currentStage++; // Advance the growth stage
    }

    updatePlantImage();
    lastWateringTime = currentTime; // Update the last watering time
  }

  // Reset the plant to stage 1
  function resetPlant() {
    currentStage = 1;
    watered = false;
    touched = false;
    lighted = false;
    updatePlantImage();
    deathModal.style.display = "none"; // Hide the death modal when reset
  }
  // Event listeners for buttons
  waterButton.addEventListener("click", waterPlant);
  resetButton.addEventListener("click", resetPlant);
  resetButtonoverlay.addEventListener("click", resetPlant);

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

const gameContainer = document.getElementById("game-container");
const changeEnvironmentButton = document.getElementById("changeEnvironment");

// Define an array of colors
const colors = [
  "#e8e4d9", // Light beige
  "#dcb8b2", // Sakura pink
  "#9d9087", // Taupe
  "#a33e36", // Deep red
  "#3c6e71", // Dark green
  "#556c76", // Slate blue
];
let currentSlide = 0; // Start with the first slide

function showSlide(index) {
  const slides = document.querySelectorAll(".slide");

  // Hide all slides
  slides.forEach((slide) => (slide.style.display = "none"));

  // Show the target slide
  slides[index].style.display = "block";

  // Manage visibility of Previous and Next buttons
  const prevButtons = document.querySelectorAll("#prevButton");
  const nextButtons = document.querySelectorAll("#nextButton");

  // Show or hide buttons based on current slide
  prevButtons.forEach(
    (button) => (button.style.display = index === 0 ? "none" : "inline-block")
  );
  nextButtons.forEach(
    (button) =>
      (button.style.display =
        index === slides.length - 1 ? "none" : "inline-block")
  );
}

function changeSlide(step) {
  const slides = document.querySelectorAll(".slide");
  currentSlide = Math.min(Math.max(currentSlide + step, 0), slides.length - 1);
  showSlide(currentSlide);
}

// Initialize the first slide
showSlide(currentSlide);

function togglePanel() {
  const introPanel = document.getElementById("introSliderPanel");
  const isHidden = introPanel.style.transform === "translateY(-100%)";
  introPanel.style.transform = isHidden ? "translateY(0)" : "translateY(-100%)";
  togglePanelButton.textContent = isHidden
    ? "Hide Instructions"
    : "Show Instructions";
}
