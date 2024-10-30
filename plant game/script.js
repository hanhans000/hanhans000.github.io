const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
let drawingData = [];

document.addEventListener("DOMContentLoaded", function () {
  const lightButton = document.getElementById("lightButton");
  const waterButton = document.getElementById("waterButton");
  const tactileButton = document.getElementById("tactileButton");
  const progressBar = document.getElementById("progress-bar");
  const stageDisplay = document.getElementById("stage");
  const plantImage = document.getElementById("plant");
  const deathModal = document.getElementById("deathModal");
  const resetButton = document.getElementById("resetButton");

  let currentStage = 1;
  const maxStage = 5;
  const interactions = { light: 0, water: 0, touch: 0 };

  function updateProgressBar() {
    const interactionCount = Object.values(interactions).filter(
      (val) => val > 0
    ).length;
    const progressPercentage = (interactionCount / 3) * 100;
    progressBar.style.width = `${progressPercentage}%`;

    // Advance stage if all interactions are complete
    if (interactionCount === 3) {
      advanceStage();
    }
  }

  function resetInteractions() {
    interactions.light = 0;
    interactions.water = 0;
    interactions.touch = 0;
    updateProgressBar(); // Reset the progress bar for the next stage
  }

  function advanceStage() {
    if (currentStage < maxStage) {
      currentStage++;
      stageDisplay.textContent = currentStage;
      plantImage.src = `stage${currentStage}.png`; // Update the plant image
      resetInteractions(); // Reset interactions for the next stage
    } else {
      console.log("Max growth stage reached.");
    }
  }

  function triggerDeath() {
    currentStage = 0;
    plantImage.src = "dead_plant.png";
    stageDisplay.textContent = "Dead";
    deathModal.style.display = "block"; // Show death modal
  }

  function resetPlant() {
    currentStage = 1;
    resetInteractions();
    stageDisplay.textContent = currentStage;
    plantImage.src = `stage${currentStage}.png`; // Reset plant image to stage 1
    deathModal.style.display = "none"; // Hide death modal
  }

  function handleInteraction(type) {
    if (interactions[type] > 0) {
      // If the same button is pressed twice, trigger death
      triggerDeath();
    } else {
      interactions[type] = 1;
      updateProgressBar();
    }
  }

  // Event listeners for interactions
  lightButton.addEventListener("click", () => handleInteraction("light"));
  waterButton.addEventListener("click", () => handleInteraction("water"));
  tactileButton.addEventListener("click", () => handleInteraction("touch"));

  resetButton.addEventListener("click", resetPlant);
  resetButtonOverlay.addEventListener("click", resetPlant); // For modal reset button

  // Reset function for the game
  function resetGarden() {
    currentStage = 1;
    stageDisplay.textContent = currentStage;
    plantImage.src = `stage${currentStage}.png`;
    resetInteractions();
    deathModal.style.display = "none"; // Hide the death modal when reset
    lastInteractionType = ""; // Clear last interaction type
  }

  // Event listener for the reset button in the overlay
  resetButtonOverlay.addEventListener("click", resetGarden);

  // Initialize display
  stageDisplay.textContent = currentStage;
  plantImage.src = `stage${currentStage}.png`; // Initial plant image
  updateProgressBar();
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
  const gameContainer = document.getElementById("game-container");

  function startCamera() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoElement.srcObject = stream;
        videoElement.style.display = "block"; // Show the video feed
        gameContainer.style.backgroundColor = "transparent"; // Hide background
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
        alert("Unable to access your camera. Please check permissions.");
      });
  }

  function stopCamera() {
    const stream = videoElement.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop()); // Stop all tracks
    }
    videoElement.srcObject = null;
    videoElement.style.display = "none"; // Hide the video feed
    gameContainer.style.backgroundColor = ""; // Reset to original background
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

// Define the color array for the environment
const colors = [
  "#dcb8b2", // Sakura pink
  "#9d9087", // Taupe
  "#a33e36", // Deep red
  "#3c6e71", // Dark green
  "#556c76", // Slate blue
];

// Counter to keep track of the current color
let colorIndex = 0;

// Function to change the environment color
function changeEnvironmentColor() {
  const gameContainer = document.getElementById("game-container");

  // Apply the current color to the game container
  gameContainer.style.backgroundColor = colors[colorIndex];

  // Move to the next color or loop back to the start
  colorIndex = (colorIndex + 1) % colors.length;
}

// Add event listener for the "Change Environment" button
const changeEnvironmentButton = document.getElementById("changeEnvironment");
changeEnvironmentButton.addEventListener("click", changeEnvironmentColor);
