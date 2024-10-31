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
  const completionModal = document.getElementById("completionModal"); // New completion modal
  const closeCompletionModal = document.getElementById("closeCompletionModal");

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
      // Trigger game completion popup if max stage is reached
      completionModal.style.display = "block";
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

  // Event listener for close button in completion modal
  closeCompletionModal.addEventListener("click", () => {
    completionModal.style.display = "none"; // Simply hide the modal
  });

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

const colorGradients = [
  ["#d48cad", "#b37694"], // Soft pink gradient
  ["#a65d88", "#8a4b6e"], // Deeper pink gradient
  ["#7d475c", "#64394a"], // Dark plum gradient
  ["#5e8b6e", "#4b725b"], // Forest green gradient
  ["#92b6a6", "#7ba08c"], // Mint green gradient
  ["#687a92", "#56627a"], // Slate blue gradient
  ["#3e5d6e", "#31485b"], // Dark teal gradient
];

let currentGradientIndex = 0;

function changeEnvironment() {
  const [lightColor, darkColor] = colorGradients[currentGradientIndex];
  document.getElementById(
    "game-container"
  ).style.background = `linear-gradient(145deg, ${lightColor}, ${darkColor})`;

  // Move to the next gradient in the array
  currentGradientIndex = (currentGradientIndex + 1) % colorGradients.length;
}

document
  .getElementById("changeEnvironment")
  .addEventListener("click", changeEnvironment);

let cameraIsOn = false; // Track camera state

function changeEnvironment() {
  const gameContainer = document.getElementById("game-container");

  if (cameraIsOn) {
    gameContainer.style.background = "transparent";
  } else {
    const [lightColor, darkColor] = colorGradients[currentGradientIndex];
    gameContainer.style.background = `linear-gradient(145deg, ${lightColor}, ${darkColor})`;
    currentGradientIndex = (currentGradientIndex + 1) % colorGradients.length;
  }
}

document
  .getElementById("changeEnvironment")
  .addEventListener("click", changeEnvironment);

const videoElement = document.getElementById("camera");
const toggleCameraButton = document.getElementById("toggle-camera");
const cameraModal = document.getElementById("cameraModal");
const closeModalButton = document.getElementById("closeModalButton");

function startCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      videoElement.srcObject = stream;
      videoElement.style.display = "block";
      cameraIsOn = true;
      changeEnvironment(); // Set background to transparent
      showCameraModal(); // Show the modal
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
    tracks.forEach((track) => track.stop());
  }
  videoElement.srcObject = null;
  videoElement.style.display = "none";
  cameraIsOn = false;
  changeEnvironment(); // Reapply gradient background
}

function showCameraModal() {
  cameraModal.style.display = "block";
}

// Close the modal when clicking the close button
closeModalButton.addEventListener("click", () => {
  cameraModal.style.display = "none";
});

toggleCameraButton.addEventListener("click", function () {
  if (!cameraIsOn) {
    startCamera();
    toggleCameraButton.innerText = "Turn Off Camera";
  } else {
    stopCamera();
    toggleCameraButton.innerText = "Turn On Camera";
  }
});

document.getElementById("captureMoment").addEventListener("click", function () {
  // Create an off-screen canvas to combine images
  const combinedCanvas = document.createElement("canvas");
  const combinedCtx = combinedCanvas.getContext("2d");

  // Set the canvas size to the game container size
  const gameContainer = document.getElementById("game-container");
  const plantContainer = document.getElementById("plant-container");
  combinedCanvas.width = gameContainer.offsetWidth;
  combinedCanvas.height = gameContainer.offsetHeight;

  // Draw the webcam feed onto the off-screen canvas
  const videoElement = document.getElementById("camera");
  combinedCtx.drawImage(
    videoElement,
    0,
    0,
    combinedCanvas.width,
    combinedCanvas.height
  );

  // Draw the plant image on top
  const plantImage = document.getElementById("plant");
  const plantX = (combinedCanvas.width - plantImage.width) / 2;
  const plantY = (combinedCanvas.height - plantImage.height) / 2;
  combinedCtx.drawImage(
    plantImage,
    plantX,
    plantY,
    plantImage.width,
    plantImage.height
  );

  // Convert the combined canvas to an image and download it
  const imageLink = document.createElement("a");
  imageLink.href = combinedCanvas.toDataURL("image/png");
  imageLink.download = "you_and_your_plants.png";
  imageLink.click();
});

document.addEventListener("DOMContentLoaded", function () {
  const lightButton = document.getElementById("lightButton");
  const plantImage = document.getElementById("plant");

  lightButton.addEventListener("click", () => {
    plantImage.classList.add("brighten-effect");

    // Remove the animation class after it completes to allow for re-triggering
    setTimeout(() => {
      plantImage.classList.remove("brighten-effect");
    }, 500); // Match the duration of the animation (0.5s)
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const lightButton = document.getElementById("lightButton");
  const waterButton = document.getElementById("waterButton");
  const touchButton = document.getElementById("tactileButton");
  const plantImage = document.getElementById("plant");

  // Light button effect
  lightButton.addEventListener("click", () => {
    console.log("Shine Light button clicked");
    plantImage.classList.add("brighten-effect");
    setTimeout(() => plantImage.classList.remove("brighten-effect"), 500);
  });

  // Water button ripple effect
  waterButton.addEventListener("click", () => {
    console.log("Water Plant button clicked");
    plantImage.classList.add("water-effect");
    setTimeout(() => plantImage.classList.remove("water-effect"), 700);
  });

  // Touch button shake effect
  touchButton.addEventListener("click", () => {
    console.log("Touch Plant button clicked");
    plantImage.classList.add("touch-effect");
    setTimeout(() => plantImage.classList.remove("touch-effect"), 400);
  });
});
