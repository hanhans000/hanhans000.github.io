///

gsap.from(".a4", {
  opacity: 1,
  x: -200,
  duration: 2,
  delay: 0,
});

gsap.from(".a2", {
  opacity: 1,
  y: -1200,
  duration: 14,
  delay: 0,
});

gsap.from(".a1", {
  opacity: 1,
  x: -800,
  duration: 8,
  delay: 8,
});

/////

const toggleButton = document.getElementById("toggleButton");
const hiddenDiv = document.getElementById("gui");

toggleButton.addEventListener("change", function () {
  if (toggleButton.checked) {
    hiddenDiv.style.visibility = "hidden";
  } else {
    hiddenDiv.style.visibility = "visible";
  }
});

/////
const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");
let particles = [];
let maxTextWidth = 0.1 * canvas.width;
let particleColor = "#11ff00";
let particleSize = 10;
let particleOpacity = 0.4;

// Set canvas dimensions
function setCanvasDimensions() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  maxTextWidth = 0.1 * canvas.width;
  canvas.style.backgroundColor = "rgba(0, 0, 0, 0)";
}
setCanvasDimensions();

// Create particle class
class Particle {
  constructor(x, y, size, text) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = { x: -1 + Math.random() * 2, y: -1 + Math.random() * 2 };
    this.text = text;
    this.textColor = particleColor;
    this.textLines = this.wrapText();
    this.glowSize = 10;
  }

  // Update particle position
  update() {
    this.x += this.speed.x;
    this.y += this.speed.y;

    // Check particle boundaries
    if (
      this.x < -100 ||
      this.x > canvas.width + 100 ||
      this.y < -100 ||
      this.y > canvas.height + 100
    ) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
    }
  }

  // Draw particle
  draw() {
    ctx.font = `${this.size}px monospace`;
    ctx.fillStyle = this.textColor;
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowColor = this.textColor;
    ctx.globalAlpha = particleOpacity;
    for (let i = 0; i < this.textLines.length; i++) {
      ctx.fillText(this.textLines[i], this.x, this.y + i * (this.size + 2));
      ctx.fillText(
        this.textLines[i],
        this.x,
        this.y + i * (this.size + 2) - this.glowSize
      );
    }
  }

  // Wrap text into lines
  wrapText() {
    let words = this.text.split(" ");
    let lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      let word = words[i];
      let width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxTextWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }
}

// Create particles
function createParticles(text) {
  const newParticles = [];
  for (let i = 0; i < 30; i++) {
    newParticles.push(
      new Particle(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 10,
        text
      )
    );
  }
  particles = particles.concat(newParticles);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });
}

animate();

// Counter for tracking the number of submitted texts
const alertContainer = document.getElementById("alertContainer");
let textCounter = 0;
let alertShown = false;

// Add event listener to form submit button
document.getElementById("textForm").addEventListener("submit", (event) => {
  event.preventDefault();

  if (textCounter >= 4) {
    // If the user has already submitted four texts and the alert has not been shown, show the alert
    if (!alertShown) {
      const alertContainer = document.createElement("div");
      alertContainer.className = "alert-container";

      const alertBox = document.createElement("div");
      alertBox.className = "alert-box";
      alertBox.innerHTML =
        '<span> At this point, you reach a critical mental limit. </span> <span> Your brain shut all of your overthinking thoughts down.</span> <button class="alert-exit"> Go have fun </button> ';
      alertContainer.appendChild(alertBox);

      const alertExitButton = alertBox.querySelector(".alert-exit");
      alertExitButton.addEventListener("click", () => {
        alertContainer.style.display = "none";
      });

      document.body.appendChild(alertContainer);

      alertShown = true;
    }

    return;
  }

  const text = document.getElementById("textInput").value;
  createParticles(text);

  textCounter++;

  if (textCounter === 4) {
    // If the user has reached the maximum limit, disable the form or take any other action
    document.getElementById("textInput").disabled = true;
    document.getElementById("submit").disabled = true;
  }
});

// Add event listener to color picker
document.getElementById("colorPicker1").addEventListener("input", (event) => {
  particleColor = event.target.value;
  particles.forEach((particle) => {
    particle.textColor = particleColor;
  });
});

// Add event listener to window resize event
window.addEventListener("resize", () => {
  setCanvasDimensions();
});

// Add event listener to size range input
document.getElementById("sizeRange").addEventListener("input", (event) => {
  particleSize = parseInt(event.target.value);
  particles.forEach((particle) => {
    particle.size = particleSize;
  });
});

// Add event listener to opacity range input
document.getElementById("opacityRange").addEventListener("input", (event) => {
  particleOpacity = parseFloat(event.target.value);
  particles.forEach((particle) => {
    particle.opacity = particleOpacity;
  });
});

// Add event listener to refresh button
document.getElementById("refreshButton").addEventListener("click", () => {
  location.reload();
});

///draf
const container = document.querySelector(".container");
const draggables = container.querySelectorAll(".draggable");
let currentlyDragging = null;
let startingX, startingY, elementX, elementY;
let viewportWidth, viewportHeight;
const colorPicker1 = document.getElementById("colorPicker3");

draggables.forEach((draggable) => {
  draggable.addEventListener("mousedown", startDrag);
  draggable.addEventListener("mouseup", endDrag);
  draggable.addEventListener("touchstart", startDrag);
  draggable.addEventListener("touchend", endDrag);
});

function startDrag(e) {
  e.preventDefault();

  currentlyDragging = this;
  if (e.type === "touchstart") {
    startingX = e.touches[0].clientX;
    startingY = e.touches[0].clientY;
  } else {
    startingX = e.clientX;
    startingY = e.clientY;
  }
  elementX = this.offsetLeft;
  elementY = this.offsetTop;

  const rect = currentlyDragging.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  imageX = startingX - rect.width / 2 - containerRect.left;
  imageY = startingY - rect.height / 2 - containerRect.top;

  viewportWidth = container.clientWidth;
  viewportHeight = container.clientHeight;
}

function endDrag() {
  currentlyDragging = null;
}

document.addEventListener("mousemove", drag);
document.addEventListener("touchmove", drag);

function drag(e) {
  if (currentlyDragging) {
    e.preventDefault();

    if (e.type === "touchmove") {
      deltaX = e.touches[0].clientX - startingX;
      deltaY = e.touches[0].clientY - startingY;
    } else {
      deltaX = e.clientX - startingX;
      deltaY = e.clientY - startingY;
    }

    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    const elementWidth = currentlyDragging.offsetWidth;
    const elementHeight = currentlyDragging.offsetHeight;

    const maxLeft = Math.max(0, viewportWidth - elementWidth);
    const maxTop = Math.max(0, viewportHeight - elementHeight);

    newLeft = Math.max(0, Math.min(maxLeft, elementX + deltaX + scrollX));
    newTop = Math.max(0, Math.min(maxTop, elementY + deltaY + scrollY));

    currentlyDragging.style.left = newLeft + "px";
    currentlyDragging.style.top = newTop + "px";

    document.body.style.overflowX = "hidden";
    document.body.style.overflowY = "hidden";
  }
}

// Check if the colorPicker element exists
if (colorPicker1) {
  // Event listener for color picker change
  colorPicker1.addEventListener("input", () => {
    // Get the RGB values from the color picker
    const colorValue = colorPicker1.value;
    const redValue = parseInt(colorValue.substr(1, 2), 16);
    const greenValue = parseInt(colorValue.substr(3, 2), 16);
    const blueValue = parseInt(colorValue.substr(5, 2), 16);

    // Calculate the opacity value based on the average of RGB values
    const opacityValue = 1 - (redValue + greenValue + blueValue) / (3 * 255);
    const reversedOpacityValue = 1 - opacityValue;

    // Apply the opacity value to the draggable images
    draggables.forEach((draggable) => {
      const draggableImg = draggable.querySelector("img");
      draggableImg.style.opacity = reversedOpacityValue;
    });

    // Calculate the hue-rotate value based on the red value
    const hueRotateValue = Math.round((redValue / 255) * 360);

    // Apply the hue-rotate filter to the draggable images
    draggables.forEach((draggable) => {
      const draggableImg = draggable.querySelector("img");
      draggableImg.style.filter = `hue-rotate(${hueRotateValue}deg)`;
    });
  });
}

/////
var previousPattern = null;
var lines = [];
var numLines = 200;
var jellyColor = ""; // Global variable to store the jelly color
var latestColor = ""; // Global variable to store the latest color selected

function hexToRgb(hex) {
  // Remove the '#' character if present
  hex = hex.replace("#", "");

  // Extract the red, green, and blue components
  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);

  // Return an object with the RGB values
  return {
    r: r,
    g: g,
    b: b,
  };
}

function generateScribble() {
  var canvas = document.getElementById("scribbleCanvas");
  var context = canvas.getContext("2d");

  // Set canvas size to match the window size and device pixel ratio
  var dpr = window.devicePixelRatio || 1;
  var rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  context.scale(dpr, dpr);

  // Check if a previous pattern exists
  if (previousPattern !== null) {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the previous pattern
    context.putImageData(previousPattern, 0, 0);
  }

  // Generate random lines
  var startX = Math.random() * canvas.width;
  var startY = Math.random() * canvas.height;
  var angle = Math.random() * Math.PI * 2;
  var radius = 2;

  var colorInput = document.getElementById("colorPicker5");
  var color = colorInput.value;
  var rgb = hexToRgb(color);
  jellyColor = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 1)";

  // Update the latest color variable
  latestColor = jellyColor;

  for (var i = 0; i < numLines; i++) {
    var x1 = startX;
    var y1 = startY;
    var x2 = x1 + Math.sin(angle) * radius;
    var y2 = y1 + Math.cos(angle) * radius;

    var opacity = i / numLines;

    var line = {
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      color: latestColor, // Use the latest color for each line
      opacity: opacity,
    };

    lines.push(line);

    context.lineWidth = 1;
    context.lineJoin = "round";
    context.strokeStyle = latestColor; // Use the latest color for each line
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.globalAlpha = opacity;
    context.stroke();

    startX = x2;
    startY = y2;
    angle += Math.random() * 2 - 1;
    radius += Math.random() * 40 - 20;
    if (radius < 1) {
      radius = 1;
    } else if (radius > 20) {
      radius = 20; // Adjust max radius to control curviness
    }
  }

  previousPattern = context.getImageData(0, 0, canvas.width, canvas.height);
}
function changeColor() {
  //var colorInput = document.getElementById("colorPicker");
  //var color = colorInput.value;
  // var rgb = hexToRgb(color);
  latestColor = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 1)";

  var canvas = document.getElementById("scribbleCanvas");
  var context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var start = line.start;
    var end = line.end;
    line.color = latestColor; // Update the color property of the line object
    context.lineWidth = 1;
    context.lineJoin = "round";
    context.strokeStyle = latestColor; // Use the latest color
    context.globalAlpha = line.opacity;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  }
}

function changeBackground() {
  var colorInput = document.getElementById("colorPicker4");
  var color = colorInput.value;
  var canvas = document.getElementById("scribbleCanvas");
  canvas.style.backgroundColor = color;
}

// Generate initial scribble
generateScribble();

// Change color on input change
var colorPicker = document.getElementById("colorPicker5");
colorPicker.addEventListener("input", changeColor);

// Change background color on input change
var backgroundPicker = document.getElementById("colorPicker4");
backgroundPicker.addEventListener("input", changeBackground);

// Initial color change
changeColor();
changeBackground();

/////
function showAlert() {
  // Display the overlay and the pop-up box
  document.getElementById("overlay").style.display = "block";
  document.getElementById("popup").style.display = "block";
}

function hideAlert() {
  // Hide the overlay and the pop-up box
  document.getElementById("overlay").style.display = "none";
  document.getElementById("popup").style.display = "none";
}

/////

document.addEventListener(
  "touchmove",
  function (event) {
    if (event.scale !== 1) {
      event.preventDefault();
    }
  },
  { passive: false }
);
