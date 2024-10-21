const plants = document.querySelectorAll(".plant");
const submitButton = document.getElementById("waterBtn");
const messageInput = document.getElementById("messageInput");
const canvas = document.getElementById("waterEffect");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let waterEffect = [];
let growthFactor = 1;

function randomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

function growPlant(plant, growthFactor) {
  const newHeight = parseFloat(plant.style.height || "50") + growthFactor;
  plant.style.height = `${newHeight}px`;
  plant.style.width = `${newHeight}px`; // Keep it proportional
  plant.style.backgroundColor = randomColor();
}

function addWaterEffect() {
  const water = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 30 + 10,
    color: randomColor(),
  };
  waterEffect.push(water);
}

function drawWaterEffect() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  waterEffect.forEach((water, index) => {
    ctx.beginPath();
    ctx.arc(water.x, water.y, water.size, 0, Math.PI * 2);
    ctx.fillStyle = water.color;
    ctx.fill();
    ctx.closePath();

    water.size -= 0.5;
    if (water.size < 0) {
      waterEffect.splice(index, 1);
    }
  });
}

function animate() {
  drawWaterEffect();
  requestAnimationFrame(animate);
}

submitButton.addEventListener("click", () => {
  const messageData = messageInput.value.trim();
  if (messageData.length > 0) {
    growthFactor = messageData.length / 10; // Growth factor based on text length
    plants.forEach((plant) => {
      growPlant(plant, growthFactor);
    });
    addWaterEffect();
    messageInput.value = ""; // Clear the input after submission
  }
});

animate();
