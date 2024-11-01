// Main Canvas Setup: Canvas for drawing and potential customizations in future updates
// I intented to create a canvas for doing more like drawing on the plants or face filter but it required more external library, plus I need more time for that so I just keep it simple for this assignment
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
let drawingData = []; // Store drawing data (may expand to drawing interactions in future)

document.addEventListener("DOMContentLoaded", function () {
  // Key elements for interactions: Define primary buttons and elements
  const lightButton = document.getElementById("lightButton");
  const waterButton = document.getElementById("waterButton");
  const tactileButton = document.getElementById("tactileButton");
  const progressBar = document.getElementById("progress-bar"); // Progress bar showing interaction completeness
  const stageDisplay = document.getElementById("stage"); // Displays current growth stage
  const plantImage = document.getElementById("plant"); // Plant image that updates with growth stages
  const deathModal = document.getElementById("deathModal"); // Modal triggered if plant "dies"
  const resetButton = document.getElementById("resetButton"); // Reset game button
  const completionModal = document.getElementById("completionModal"); // Modal for end of game (max stage reached)
  const closeCompletionModal = document.getElementById("closeCompletionModal");

  // Controls plant stages and interaction tracking
  let currentStage = 1; // Starting stage of the plant
  const maxStage = 5; // The maximum achievable growth stage
  const interactions = { light: 0, water: 0, touch: 0 }; // Tracks each interaction to prevent over-care by limiting each type of interaction to once per stage.
  //Each time an interaction happens, the value of the corresponding property (like, light interaction) changes from 0 to 1. Once all three interactions are set to 1, the plant advances to the next stage.

  // The idea here is to encourage a balanced way of caring for the plant
  // rather than just spamming the same action over and over.

  // For example, if you try watering twice before you’ve moved to the next stage,
  // the game actually interprets that as over-caring, which results in the plant "dying."
  // This approach makes you think about giving balanced attention to each type of need:
  // light, water, and touch

  // Progress bar update function
  // Fills progress bar as interactions are completed, using visual feedback
  function updateProgressBar() {
    const interactionCount = Object.values(interactions).filter(
      (val) => val > 0
    ).length;
    const progressPercentage = (interactionCount / 3) * 100;
    // Progress bar fills 1/3 per interaction
    progressBar.style.width = `${progressPercentage}%`;
    // Adjust bar width dynamically

    // When all interactions for the stage are complete, it moves to next stage
    if (interactionCount === 3) {
      advanceStage(); // Proceed to next plant growth stage
    }
  }

  //Resets tracking of interactions per stage to allow new inputs for each growth stage
  function resetInteractions() {
    interactions.light = 0;
    interactions.water = 0;
    interactions.touch = 0;
    updateProgressBar();
    // Reset the progress bar for the next stage
  }

  // Advances plant growth by updating stage and image and resets interactions
  function advanceStage() {
    if (currentStage < maxStage) {
      currentStage++;
      stageDisplay.textContent = currentStage;
      // Update stage display
      plantImage.src = `stage${currentStage}.png`;
      // Load new image corresponding to growth stage
      resetInteractions();
      // Reset interactions for new stage start
    } else {
      // If max stage is reached, it triggers completion modal as final reward
      completionModal.style.display = "block";
    }
  }

  // If the plant is over-cared for, sets stage to "Dead" and shows death modal
  function triggerDeath() {
    currentStage = 0;
    // Set stage to dead
    plantImage.src = "dead_plant.png";
    // Display dead plant image
    stageDisplay.textContent = "Dead";
    // Clear stage number to signal plant is "Dead"
    deathModal.style.display = "block";
    // Show death modal
  }

  // Resets plant state and interactions for fresh start
  function resetPlant() {
    currentStage = 1;
    // Reset to stage 1
    resetInteractions();
    // Reset interactions to zero
    stageDisplay.textContent = currentStage;
    plantImage.src = `stage${currentStage}.png`;
    // Reset plant image to stage 1
    deathModal.style.display = "none";
    // Hide death modal
  }

  // Event listener for close button in completion modal
  closeCompletionModal.addEventListener("click", () => {
    completionModal.style.display = "none";
    // Simply hide the modal
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
  // The central idea is to replicate the simple satisfaction of watching something thrive under careful attention
  // emphasizing the message of patience and empathy in self-care, symbolized through plant care.
  // So I have made the feature of if people pressing so quick, its gonna trigger the death of the plants.

  // Event listeners for interactions
  // Each button linked to corresponding care action

  lightButton.addEventListener("click", () => handleInteraction("light"));
  waterButton.addEventListener("click", () => handleInteraction("water"));
  tactileButton.addEventListener("click", () => handleInteraction("touch"));

  resetButton.addEventListener("click", resetPlant);
  // Reset button to restart game

  resetButtonOverlay.addEventListener("click", resetPlant);
  // modal reset button overlay on top of all to rest the game

  // Reset function for the game
  function resetGarden() {
    currentStage = 1;
    stageDisplay.textContent = currentStage;
    plantImage.src = `stage${currentStage}.png`;
    resetInteractions();
    deathModal.style.display = "none";
    // Hide the death modal when reset
    lastInteractionType = "";
    // Clear last interaction type
  }

  // Event listener for the reset button in the overlay
  resetButtonOverlay.addEventListener("click", resetGarden);
  // Reset button on top of the original reset button and the death modal to restart game
  //As I have explained in the CSS code, this is the function for the overlay reset button

  // Initialize display
  stageDisplay.textContent = currentStage; // Initialize display for stage count
  plantImage.src = `stage${currentStage}.png`; // Load initial plant image
  updateProgressBar(); // Set initial progress bar to 0 width
});

// Adjusts canvas size for responsiveness
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
// debounce helps improve performance by reducing the number of times a function is called in response to these events

// Listen for resize events and adjust canvas size accordingly
window.addEventListener("resize", adjustCanvasSize);

window.addEventListener("resize", function () {
  adjustCanvasSize();
});

// This function clears the entire canvas, making it blank.
function redrawCanvas() {
  // The clearRect method clears a rectangular area on the canvas.
  // Starting point (0,0) is the top-left corner of the canvas.
  // canvas.width and canvas.height make sure we clear the entire canvas area.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
//like I've said, this is partly for my initial idea
//but I have associated the code with other elements so changing this would cause errors to the entire code

document.addEventListener("DOMContentLoaded", function () {
  const videoElement = document.getElementById("camera");
  const toggleCameraButton = document.getElementById("toggle-camera");
  const gameContainer = document.getElementById("game-container");

  // Start the camera feed
  function startCamera() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        // If permission is granted and feed is available
        videoElement.srcObject = stream;
        // Set the video element's source to the webcam feed
        videoElement.style.display = "block";
        // Make the video element visible
        gameContainer.style.backgroundColor = "transparent";
        // Make the game background transparent for better overlay of the video feed
        // I still want to keep the border's shadow cause I think it still suggest players where's they suppose to put their face in for the photobooth and it looks good
      })
      .catch((err) => {
        // If there's an error (like permission denied or no webcam)
        // Show an alert to inform the user of the issue
        console.error("Error accessing webcam:", err);
        alert("Unable to access your camera. Please check permissions.");
      });
  }

  // Stop camera feed
  function stopCamera() {
    // This function stops the webcam feed
    const stream = videoElement.srcObject; // Access the current stream from the video element
    if (stream) {
      // If there's an active stream
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      // Stop each track, effectively turning off the webcam
    }
    videoElement.srcObject = null;
    // Remove the stream from the video element
    videoElement.style.display = "none";
    // Hide the video element from view
    gameContainer.style.backgroundColor = "";
    // Restore the game background to its original color
  }

  // Toggle the camera on or off
  let cameraIsOn = false;
  // Track whether the camera is on or off

  // Add a click event to the toggle button to switch the camera on or off
  toggleCameraButton.addEventListener("click", function () {
    if (!cameraIsOn) {
      // If the camera is off, turn on the camera
      startCamera();
      toggleCameraButton.innerText = "Turn Off Camera";
      cameraIsOn = true;
    } else {
      stopCamera(); // Stop the camera
      toggleCameraButton.innerText = "Turn On Camera";
      // Update button text to show the next action
      cameraIsOn = false;
      // Update the state to reflect that the camera is now off
    }
  });
});

let currentSlide = 0;
// Start with the first slide

function showSlide(index) {
  const slides = document.querySelectorAll(".slide");
  //select all slide elements

  //loop through each slide and hide it initially by setting `display` to "none"
  slides.forEach((slide) => (slide.style.display = "none"));

  //display the slide corresponding to the given index
  slides[index].style.display = "block";

  //navigation buttons (Previous and Next)
  const prevButtons = document.querySelectorAll("#prevButton");
  const nextButtons = document.querySelectorAll("#nextButton");

  //if on the first slide, hide the Previous button; otherwise, show it
  prevButtons.forEach(
    (button) => (button.style.display = index === 0 ? "none" : "inline-block")
  );
  nextButtons.forEach(
    (button) =>
      (button.style.display =
        index === slides.length - 1 ? "none" : "inline-block")
  );
}
// if on the last slide, hide the Next button; otherwise, show it
function changeSlide(step) {
  // Select all slides
  // Calculate the new slide index by adding the step
  const slides = document.querySelectorAll(".slide");
  currentSlide = Math.min(Math.max(currentSlide + step, 0), slides.length - 1);
  showSlide(currentSlide);
}
// Display the slide at the new index
showSlide(currentSlide);
function togglePanel() {
  // Select the panel containing the introduce slider
  const introPanel = document.getElementById("introSliderPanel");
  // Check if the panel is currently hidden
  // Toggle the panel's visibility by shifting it up or down
  // Toggle button text to reflect current action (showing or hiding instructions)
  const isHidden = introPanel.style.transform === "translateY(-100%)";
  introPanel.style.transform = isHidden ? "translateY(0)" : "translateY(-100%)";
  togglePanelButton.textContent = isHidden
    ? "Hide Instructions"
    : "Show Instructions";
}

// Color-changing gradients for the game container background
//This is the extra feature for the player to customize their screen in the game to make it more interesting
const colorGradients = [
  ["#d48cad", "#b37694"],
  ["#a65d88", "#8a4b6e"],
  ["#7d475c", "#64394a"],
  ["#5e8b6e", "#4b725b"],
  ["#92b6a6", "#7ba08c"],
  ["#687a92", "#56627a"],
  ["#3e5d6e", "#31485b"],
];

let currentGradientIndex = 0;
// This starts the color gradient sequence from the first color set
function changeEnvironment() {
  const [lightColor, darkColor] = colorGradients[currentGradientIndex];
  // Pulls the next gradient colors from the array
  document.getElementById(
    "game-container"
  ).style.background = `linear-gradient(145deg, ${lightColor}, ${darkColor})`;

  // Moves to the next color set, looping back to the first set after reaching the end.
  currentGradientIndex = (currentGradientIndex + 1) % colorGradients.length;
}

document
  .getElementById("changeEnvironment")
  .addEventListener("click", changeEnvironment);

// Keeps track of the camera state: on or off
let cameraIsOn = false;
function changeEnvironment() {
  // First, we get the game container element
  const gameContainer = document.getElementById("game-container");
  // Selects the game container
  // If the camera is on, make the background transparent
  // If the camera is off, apply a gradient from the colorGradients array
  if (cameraIsOn) {
    gameContainer.style.background = "transparent";
  } else {
    const [lightColor, darkColor] = colorGradients[currentGradientIndex];
    gameContainer.style.background = `linear-gradient(145deg, ${lightColor}, ${darkColor})`;
    currentGradientIndex = (currentGradientIndex + 1) % colorGradients.length;
  }
  // I try to make it move to the next gradient color by updating the index and cycling back if the players reach the end
}
document
  .getElementById("changeEnvironment")
  .addEventListener("click", changeEnvironment);
// This sets up the button to change the environment each time it's clicked
const videoElement = document.getElementById("camera");
// The element where the camera feed will show up
const toggleCameraButton = document.getElementById("toggle-camera");
const cameraModal = document.getElementById("cameraModal");
// The element where the notifacation will show up
const closeModalButton = document.getElementById("closeModalButton");
// Starts the camera feed and shows it on the screen.

// Function to start the camera feed
function startCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    // Requests access to the video feed
    .then((stream) => {
      videoElement.srcObject = stream;
      // Assigns the camera stream to the video element
      videoElement.style.display = "block";
      cameraIsOn = true;
      changeEnvironment();
      // Sets the background to transparent
      // This is going to allow players to see their face when they sit in the middle
      showCameraModal();
      // Shows a message modal to guilde people throught the feature
    })
    .catch((err) => {
      console.error("Error accessing webcam:", err);
      alert("Unable to access your camera. Please check permissions.");
      // Notifies if the camera can’t be accessed
    });
}

//stopCamera() stops the video feed and hides it. It updates cameraIsOn back to false and resets the background to a gradient
function stopCamera() {
  const stream = videoElement.srcObject;
  if (stream) {
    const tracks = stream.getTracks();
    // Gets all tracks (video/audio) from the stream
    tracks.forEach((track) => track.stop());
  }
  videoElement.srcObject = null;
  videoElement.style.display = "none";
  cameraIsOn = false;
  changeEnvironment();
  // Calls `changeEnvironment()` to reset the background to a gradient
}

function showCameraModal() {
  cameraModal.style.display = "block";
}
//simply makes the camera modal visible to give the user a bit of guidance or information

// Close the modal when clicking the close button
closeModalButton.addEventListener("click", () => {
  cameraModal.style.display = "none";
});

toggleCameraButton.addEventListener("click", function () {
  if (!cameraIsOn) {
    startCamera();
    toggleCameraButton.innerText = "Turn Off Camera";
    // If the camera is off, start it
    // Updates the button text
  } else {
    stopCamera();
    toggleCameraButton.innerText = "Turn On Camera";
    // If the camera is on, stop it
    // Updates the button text
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

  // creating a "snapshot" that can capture you and the plant

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
  //this will captures the current state of the webcam feed along with an overlay image of a plant and places both on an off-screen canvas, which can then be saved as a combined image.
  // When combined, this off-screen canvas image can be used to create a snapshot showing both the webcam feed and the plant
  // positioned together on a single image

  // Convert the combined canvas to an image and download it
  const imageLink = document.createElement("a");
  imageLink.href = combinedCanvas.toDataURL("image/png");
  imageLink.download = "you_and_your_plants.png";
  imageLink.click();
});
//The "Capture Moment" button lets users save an image of the game container along with the camera feed and plant image
//It uses an off-screen canvas to combine the images, then generates a downloadable image

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

//the code creates unique animations for each button: brighten for light, ripple for water, and shake for touch
//each button temporarily applies its respective CSS class to the plant image and then removes it after a short delay
