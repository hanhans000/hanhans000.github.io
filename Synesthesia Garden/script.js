// Create the basic Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("3d-scene").appendChild(renderer.domElement);

// Add a simple geometry (a placeholder for your 3D models)
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0xffc107 });
const sphere = new THREE.Mesh(geometry, material);

scene.add(sphere);
camera.position.z = 5;

let growthCount = 0;
let maxGrowth = 10; // Set max growth before the plant dies
let isAlive = true;

// Notification Function
function showNotification(message) {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.innerText = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000); // Remove after 3 seconds
}

// Function to animate the plant model
function animate() {
  requestAnimationFrame(animate);
  if (isAlive) {
    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;
  }
  renderer.render(scene, camera);
}

animate();

// Interactions: Update model based on user input
document.getElementById("sound-input").addEventListener("change", (e) => {
  growPlant("sound");
});

document.getElementById("light-input").addEventListener("input", (e) => {
  if (isAlive) {
    material.color.set(e.target.value); // Change color based on light input
  }
});

document.getElementById("tactile-button").addEventListener("click", (e) => {
  growPlant("tactile");
});

function growPlant(type) {
  if (!isAlive) {
    showNotification("The plant is dead. Restart to try again.");
    return;
  }

  if (growthCount < maxGrowth) {
    if (type === "sound") {
      sphere.scale.x += 0.1;
      sphere.scale.y += 0.1;
      sphere.scale.z += 0.1;
    } else if (type === "tactile") {
      sphere.scale.x += 0.05;
      sphere.scale.y += 0.05;
      sphere.scale.z += 0.05;
    }

    growthCount++;
  } else {
    // Plant dies if overgrown
    isAlive = false;
    material.color.set(0x222222); // Change color to gray to show it died
    showNotification("You pushed too hard, and the plant has died.");
  }
}

// Function to restart the garden (optional, you can add a button for this)
function restartGarden() {
  isAlive = true;
  growthCount = 0;
  sphere.scale.set(1, 1, 1); // Reset plant size
  material.color.set(0xffc107); // Reset to original color
}

let webcamStream;
const webcamElement = document.getElementById("webcam");
const toggleWebcamButton = document.getElementById("toggle-webcam");

// Function to turn the webcam on
function turnWebcamOn() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      webcamStream = stream;
      webcamElement.srcObject = stream;
      webcamElement.style.display = "block";
      toggleWebcamButton.innerText = "Turn Webcam Off";
    })
    .catch((err) => {
      console.error("Error accessing webcam: ", err);
      showNotification(
        "Unable to access the webcam. Please check permissions."
      );
    });
}

// Function to turn the webcam off
function turnWebcamOff() {
  if (webcamStream) {
    const tracks = webcamStream.getTracks();
    tracks.forEach((track) => track.stop()); // Stop all webcam tracks
    webcamElement.style.display = "none";
    toggleWebcamButton.innerText = "Turn Webcam On";
  }
}

// Toggle webcam on/off
toggleWebcamButton.addEventListener("click", () => {
  if (webcamElement.style.display === "none") {
    turnWebcamOn();
  } else {
    turnWebcamOff();
  }
});

// Notification function
function showNotification(message) {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.innerText = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000); // Remove after 3 seconds
}

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  // Browser supports getUserMedia
  // Now run the webcam logic
} else {
  showNotification("Your browser does not support webcam access.");
}
